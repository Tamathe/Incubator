"use client";

import { useState } from "react";

const ROLES = [
  "Undergraduate student",
  "Graduate student",
  "Faculty",
  "Staff",
  "Researcher",
  "Community partner",
  "Campus leader",
];

type PitchBody = {
  submitterName: string;
  submitterEmail: string;
  role?: string;
  problem: string;
  affected: string;
  firstBuild: string;
  website: string;
};

type FormState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error"; mailtoHref: string };

const textareaStyle: React.CSSProperties = {
  width: "100%",
  resize: "vertical",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "12px 16px",
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

function buildPitchEmail(body: PitchBody) {
  const subject = `AI Incubator pitch: ${body.problem.slice(0, 72)}`;
  const message = [
    `Name: ${body.submitterName}`,
    `Email: ${body.submitterEmail}`,
    `Role: ${body.role || "Not specified"}`,
    "",
    "Problem:",
    body.problem,
    "",
    "Who it affects:",
    body.affected,
    "",
    "What I would build first:",
    body.firstBuild,
  ].join("\n");

  return `mailto:incubator@uky.edu?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(message)}`;
}

export default function PitchForm() {
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: PitchBody = {
      submitterName: String(fd.get("submitterName") ?? ""),
      submitterEmail: String(fd.get("submitterEmail") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      problem: String(fd.get("problem") ?? ""),
      affected: String(fd.get("affected") ?? ""),
      firstBuild: String(fd.get("firstBuild") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    const mailtoHref = buildPitchEmail(body);

    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok && res.status !== 204) {
        setState({ kind: "error", mailtoHref });
        return;
      }
      setState({ kind: "done" });
    } catch {
      setState({ kind: "error", mailtoHref });
    }
  }

  const submitted = state.kind === "done";
  const sending = state.kind === "sending";

  return (
    <div className="card" style={{ padding: 32 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 18 }}>
          <div className="form-two-grid">
            <div>
              <label
                className="eyebrow"
                style={{ display: "block", marginBottom: 8 }}
              >
                Your name
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="submitterName" placeholder="First Last" required />
              </div>
            </div>
            <div>
              <label
                className="eyebrow"
                style={{ display: "block", marginBottom: 8 }}
              >
                Role (optional)
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input
                  name="role"
                  list="pitch-roles"
                  placeholder="Student / Faculty / Staff"
                />
                <datalist id="pitch-roles">
                  {ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </datalist>
              </div>
            </div>
          </div>
          <div>
            <label
              className="eyebrow"
              style={{ display: "block", marginBottom: 8 }}
            >
              Email
            </label>
            <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
              <input
                name="submitterEmail"
                type="email"
                placeholder="name@uky.edu"
                required
              />
            </div>
          </div>
          <div>
            <label
              className="eyebrow"
              style={{ display: "block", marginBottom: 8 }}
            >
              The problem
            </label>
            <textarea
              name="problem"
              rows={3}
              required
              maxLength={2000}
              style={textareaStyle}
              placeholder="What is stuck? Two to three sentences."
            />
          </div>
          <div>
            <label
              className="eyebrow"
              style={{ display: "block", marginBottom: 8 }}
            >
              Who it affects
            </label>
            <textarea
              name="affected"
              rows={2}
              required
              maxLength={1000}
              style={textareaStyle}
              placeholder="Which students, staff, faculty, teams, or communities feel it?"
            />
          </div>
          <div>
            <label
              className="eyebrow"
              style={{ display: "block", marginBottom: 8 }}
            >
              What you would build first
            </label>
            <textarea
              name="firstBuild"
              rows={3}
              required
              maxLength={2000}
              style={textareaStyle}
              placeholder="What is the smallest useful version you could test?"
            />
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="submit"
              disabled={sending || submitted}
              className={`btn lg ${submitted ? "" : "primary"}`}
              style={
                submitted
                  ? {
                      background: "var(--signal)",
                      color: "var(--bg)",
                      borderColor: "var(--signal)",
                    }
                  : undefined
              }
            >
              {submitted
                ? "Submitted"
                : sending
                  ? "Submitting..."
                  : (
                      <>
                        Submit pitch <span className="arrow">-&gt;</span>
                      </>
                    )}
            </button>
          </div>
          {state.kind === "error" && (
            <div
              className="small"
              role="alert"
              style={{ color: "var(--danger, #c0392b)", lineHeight: 1.6 }}
            >
              The site could not save the pitch just now.{" "}
              <a href={state.mailtoHref}>Open an email draft instead</a>.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
