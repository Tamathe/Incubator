import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import PitchChat from "@/components/PitchChat";

export const metadata = {
  title: "Pitch a project · AI Incubator",
  description:
    "Talk through your idea with our intake. Five areas, ~10 minutes, structured pitch lands with the group lead.",
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
              <span>Intake · open</span>
            </span>
            <span
              className="mono"
              style={{ fontSize: 12, color: "var(--ink-3)" }}
            >
              5 areas · ~10 min · 1 email
            </span>
          </div>

          <h1 className="h-display" style={{ maxWidth: "18ch" }}>
            Pitch <em>a project.</em>
          </h1>

          <p className="lead" style={{ marginTop: 28 }}>
            Walk through your idea with our intake. It asks about the problem,
            who it affects, what you&apos;d build first, who you&apos;d need,
            and a bit about you. The group lead reads every one and is in
            touch within a few days.
          </p>
        </div>
      </header>

      <section
        className="container"
        style={{ paddingBottom: "calc(40px * var(--d))" }}
      >
        <PitchChat />
      </section>

      <section
        className="section container"
        style={{ paddingTop: "calc(40px * var(--d))" }}
      >
        <div className="section-label">
          <span className="idx">→</span> <span>What happens next</span>
        </div>
        <div className="steps">
          <div className="step">
            <div className="num">Step 01</div>
            <h3 className="h3">You submit</h3>
            <p>
              The intake structures your answers into a one-page pitch and
              emails it to the group lead. You&apos;ll see a confirmation here.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 02</div>
            <h3 className="h3">We read it</h3>
            <p>
              Every pitch is read by a person. We look for projects that fit
              the group&apos;s focus — healthcare and education — and where
              we can pair you with collaborators.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 03</div>
            <h3 className="h3">Friday at noon</h3>
            <p>
              If it&apos;s a fit, you&apos;ll get an invite to bring it to the
              next Friday meeting — sixty seconds, with or without a slide.
              The group helps scope it and pairs you with collaborators.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
