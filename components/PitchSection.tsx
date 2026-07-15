import Link from "next/link";

const PREVIEW: { role: "assistant" | "user"; text: string }[] = [
  {
    role: "assistant",
    text: "Start with the problem. What is stuck, slow, confusing, or newly possible?",
  },
  {
    role: "user",
    text: "Students cannot find the right campus resources when deadlines are close. They end up piecing together advice from old emails and web pages.",
  },
  {
    role: "assistant",
    text: "Good. Now name who feels that pain most sharply, and what the smallest useful prototype would do first.",
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
            Write the sharp version of the idea: the problem, who it affects,
            and the smallest useful thing to try. It takes about five minutes.
            A group lead reviews submissions and may follow up with questions.
          </p>
          <p className="small" style={{ marginTop: 14, maxWidth: "44ch" }}>
            If the project queue is unavailable, the form gives you a
            ready-to-send email draft so the pitch still gets to a human.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <Link href="/pitch" className="btn primary lg">
              Start a pitch <span className="arrow">-&gt;</span>
            </Link>
            <a href="mailto:incubator@uky.edu" className="btn lg">
              Or email us
            </a>
          </div>
        </div>

        <div className="pitch-preview" aria-hidden="true">
          <div className="pitch-preview-head mono">
            <span className="pitch-preview-dot" />
            Intake live
          </div>
          {PREVIEW.map((message, i) => (
            <div
              className={`pitch-preview-msg pitch-preview-msg--${message.role}`}
              key={i}
            >
              {message.role === "assistant" && (
                <div className="pitch-preview-from mono">Intake</div>
              )}
              <div className="pitch-preview-body">{message.text}</div>
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
