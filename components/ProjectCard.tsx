import { content } from "@/content/site";
import type { Project } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import { stalenessLabel } from "@/lib/derive";

interface ProjectCardProps {
  project: Project;
}

function StatusChip({ project }: { project: Project }) {
  const labels = {
    active: { cls: "live", text: project.stage || "Active" },
    building: { cls: "live", text: project.stage || "Building" },
    kickoff: { cls: "kick", text: "Just kicked off" },
    paused: { cls: "paused", text: project.stage || "On hold" },
  } as const;
  const m = labels[project.status];
  return <span className={`chip ${m.cls}`}>{m.text}</span>;
}

/**
 * Rich active/building/paused card. Mono data block + hover reveal panel.
 */
export default function ProjectCard({ project: p }: ProjectCardProps) {
  const stale = stalenessLabel(p.updated, p.status);
  const openActions = content.actions.filter(
    (a) => a.project === p.id && a.status === "open"
  );

  return (
    <article className="card hover proj-card" data-id={p.id}>
      <div className="top">
        <StatusChip project={p} />
        <span className="area mono">
          {p.area}
          {stale.text && (
            <>
              {" · "}
              <span className={`stale stale-${stale.level}`}>{stale.text}</span>
            </>
          )}
        </span>
      </div>

      <div className="proj-data">
        {(p.anchors ?? []).slice(0, 4).map((a, i) => (
          <div className="proj-data-row" key={i}>
            <span className="dash">—</span>
            <span>{a}</span>
          </div>
        ))}
      </div>

      <div className="title-row">
        <div>
          <div className="title">{p.name}</div>
          {p.tagline && <div className="tagline">{p.tagline}</div>}
          <div className="lead-by">{p.leads}</div>
        </div>
      </div>

      <div className="reveal">
        <div>
          <div className="chip mono">
            {p.area} · {p.stage}
          </div>
          <h3
            className="h3"
            style={{ color: "var(--bg)", marginTop: 14 }}
          >
            {p.name}
          </h3>
          <p className="desc" style={{ marginTop: 10 }}>
            {p.summary}
          </p>
          {openActions.length > 0 && (
            <div className="reveal-actions">
              <div className="reveal-actions-label mono">Open actions</div>
              <ul>
                {openActions.map((a) => (
                  <li key={a.id}>
                    — {a.body} <span className="mono">{a.owner}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <div className="meta">
            {(p.anchors ?? []).slice(0, 3).map((a, i) => (
              <span key={i}>{a}</span>
            ))}
          </div>
          {p.updated && (
            <div className="reveal-updated mono">
              Updated {fmtIsoDate(p.updated)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
