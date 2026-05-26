"use client";

import { useState } from "react";
import {
  type IdeaTheme,
  type IdeaCommitment,
  THEME_LABELS,
  COMMITMENT_LABELS,
  isUkEmail,
} from "@/lib/ideas";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const LOOKING_FOR_OPTIONS = [
  "Clinician",
  "Coder",
  "Designer",
  "Writer",
  "Researcher",
  "Faculty sponsor",
];

const ROLE_OPTIONS = [
  "Undergrad student",
  "Graduate / Medical student",
  "Resident / Fellow",
  "Faculty",
  "Staff",
  "Community partner",
];

export default function IdeaIntakeDrawer({ open, onClose, onSubmitted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<IdeaTheme | null>(null);
  const [commitment, setCommitment] = useState<IdeaCommitment | null>(null);
  const [problem, setProblem] = useState("");
  const [affects, setAffects] = useState("");
  const [buildFirst, setBuildFirst] = useState("");
  const [lookingFor, setLookingFor] = useState<Set<string>>(new Set());
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");

  if (!open) return null;

  function toggleLookingFor(opt: string) {
    setLookingFor((prev) => {
      const next = new Set(prev);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isUkEmail(email)) {
      setError("Please use your @uky.edu email.");
      return;
    }
    if (!theme || !commitment) {
      setError("Pick a theme and a commitment level.");
      return;
    }
    setSubmitting(true);
    // Real submit lands in the next task.
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onSubmitted();
      onClose();
    }, 1500);
  }

  return (
    <aside className="idea-drawer" role="dialog" aria-label="Add your idea">
      <div className="idea-drawer-head">
        <button className="idea-panel-close" onClick={onClose} aria-label="Close">×</button>
        <div className="eyebrow">Add your idea</div>
        <h2 className="idea-drawer-title">Drop a seed or pitch.</h2>
      </div>
      <form onSubmit={handleSubmit} className="idea-drawer-body">
        <Field label="Your name">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="First Last" />
        </Field>
        <Field label="UK email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@uky.edu"
          />
        </Field>
        <Field label="Idea title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={60}
            placeholder="One line"
          />
        </Field>

        <FieldGroup label="Theme">
          {(Object.keys(THEME_LABELS) as IdeaTheme[]).map((t) => (
            <button
              type="button"
              key={t}
              className={`filter-chip ${theme === t ? "active" : ""}`}
              onClick={() => setTheme(t)}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </FieldGroup>

        <FieldGroup label="Commitment">
          {(["curious", "exploring", "committed"] as IdeaCommitment[]).map((c) => (
            <button
              type="button"
              key={c}
              className={`filter-chip ${commitment === c ? "active" : ""}`}
              onClick={() => setCommitment(c)}
            >
              {COMMITMENT_LABELS[c]}
            </button>
          ))}
        </FieldGroup>

        <Field label="The problem">
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            required
            rows={3}
            placeholder="What's the problem you've noticed?"
          />
        </Field>

        <button
          type="button"
          className="idea-drawer-toggle"
          onClick={() => setOptionalOpen((o) => !o)}
        >
          {optionalOpen ? "− Hide" : "+ Tell us more (optional)"}
        </button>

        {optionalOpen && (
          <div className="idea-drawer-optional">
            <Field label="Who it affects">
              <input value={affects} onChange={(e) => setAffects(e.target.value)} placeholder="One line" />
            </Field>
            <Field label="What you'd build first">
              <input value={buildFirst} onChange={(e) => setBuildFirst(e.target.value)} placeholder="One line" />
            </Field>
            <FieldGroup label="Looking for collaborators">
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className={`filter-chip ${lookingFor.has(opt) ? "active" : ""}`}
                  onClick={() => toggleLookingFor(opt)}
                >
                  {opt}
                </button>
              ))}
            </FieldGroup>
            <Field label="Role">
              <input list="idea-roles" value={role} onChange={(e) => setRole(e.target.value)} />
              <datalist id="idea-roles">
                {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
              </datalist>
            </Field>
          </div>
        )}

        {/* Honeypot — invisible to humans */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />

        {error && <div className="idea-drawer-error">{error}</div>}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
          <button
            type="submit"
            disabled={submitting || submitted}
            className={`btn lg ${submitted ? "" : "primary"}`}
            style={
              submitted
                ? { background: "var(--signal)", color: "var(--bg)", borderColor: "var(--signal)" }
                : undefined
            }
          >
            {submitted ? "Submitted ✓ — pending review" : submitting ? "Submitting…" : "Add to the map"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>{label}</label>
      <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
        {children}
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}
