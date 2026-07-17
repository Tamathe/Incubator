"use client";

import { useState } from "react";

const MOTIVATIONS = [
  "Curious about the group",
  "Have a problem to pitch",
  "Want to join a team",
  "Looking to collaborate",
  "Bringing a colleague",
];

const ROLES = [
  "Undergraduate student",
  "Graduate student",
  "Faculty",
  "Staff",
  "Researcher",
  "Community partner",
  "Campus leader",
];

type RsvpBody = {
  name: string;
  email: string;
  role?: string;
  motivations: string[];
  note?: string;
  joinListserv: boolean;
  website: string;
};

type RsvpState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error"; mailtoHref: string };

function buildRsvpEmail(body: RsvpBody) {
  const message = [
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    `Role: ${body.role || "Not specified"}`,
    `Join listserv: ${body.joinListserv ? "Yes" : "No"}`,
    "",
    "What brings me in:",
    body.motivations.length ? body.motivations.join(", ") : "Not specified",
    "",
    "Note:",
    body.note || "Not specified",
  ].join("\n");

  return `mailto:incubator@uky.edu?subject=${encodeURIComponent(
    "AI Incubator Friday RSVP",
  )}&body=${encodeURIComponent(message)}`;
}

export default function RsvpForm() {
  const [state, setState] = useState<RsvpState>({ kind: "idle" });
  const [picked, setPicked] = useState<Set<string>>(new Set());

  function togglePick(motivation: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(motivation)) next.delete(motivation);
      else next.add(motivation);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: RsvpBody = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      motivations: Array.from(picked),
      note: String(fd.get("note") ?? "") || undefined,
      joinListserv: fd.get("joinListserv") === "on",
      website: String(fd.get("website") ?? ""),
    };
    const mailtoHref = buildRsvpEmail(body);

    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/rsvp", {
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
          <div>
            <label
              htmlFor="rsvp-name"
              className="eyebrow"
              style={{ display: "block", marginBottom: 8 }}
            >
              Your name
            </label>
            <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
              <input
                id="rsvp-name"
                name="name"
                placeholder="First Last"
                required
              />
            </div>
          </div>
          <div className="form-two-grid">
            <div>
              <label
                htmlFor="rsvp-email"
                className="eyebrow"
                style={{ display: "block", marginBottom: 8 }}
              >
                UK email
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input
                  id="rsvp-email"
                  name="email"
                  type="email"
                  placeholder="name@uky.edu"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="rsvp-role"
                className="eyebrow"
                style={{ display: "block", marginBottom: 8 }}
              >
                Role
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input
                  id="rsvp-role"
                  name="role"
                  list="roles"
                  placeholder="Student / Faculty / Other"
                />
                <datalist id="roles">
                  {ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </datalist>
              </div>
            </div>
          </div>
          <div>
            <label
              id="rsvp-motivations-label"
              className="eyebrow"
              style={{ display: "block", marginBottom: 8 }}
            >
              What brings you in?
            </label>
            <div
              role="group"
              aria-labelledby="rsvp-motivations-label"
              style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
            >
              {MOTIVATIONS.map((motivation) => (
                <button
                  type="button"
                  key={motivation}
                  className={`filter-chip ${
                    picked.has(motivation) ? "active" : ""
                  }`}
                  aria-pressed={picked.has(motivation)}
                  onClick={() => togglePick(motivation)}
                >
                  {motivation}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="rsvp-note"
              className="eyebrow"
              style={{ display: "block", marginBottom: 8 }}
            >
              Anything else?{" "}
              <span
                style={{
                  color: "var(--ink-4)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (optional)
              </span>
            </label>
            <textarea
              id="rsvp-note"
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
              placeholder="What are you working on or hoping to help with?"
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--ink-3)",
            }}
          >
            <input
              type="checkbox"
              id="ls"
              name="joinListserv"
              defaultChecked
              style={{ accentColor: "var(--accent)" }}
            />
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
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
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
                ? "Confirmed"
                : sending
                  ? "Sending..."
                  : (
                      <>
                        RSVP for Friday <span className="arrow">-&gt;</span>
                      </>
                    )}
            </button>
            <span className="small">Your email stays private.</span>
          </div>
          {state.kind === "error" && (
            <div
              className="small"
              role="alert"
              style={{ color: "var(--danger, #c0392b)", lineHeight: 1.6 }}
            >
              The site could not save the RSVP just now.{" "}
              <a href={state.mailtoHref}>Open an email draft instead</a>.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
