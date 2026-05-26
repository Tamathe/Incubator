"use client";

import { useState } from "react";

const MOTIVATIONS = [
  "Curious about the group",
  "Have a problem to pitch",
  "Want to join a team",
  "Looking to collaborate (faculty)",
  "Bringing a colleague",
];

const ROLES = [
  "Undergrad student",
  "Graduate / Medical student",
  "Resident / Fellow",
  "Faculty",
  "Staff",
  "Community partner",
];

export default function RsvpForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  function togglePick(m: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      motivations: Array.from(picked),
      note: String(fd.get("note") ?? "") || undefined,
      joinListserv: fd.get("joinListserv") === "on",
      website: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/rsvp", {
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
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
              Your name
            </label>
            <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
              <input name="name" placeholder="First Last" required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
                UK email
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="email" type="email" placeholder="name@uky.edu" required />
              </div>
            </div>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
                Role
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="role" list="roles" placeholder="Student / Faculty / Other" />
                <datalist id="roles">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </datalist>
              </div>
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
              What brings you in?
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MOTIVATIONS.map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`filter-chip ${picked.has(m) ? "active" : ""}`}
                  onClick={() => togglePick(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
              Anything else?{" "}
              <span style={{ color: "var(--ink-4)", textTransform: "none", letterSpacing: 0 }}>
                (optional)
              </span>
            </label>
            <textarea
              name="note"
              rows={3}
              style={{
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
              }}
              placeholder="What you're working on, what you'd like help with, what you can contribute."
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-3)" }}>
            <input type="checkbox" id="ls" name="joinListserv" defaultChecked style={{ accentColor: "var(--accent)" }} />
            <label htmlFor="ls">Add me to the weekly listserv</label>
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
              {submitted ? "Confirmed ✓" : state === "sending" ? "Sending…" : <>RSVP for Friday <span className="arrow">→</span></>}
            </button>
            <span className="small">We&apos;ll never share your email.</span>
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
