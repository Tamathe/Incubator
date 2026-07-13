import { content } from "@/content/site";
import type { Project } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

function StatusChip({ project }: { project: Project }) {
  const labels = {
    active: { cls: "live", text: project.stage || "Active" },
    building: { cls: "live", text: project.stage || "Building" },
    kickoff: { cls: "kick", text: "Just kicked off" },
    paused: { cls: "paused", text: project.stage || "On hold" },
  } as const;
  const status = labels[project.status];
  return <span className={`chip ${status.cls}`}>{status.text}</span>;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const openActions = content.actions.filter(
    (action) => action.project === project.id && action.status === "open",
  );
  const hasContributionDetails =
    Boolean(project.open) ||
    Boolean(project.studentFit?.length) ||
    openActions.length > 0;

  return (
    <article className="project-index-card" data-id={project.id}>
      <header className="project-index-head">
        <span className="project-index-number mono">
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <StatusChip project={project} />
        <span className="project-index-area mono">{project.area}</span>
      </header>

      <div className="project-index-body">
        <h2>{project.name}</h2>
        {project.tagline && <p className="project-index-tagline">{project.tagline}</p>}
        <p className="project-index-summary">{project.summary}</p>
      </div>

      {project.anchors && project.anchors.length > 0 && (
        <ul className="project-index-anchors" aria-label="Project focus">
          {project.anchors.slice(0, 3).map((anchor) => (
            <li key={anchor}>{anchor}</li>
          ))}
        </ul>
      )}

      <div className="project-index-meta">
        <span>Led by {project.leads}</span>
        {project.updated && <span>Updated {fmtIsoDate(project.updated)}</span>}
      </div>

      {hasContributionDetails && (
        <details className="project-index-details">
          <summary>
            Ways to contribute <span aria-hidden="true">+</span>
          </summary>
          <div>
            {project.open && <p>{project.open}</p>}
            {project.studentFit && project.studentFit.length > 0 && (
              <ul>
                {project.studentFit.map((fit) => <li key={fit}>{fit}</li>)}
              </ul>
            )}
            {openActions.length > 0 && (
              <ul>
                {openActions.map((action) => (
                  <li key={action.id}>{action.body} <span className="mono">{action.owner}</span></li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}
    </article>
  );
}
