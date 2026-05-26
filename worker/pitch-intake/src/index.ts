import { Hono } from "hono";
import { cors } from "hono/cors";
import Anthropic from "@anthropic-ai/sdk";

type Bindings = {
  ANTHROPIC_API_KEY: string;
  RESEND_API_KEY: string;
  PITCH_TO_EMAIL: string;
  PITCH_FROM_EMAIL: string;
  ALLOWED_ORIGIN: string;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

const HAIKU = "claude-haiku-4-5-20251001";
const SONNET = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are the intake assistant for the AI Incubator at the University of Kentucky College of Medicine — a weekly working group building AI projects in healthcare and education.

Your job: help a visitor articulate their project pitch through a short, focused conversation. The output is a structured pitch document that the group lead reads to decide whether to invite them to Friday's meeting.

Walk through these five areas IN ORDER:
1. The problem they want to solve — concrete, specific. Push back on vagueness ONCE; if still vague, move on.
2. Who it affects — patients, clinicians, students, scale.
3. What they would build first — the minimum thing that would test the idea.
4. Who/what help they need — clinical input, engineering, design, data access, funding.
5. About them — name, UK email, role at UK (student, faculty, staff, etc.), rough availability.

Rules:
- One focused question per turn. Never more.
- At most ONE sharpening follow-up per area. Don't drill them.
- Warm and precise. No "great question!" filler. No "let's dive in." No emoji.
- Do NOT propose solutions or critique the idea. Help them articulate THEIR thinking.
- If they're stuck, offer ONE concrete example to unblock them (e.g., "for instance, a clinician once pitched a workflow that flagged X").
- At the end of EACH assistant message, include exactly: <step n="N" area="problem|audience|first_build|help_needed|about_you"/> where N is 1-5 reflecting the area you are CURRENTLY on. The frontend strips this tag before display.

Open with a brief warm intro (2 sentences max) and your first question about the problem.

When all five areas have enough detail to be useful, call the submit_pitch tool. Do not call it before all areas are covered, unless the user explicitly asks to submit what they have so far.`;

const SUBMIT_TOOL: Anthropic.Tool = {
  name: "submit_pitch",
  description: "Submit the completed pitch once all five areas are covered with enough detail.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Pitcher's name" },
      email: { type: "string", description: "Pitcher's UK email" },
      role: { type: "string", description: "Role at UK (e.g., 'M2 medical student', 'Faculty / EM', 'RN, Markey')" },
      availability: { type: "string", description: "Rough time commitment they can give" },
      problem: { type: "string", description: "The problem in 2-3 sentences" },
      audience: { type: "string", description: "Who it affects and how many" },
      first_build: { type: "string", description: "What the minimum testable version looks like" },
      help_needed: { type: "string", description: "What kind of collaborators or resources they need" },
    },
    required: ["name", "email", "role", "problem", "audience", "first_build", "help_needed"],
  },
};

const recentRequests = new Map<string, number[]>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (recentRequests.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) return false;
  recent.push(now);
  recentRequests.set(ip, recent);
  return true;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", async (c, next) => {
  return cors({
    origin: c.env.ALLOWED_ORIGIN || "*",
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })(c, next);
});

app.get("/", (c) => c.text("pitch-intake worker · POST /chat"));

app.post("/chat", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  if (!rateLimit(ip)) {
    return c.json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
  }

  let messages: ChatMessage[];
  try {
    const body = await c.req.json<{ messages: ChatMessage[] }>();
    messages = body.messages;
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return c.json({ error: "messages required" }, 400);
  }

  const anthropic = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const response = anthropic.messages.stream({
          model: HAIKU,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools: [SUBMIT_TOOL],
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "text", delta: event.delta.text });
          }
        }

        const finalMessage = await response.finalMessage();
        const toolUse = finalMessage.content.find(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
        );

        if (toolUse && toolUse.name === "submit_pitch") {
          send({ type: "submitting" });
          const pitch = toolUse.input as Record<string, string>;
          const summary = await polishPitch(anthropic, pitch);
          await sendEmail(c.env, pitch, summary);
          send({ type: "submitted" });
        } else {
          send({ type: "done" });
        }
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Worker error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

async function polishPitch(
  anthropic: Anthropic,
  pitch: Record<string, string>,
): Promise<string> {
  const result = await anthropic.messages.create({
    model: SONNET,
    max_tokens: 1024,
    system:
      "You write one-page pitch summaries for the group lead's triage at a small academic AI working group. Tight and factual. No marketing language, no exclamation marks, no 'exciting opportunity.' Use Markdown with these headers in order: Problem, Audience, First build, Help needed, About the pitcher. Each section: 2-4 sentences. Preserve the pitcher's specifics; do not invent or embellish.",
    messages: [
      {
        role: "user",
        content: `Polish this raw pitch intake into the one-pager:\n\n${JSON.stringify(pitch, null, 2)}`,
      },
    ],
  });
  const text = result.content.find((b) => b.type === "text");
  return text && text.type === "text"
    ? text.text
    : JSON.stringify(pitch, null, 2);
}

async function sendEmail(
  env: Bindings,
  pitch: Record<string, string>,
  summary: string,
): Promise<void> {
  const name = pitch.name ?? "Anonymous";
  const oneLiner = (pitch.problem ?? "new pitch").slice(0, 80).replace(/\s+/g, " ");
  const partial = !pitch.email || pitch.email === "unknown" ? " [partial]" : "";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.PITCH_FROM_EMAIL,
      to: [env.PITCH_TO_EMAIL],
      reply_to: pitch.email && pitch.email !== "unknown" ? pitch.email : undefined,
      subject: `Pitch · ${name} · ${oneLiner}${partial}`,
      text: `${summary}\n\n---\nRaw fields:\n${JSON.stringify(pitch, null, 2)}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed: ${res.status} ${body}`);
  }
}

export default app;
