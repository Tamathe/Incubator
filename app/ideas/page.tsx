import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import { content } from "@/content/site";

export const metadata = {
  title: "Ideas - AI Incubator",
  description:
    "Questions people are bringing to University of Kentucky AI Incubator meetings.",
};

const IDEAS_THIS_MONTH = [
  {
    label: "Student learning",
    title: "How should students use AI without outsourcing the work?",
    body: "This comes up in classes, capstones, advising, and research training.",
  },
  {
    label: "Clinical workflow",
    title: "What makes an AI-assisted workflow trustworthy enough to pilot?",
    body: "A pilot needs human review, a clear scope, measurable risk, and a workflow that does not create hidden labor.",
  },
  {
    label: "Evaluation",
    title: "How do we test prototypes before they touch real workflows?",
    body: "Use simulation, synthetic cases, rubric-based review, usability testing, and failure analysis.",
  },
  {
    label: "Rural health",
    title: "Where can AI support rural teams without adding another burden?",
    body: "The group is exploring screening, navigation, education, workforce support, and referral follow-through.",
  },
  {
    label: "Friday demo",
    title: "What tool, skill, or AI policy should we cover next?",
    body: "Bring a short demo, a confusing tool, a paper, or a question the group can work through together.",
  },
  {
    label: "Open question",
    title: "What should never be automated?",
    body: "Bring questions about limits, risk, governance, and human responsibility.",
  },
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
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Ideas - {content.cohort.replace(/^Cohort\s+\d+\s+-\s+/, "")}
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Questions people are bringing to the group.
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            These are the kinds of questions that come up on Fridays. Bring one
            from your work, class, research, or daily life.
          </p>
        </div>
      </header>

      <section className="section container">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="idx">THIS MONTH</span>{" "}
              <span>Conversation starters</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "20ch" }}>
              A few things people are talking about.
            </h2>
          </div>
          <a href="/join" className="btn ghost">
            Bring one Friday <span className="arrow">{"->"}</span>
          </a>
        </div>

        <div className="ideas-static-grid">
          {IDEAS_THIS_MONTH.map((idea) => (
            <article className="idea-topic-card" key={idea.title}>
              <span className="mono">{idea.label}</span>
              <h3>{idea.title}</h3>
              <p>{idea.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="ideas-callout">
          <div>
            <div className="eyebrow">Have another question?</div>
            <h2 className="h2">Bring it Friday.</h2>
            <p>
              It can be about a tool, a workflow, a class, a research idea, or
              something that is not working.
            </p>
          </div>
          <a href="/join" className="btn primary">
            Join a Friday session <span className="arrow">{"->"}</span>
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
