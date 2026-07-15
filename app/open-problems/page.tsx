import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import StuckList from "@/components/StuckList";
import DecisionList from "@/components/DecisionList";
import OpenCallList from "@/components/OpenCallList";
import {
  deriveActiveBlockers,
  deriveDecisionsForSession,
  deriveOpenCalls,
} from "@/lib/derive";

export const metadata = {
  title: "Open problems · AI Incubator",
  description:
    "Open questions, upcoming decisions, and places where University of Kentucky AI Incubator teams need help.",
};

export default function OpenProblemsPage() {
  const stuck = deriveActiveBlockers(content);
  const queued = deriveDecisionsForSession(content);
  const openCalls = deriveOpenCalls(content);

  return (
    <>
      <Nav active="open-problems" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>Current questions and ways to help</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "20ch" }}>
            Where another person <em>could help.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            These are the questions teams are working through, the decisions
            coming up, and the places where they could use another set of hands.
          </p>
        </div>
      </header>

      <section className="section container">
        <div className="section-label">
          <span className="idx">01</span> <span>Open questions</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "20ch" }}>What is holding up the work.</h2>
        <StuckList
          blockers={stuck}
          emptyText="No active questions are posted right now."
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">02</span> <span>Upcoming decisions</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>What the group needs to decide.</h2>
        <DecisionList
          decisions={queued}
          emptyText="No choices are queued for Friday right now."
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">03</span> <span>Looking for help</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>Where someone can pitch in.</h2>
        <OpenCallList
          projects={openCalls}
          emptyText="No open invitations are posted right now."
        />
      </section>

      <Footer />
    </>
  );
}
