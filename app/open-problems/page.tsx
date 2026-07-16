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
          <h1 className="h-display" style={{ maxWidth: "20ch" }}>
            Where help <em>is needed.</em>
          </h1>
        </div>
      </header>

      <section className="section container">
        <h2 className="h1" style={{ maxWidth: "20ch" }}>Open questions.</h2>
        <StuckList
          blockers={stuck}
          emptyText="No active questions are posted right now."
        />
      </section>

      <section className="section container">
        <h2 className="h1" style={{ maxWidth: "22ch" }}>Upcoming decisions.</h2>
        <DecisionList
          decisions={queued}
          emptyText="No choices are queued for Friday right now."
        />
      </section>

      <section className="section container">
        <h2 className="h1" style={{ maxWidth: "22ch" }}>Looking for help.</h2>
        <OpenCallList
          projects={openCalls}
          emptyText="No open invitations are posted right now."
        />
      </section>

      <Footer />
    </>
  );
}
