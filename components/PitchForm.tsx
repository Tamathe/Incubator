"use client";

import { useState } from "react";

const ROLES = [
  "Undergrad student",
  "Graduate / Medical student",
  "Resident / Fellow",
  "Faculty",
  "Staff",
  "Community partner",
];

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

export default function PitchForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const body = {
      submitterName: String(fd.get("submitterName") ?? ""),
      submitterEmail: String(fd.get("submitterEmail") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      problem: String(fd.get("problem") ?? ""),
      affected: String(fd.get("affected") ?? ""),
      firstBuild: String(fd.get("firstBuild") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok && res.status !== 204) {
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setState("error");
    }
  }

  const submitted = state === "done";

  return (
    <div className="card" style={{ padding: 32 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Your name</label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="submitterName" placeholder="First Last" required />
              </div>
            </div>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Role (optional)</label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="role" list="pitch-roles" placeholder="Student / Faculty / Other" />
                <datalist id="pitch-roles">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </datalist>
              </div>
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Email</label>
            <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
              <input name="submitterEmail" type="email" placeholder="name@uky.edu" required />
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>The problem</label>
            <textarea
              name="problem"
              rows={3}
              required
              maxLength={2000}
              style={textareaStyle}
              placeholder="What's broken? Two to three sentences."
            />
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Who it affects</label>
            <textarea
              name="affected"
              rows={2}
              required
              maxLength={1000}
              style={textareaStyle}
              placeholder="Which patients, students, staff, or community."
            />
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>What you&apos;d build first</label>
            <textarea
              name="firstBuild"
              rows={3}
              required
              maxLength={2000}
              style={textareaStyle}
              placeholder="The smallest first thing that would prove or disprove the idea."
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
              disabled={state === "sending" || submitted}
              className={`btn lg ${submitted ? "" : "primary"}`}
              style={submitted ? { background: "var(--signal)", color: "var(--bg)", borderColor: "var(--signal)" } : undefined}
            >
              {submitted ? "Submitted ✓" : state === "sending" ? "Submitting…" : <>Submit pitch <span className="arrow">→</span></>}
            </button>
            <span className="small">We read every pitch. We&apos;ll be in touch within a week.</span>
          </div>
          {state === "error" && (
            <div className="small" style={{ color: "var(--danger, #c0392b)" }}>
              Something went wrong. Try again in a minute.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
