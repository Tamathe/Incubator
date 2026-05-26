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
    "Where this group is stuck, what we're about to decide, and where we need help. We keep this public on purpose.",
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
              <span>Open · public on purpose</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "20ch" }}>
            Open <em>problems.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Where this group is stuck, what we&apos;re about to decide, and where
            we need help. We keep this public on purpose. If you see something
            you can move, get involved.
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
          emptyText="Nothing currently blocked. (That's either a good week or a bad memory.)"
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">02</span> <span>Queued for decision</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>What we&apos;re about to choose.</h2>
        <DecisionList
          decisions={queued}
          emptyText="No decisions queued. Quiet week, or we deferred them all."
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">03</span> <span>Looking for collaborators</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>Where we need help.</h2>
        <OpenCallList
          projects={openCalls}
          emptyText="No active kickoff calls — all current projects are staffed."
        />
      </section>

      <Footer />
    </>
  );
}
