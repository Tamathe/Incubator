import { content } from "@/content/site";
import { fmtIsoDate, nextSession } from "@/lib/session";
import {
  deriveActiveBlockers,
  deriveDecisionsForSession,
} from "@/lib/derive";
import StuckList from "./StuckList";
import DecisionList from "./DecisionList";

export default function OnTheTableSection() {
  const stuck = deriveActiveBlockers(content);
  const next = nextSession();
  const nextIso = next.toISOString().slice(0, 10);
  const queued = deriveDecisionsForSession(content, nextIso);
  const fridayLabel = fmtIsoDate(nextIso, { weekday: "short", month: "short", day: "numeric" });

  return (
    <section className="section container" id="on-the-table">
      <div className="section-label">
        <span className="idx">05</span> <span>What&apos;s on the table</span>
      </div>
      <div className="section-head">
        <h2 className="h1" style={{ maxWidth: "20ch" }}>
          What we&apos;re stuck on, what&apos;s queued for {fridayLabel}.
        </h2>
        <a href="/open-problems" className="btn ghost">
          See all open problems <span className="arrow">→</span>
        </a>
      </div>

      <div className="on-the-table-grid">
        <div>
          <div className="rn-eyebrow" style={{ marginBottom: 12 }}>Stuck on</div>
          <StuckList
            blockers={stuck}
            emptyText="Nothing currently blocked. (That's either a good week or a bad memory.)"
          />
        </div>
        <div>
          <div className="rn-eyebrow" style={{ marginBottom: 12 }}>On the table this Friday</div>
          <DecisionList
            decisions={queued}
            showSession={false}
            emptyText="No decisions queued for Friday. Quiet week, or we deferred them all."
          />
        </div>
      </div>
    </section>
  );
}
