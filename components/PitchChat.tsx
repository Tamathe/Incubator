"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

type Status =
  | { kind: "boot" }
  | { kind: "streaming" }
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "submitted" }
  | { kind: "error"; message: string };

const WORKER_URL = process.env.NEXT_PUBLIC_PITCH_WORKER_URL ?? "";

const AREAS = [
  { key: "problem", label: "Problem" },
  { key: "audience", label: "Audience" },
  { key: "first_build", label: "Build" },
  { key: "help_needed", label: "Help" },
  { key: "about_you", label: "About you" },
] as const;

const STEP_TAG = /<step\s+n="(\d+)"\s+area="([^"]+)"\s*\/>/;

function stripStepTag(content: string): { area: string | null; clean: string } {
  const match = content.match(STEP_TAG);
  if (!match) return { area: null, clean: content };
  return { area: match[2], clean: content.replace(STEP_TAG, "").trim() };
}

const KICKOFF: Message = {
  role: "user",
  content: "Hi — I'd like to pitch an idea.",
};

const SKIP_MESSAGE: Message = {
  role: "user",
  content:
    "I'd like to submit what we have so far. Please call submit_pitch immediately with whatever fields are filled in from our conversation. Use 'unknown' for any field without explicit data.",
};

export default function PitchChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "boot" });
  const [currentArea, setCurrentArea] = useState<string>("problem");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    if (!WORKER_URL) {
      setStatus({
        kind: "error",
        message:
          "Pitch intake isn't configured yet. Set NEXT_PUBLIC_PITCH_WORKER_URL and redeploy.",
      });
      return;
    }
    void send([KICKOFF], { hideUser: true });
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  async function send(
    next: Message[],
    opts: { hideUser?: boolean } = {},
  ): Promise<void> {
    const visible = opts.hideUser ? next.slice(0, -1) : next;
    setMessages([...visible, { role: "assistant", content: "" }]);
    setStatus({ kind: "streaming" });

    let assistantText = "";

    try {
      const res = await fetch(`${WORKER_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Intake worker returned ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: { type: string; delta?: string; message?: string };
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.type === "text" && event.delta) {
            assistantText += event.delta;
            const { area, clean } = stripStepTag(assistantText);
            if (area) setCurrentArea(area);
            setMessages((prev) => {
              const out = [...prev];
              out[out.length - 1] = { role: "assistant", content: clean };
              return out;
            });
          } else if (event.type === "submitting") {
            setStatus({ kind: "submitting" });
          } else if (event.type === "submitted") {
            setStatus({ kind: "submitted" });
            // Stash the full final conversation so it survives a state reset
            setMessages((prev) => {
              const trimmed = stripStepTag(assistantText).clean;
              const out = [...prev];
              out[out.length - 1] = { role: "assistant", content: trimmed };
              return out;
            });
            return;
          } else if (event.type === "error") {
            throw new Error(event.message ?? "Intake error");
          }
        }
      }

      setStatus({ kind: "idle" });
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status.kind === "streaming" || status.kind === "submitting")
      return;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setInput("");
    void send(next);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  function handleSkip() {
    if (status.kind === "streaming" || status.kind === "submitting") return;
    void send([...messages, SKIP_MESSAGE]);
  }

  if (status.kind === "submitted") {
    return (
      <div className="pitch-success">
        <div className="eyebrow" style={{ color: "var(--signal)" }}>
          Submitted ✓
        </div>
        <h2 className="h2" style={{ marginTop: 12 }}>
          The pitch is in.
        </h2>
        <p className="body" style={{ marginTop: 14, maxWidth: "52ch" }}>
          The group lead reads every pitch and will be in touch within a few
          days. If it&apos;s a fit, you&apos;ll get an invite to the next Friday
          meeting to share it with the group.
        </p>
        <p className="small" style={{ marginTop: 18 }}>
          Questions in the meantime? <a href="mailto:incubator@uky.edu">incubator@uky.edu</a>
        </p>
      </div>
    );
  }

  const isBusy = status.kind === "streaming" || status.kind === "submitting";
  const lastMsg = messages[messages.length - 1];
  const showTypingDots =
    status.kind === "streaming" &&
    lastMsg?.role === "assistant" &&
    lastMsg.content.length === 0;

  return (
    <div className="pitch-chat">
      <div className="pitch-step-bar" role="status" aria-live="polite">
        {AREAS.map((area, i) => {
          const activeIdx = AREAS.findIndex((a) => a.key === currentArea);
          const state =
            i < activeIdx ? "done" : i === activeIdx ? "current" : "upcoming";
          return (
            <div className={`pitch-step pitch-step--${state}`} key={area.key}>
              <span className="pitch-step-n mono">0{i + 1}</span>
              <span className="pitch-step-l">{area.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pitch-thread" ref={threadRef}>
        {messages.map((m, i) => (
          <div className={`pitch-msg pitch-msg--${m.role}`} key={i}>
            {m.role === "assistant" && (
              <div className="pitch-msg-from mono">Intake</div>
            )}
            <div className="pitch-msg-body">
              {m.content || (showTypingDots && i === messages.length - 1 ? (
                <span className="pitch-typing" aria-label="Intake is typing">
                  <span />
                  <span />
                  <span />
                </span>
              ) : null)}
            </div>
          </div>
        ))}
        {status.kind === "submitting" && (
          <div className="pitch-msg pitch-msg--system">
            <div className="pitch-msg-body mono">
              Polishing your pitch and sending it…
            </div>
          </div>
        )}
        {status.kind === "error" && (
          <div className="pitch-msg pitch-msg--error">
            <div className="pitch-msg-body">
              Something went wrong: {status.message}
              <br />
              <a href="mailto:incubator@uky.edu">Email us</a> instead and
              we&apos;ll take it from there.
            </div>
          </div>
        )}
      </div>

      <form className="pitch-input-row" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isBusy ? "Hold on…" : "Type your answer (Enter to send · Shift+Enter for newline)"
          }
          rows={2}
          disabled={isBusy || status.kind === "error"}
        />
        <button
          type="submit"
          className="btn primary"
          disabled={!input.trim() || isBusy || status.kind === "error"}
        >
          Send <span className="arrow">→</span>
        </button>
      </form>

      <div className="pitch-skip">
        <button
          type="button"
          onClick={handleSkip}
          disabled={isBusy || status.kind === "error" || messages.length < 3}
        >
          Skip ahead — submit what I have
        </button>
        <span className="small">
          You can send a partial pitch any time after the first couple of
          questions.
        </span>
      </div>
    </div>
  );
}
