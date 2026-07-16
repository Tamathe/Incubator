import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";

export const metadata = {
  title: "Ideas - AI Incubator",
  description:
    "Questions people are bringing to University of Kentucky AI Incubator meetings.",
};

const IDEAS_THIS_MONTH = [
  "How should students use AI without outsourcing the work?",
  "What makes an AI-assisted workflow trustworthy enough to pilot?",
  "How do we test prototypes before they touch real workflows?",
  "Where can AI support rural teams without adding another burden?",
  "What tool, skill, or AI policy should we cover next?",
  "What should never be automated?",
];

export default function IdeasPage() {
  return (
    <>
      <Nav active="ideas" />

      <header
        className="ideas-hero container"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Questions people bring.
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            Bring one from your work, class, or research.
          </p>
        </div>
      </header>

      <section className="section container">
        <div className="section-head">
          <div>
            <h2 className="h1" style={{ maxWidth: "20ch" }}>
              What people are asking.
            </h2>
          </div>
          <a href="/join" className="btn ghost">
            Bring a question <span className="arrow">{"->"}</span>
          </a>
        </div>

        <div className="ideas-static-grid">
          {IDEAS_THIS_MONTH.map((idea) => (
            <article className="idea-topic-card" key={idea}>
              <h3>{idea}</h3>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
