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
    "Current blockers, upcoming decisions, and projects seeking collaborators at the University of Kentucky AI Incubator.",
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
              <span>Current blockers and decisions</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "20ch" }}>
            Open <em>problems.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Current blockers, decisions scheduled for Friday, and projects
            looking for collaborators. If you can help with one, contact the
            group.
          </p>
        </div>
      </header>

      <section className="section container">
        <div className="section-label">
          <span className="idx">01</span> <span>Stuck on</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "20ch" }}>What&apos;s in the way.</h2>
        <StuckList
          blockers={stuck}
          emptyText="No current blockers."
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">02</span> <span>Queued for decision</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>What we&apos;re about to choose.</h2>
        <DecisionList
          decisions={queued}
          emptyText="No decisions are queued for Friday."
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">03</span> <span>Looking for collaborators</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>Where we need help.</h2>
        <OpenCallList
          projects={openCalls}
          emptyText="No projects are currently seeking collaborators."
        />
      </section>

      <Footer />
    </>
  );
}
