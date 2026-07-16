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
          <h1 className="h-display" style={{ maxWidth: "18ch" }}>
            Bring us <em>a problem.</em>
          </h1>

          <p className="lead" style={{ marginTop: 28 }}>
            Tell us who it affects and what you would test first.
          </p>
        </div>
      </header>

      <section
        className="container"
        style={{ paddingBottom: "calc(40px * var(--d))" }}
      >
        <div className="pitch-form-grid">
          <div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              Three questions.
            </h2>
          </div>
          <PitchForm />
        </div>
      </section>

      <section
        className="section container"
        style={{ paddingTop: "calc(40px * var(--d))" }}
      >
        <h2 className="h1">What happens next.</h2>
        <div className="steps">
          <div className="step">
            <div className="num">Step 01</div>
            <h3 className="h3">Submit</h3>
            <p>Your answers go to the Incubator team.</p>
          </div>
          <div className="step">
            <div className="num">Step 02</div>
            <h3 className="h3">Review</h3>
            <p>We may follow up with a question.</p>
          </div>
          <div className="step">
            <div className="num">Step 03</div>
            <h3 className="h3">Friday</h3>
            <p>We may invite you to share the idea. No slide required.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
