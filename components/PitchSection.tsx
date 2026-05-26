import Link from "next/link";

const PREVIEW: { role: "assistant" | "user"; text: string }[] = [
  {
    role: "assistant",
    text: "Welcome. I'll help you turn your idea into a tight pitch — about ten minutes. To start: what's the problem you'd like to work on?",
  },
  {
    role: "user",
    text: "Patients on chemo can't easily track which symptoms started when. Their oncologists end up reconstructing it from memory at every visit.",
  },
  {
    role: "assistant",
    text: "Concrete. Whose pain is sharpest there — patients trying to remember, or clinicians piecing it together at the visit?",
  },
];

export default function PitchSection() {
  return (
    <section className="section container" id="pitch">
      <div className="section-label">
        <span className="idx">06</span> <span>Pitch a project</span>
      </div>

      <div className="pitch-section-grid">
        <div className="pitch-section-copy">
          <h2 className="h1" style={{ maxWidth: "16ch" }}>
            Have an idea? <em>Bring it.</em>
          </h2>
          <p className="body" style={{ marginTop: 18, maxWidth: "44ch" }}>
            Talk it through with our intake. It walks you through five quick
            areas — the problem, who it affects, what you&apos;d build first,
            who you&apos;d need, and a bit about you. Takes about ten minutes.
            The group lead reads every one and gets back within a few days.
          </p>
          <p className="small" style={{ marginTop: 14, maxWidth: "44ch" }}>
            You&apos;re talking with Claude, scoped to help you pitch. Nothing
            you say is stored beyond the email we send to triage.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/pitch" className="btn primary lg">
              Start a pitch <span className="arrow">→</span>
            </Link>
            <a href="mailto:incubator@uky.edu" className="btn lg">
              Or email us
            </a>
          </div>
        </div>

        <div className="pitch-preview" aria-hidden="true">
          <div className="pitch-preview-head mono">
            <span className="pitch-preview-dot" />
            Intake · live
          </div>
          {PREVIEW.map((m, i) => (
            <div className={`pitch-preview-msg pitch-preview-msg--${m.role}`} key={i}>
              {m.role === "assistant" && (
                <div className="pitch-preview-from mono">Intake</div>
              )}
              <div className="pitch-preview-body">{m.text}</div>
            </div>
          ))}
          <div className="pitch-preview-msg pitch-preview-msg--assistant pitch-preview-msg--ghost">
            <div className="pitch-preview-from mono">Intake</div>
            <div className="pitch-preview-body">
              <span className="pitch-typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
