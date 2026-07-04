import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import PitchForm from "@/components/PitchForm";

export const metadata = {
  title: "Pitch a project - AI Incubator",
  description:
    "Share a campus AI idea with the Incubator. A structured pitch lands with the group lead.",
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
            Bring us a campus problem worth building around. Tell us what is
            stuck, who feels it, and the smallest AI prototype that would prove
            the idea has legs.
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
              Give us the sharp version.
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "38ch" }}>
              This is intentionally short. The goal is not a polished proposal;
              it is enough signal for the Incubator to spot useful collaborators,
              first builds, and next Friday's discussion.
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
              The form turns your idea into a short project note for the
              Incubator queue. If the backend is unavailable, it gives you a
              ready-to-send email draft instead.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 02</div>
            <h3 className="h3">We read it</h3>
            <p>
              Every pitch is read by a person. We look for clear campus pain,
              a plausible first prototype, and places where the room can add
              useful collaborators.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 03</div>
            <h3 className="h3">Friday at noon</h3>
            <p>
              If it is a fit, you will get an invite to bring it to a Friday
              meeting: sixty seconds, with or without a slide, followed by
              practical scoping help.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
