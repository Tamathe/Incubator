"use client";

import { type Idea, THEME_LABELS, COMMITMENT_LABELS } from "@/lib/ideas";

interface Props {
  idea: Idea | null;
  onClose: () => void;
}

export default function IdeaDetailPanel({ idea, onClose }: Props) {
  if (!idea) return null;
  const mailto = `mailto:tama.the@uky.edu?subject=${encodeURIComponent(
    `Re: ${idea.title}`,
  )}&body=${encodeURIComponent(
    `Hi — I'd like to be connected with the person who submitted "${idea.title}" on the Ideas page.\n\n`,
  )}`;
  return (
    <aside className="idea-panel" role="dialog" aria-label={idea.title}>
      <div className="idea-panel-head">
        <button className="idea-panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="idea-panel-chips">
          <span className="chip">{THEME_LABELS[idea.theme]}</span>
          <span className={`chip commit commit--${idea.commitment}`}>
            {COMMITMENT_LABELS[idea.commitment]}
          </span>
          {idea.status === "pending" && (
            <span className="chip pending">Pending review</span>
          )}
        </div>
        <h2 className="idea-panel-title">{idea.title}</h2>
        <div className="idea-panel-submitter">
          {idea.submitterName}
          {idea.submitterRole ? ` · ${idea.submitterRole}` : ""}
        </div>
      </div>
      <div className="idea-panel-body">
        <Section label="The problem" body={idea.problem} />
        {idea.affects && <Section label="Who it affects" body={idea.affects} />}
        {idea.buildFirst && <Section label="What they'd build first" body={idea.buildFirst} />}
        {idea.lookingFor.length > 0 && (
          <div className="idea-panel-section">
            <div className="eyebrow">Looking for</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {idea.lookingFor.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="idea-panel-foot">
        <a className="btn primary" href={mailto}>
          Reach out <span className="arrow">→</span>
        </a>
      </div>
    </aside>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div className="idea-panel-section">
      <div className="eyebrow">{label}</div>
      <p className="body" style={{ marginTop: 8 }}>{body}</p>
    </div>
  );
}
