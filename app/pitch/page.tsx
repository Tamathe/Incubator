import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import PitchForm from "@/components/PitchForm";

export const metadata = {
  title: "Pitch a project - AI Incubator",
  description:
    "Tell the University of Kentucky AI Incubator about a problem or project idea you want to try.",
};

export default function PitchPage() {
  return (
    <>
      <Nav active="join" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>Project ideas welcome</span>
            </span>
            <span
              className="mono"
              style={{ fontSize: 12, color: "var(--ink-3)" }}
            >
              3 prompts - about 5 minutes
            </span>
          </div>

          <h1 className="h-display" style={{ maxWidth: "18ch" }}>
            Tell us what <em>you want to try.</em>
          </h1>

          <p className="lead" style={{ marginTop: 28 }}>
            Start with the problem. Tell us who it affects and what you would
            try first.
          </p>
        </div>
      </header>

      <section
        className="container"
        style={{ paddingBottom: "calc(40px * var(--d))" }}
      >
        <div className="pitch-form-grid">
          <div>
            <div className="section-label">
              <span className="idx">PITCH</span>{" "}
              <span>Bring an idea to the group</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              Three short questions.
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "38ch" }}>
              Your answers give the group enough context to understand the idea
              and suggest a useful first step.
            </p>
            <div
              style={{
                marginTop: 28,
                padding: 18,
                background: "var(--surface-2)",
                borderRadius: 12,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--ink-3)",
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: "var(--ink)", marginBottom: 6 }}>
                A GOOD PITCH ANSWERS
              </div>
              <div>1. The problem</div>
              <div>2. Who it affects</div>
              <div>3. What you would build first</div>
            </div>
          </div>
          <PitchForm />
        </div>
      </section>

      <section
        className="section container"
        style={{ paddingTop: "calc(40px * var(--d))" }}
      >
        <div className="section-label">
          <span className="idx">NEXT</span> <span>What happens next</span>
        </div>
        <div className="steps">
          <div className="step">
            <div className="num">Step 01</div>
            <h3 className="h3">You submit</h3>
            <p>
              Your answers go to the Incubator team. If the form is
              unavailable, you will receive a ready-to-send email draft.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 02</div>
            <h3 className="h3">We read it</h3>
            <p>
              Someone from the Incubator reviews submissions and may follow up
              with questions.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 03</div>
            <h3 className="h3">Friday at noon</h3>
            <p>
              We may invite you to share the idea at a Friday meeting. A pitch
              takes about sixty seconds and does not require a slide.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
