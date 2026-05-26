import type { Project } from "@/content/site";

interface KickoffCardProps {
  project: Project;
}

/**
 * "Just kicked off" card — dashed border, prominent open-call copy.
 * The dashed shell is the honesty contract: new projects must visually
 * read as new, not as dressed-up mature work.
 */
export default function KickoffCard({ project: p }: KickoffCardProps) {
  return (
    <article className="card proj-card kickoff" data-id={p.id}>
      <div className="top">
        <span className="chip kick">Just kicked off</span>
        <span className="area mono">{p.area}</span>
      </div>

      <div className="kick-body">
        <div className="title">{p.name}</div>
        {p.tagline && <div className="tagline">{p.tagline}</div>}
        {p.summary && <p className="kick-summary">{p.summary}</p>}
        <div className="lead-by">Leads · {p.leads}</div>
      </div>

      <div className="kick-cta">
        <div className="kick-open">{p.open ?? "Looking for collaborators."}</div>
        <a className="kick-link" href="/#rightnow">
          Discuss at the next meeting <span className="arrow">→</span>
        </a>
      </div>
    </article>
  );
}
