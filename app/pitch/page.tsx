import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import PitchForm from "@/components/PitchForm";

export const metadata = {
  title: "Pitch a project - AI Incubator",
  description:
    "Share a campus AI project idea with the University of Kentucky AI Incubator.",
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
              <span>Pitch intake open</span>
            </span>
            <span
              className="mono"
              style={{ fontSize: 12, color: "var(--ink-3)" }}
            >
              3 prompts - about 5 minutes
            </span>
          </div>

          <h1 className="h-display" style={{ maxWidth: "18ch" }}>
            Pitch <em>a project.</em>
          </h1>

          <p className="lead" style={{ marginTop: 28 }}>
            Describe the problem, who it affects, and the smallest useful
            prototype you would test.
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
              <span>Bring a problem to the group</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              Three short questions.
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "38ch" }}>
              Your answers give the group enough context to discuss the idea
              and identify a useful first test.
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
              Your responses go to the Incubator project queue. If the form is
              unavailable, you will receive a ready-to-send email draft.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 02</div>
            <h3 className="h3">We read it</h3>
            <p>
              A group lead reviews each pitch and may follow up with questions.
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
