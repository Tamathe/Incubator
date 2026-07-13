import type { Project } from "@/content/site";

interface OpenCallListProps {
  projects: Project[];
  emptyText: string;
}

export default function OpenCallList({ projects, emptyText }: OpenCallListProps) {
  if (projects.length === 0) {
    return <div className="opencall-empty small">{emptyText}</div>;
  }
  return (
    <div className="opencall-grid">
      {projects.map((p) => (
        <article className="opencall-card card" key={p.id}>
          <div className="top">
            <span className="chip kick">Kickoff</span>
            <span className="area mono">{p.area}</span>
          </div>
          <div className="title" style={{ marginTop: 8 }}>{p.name}</div>
          {p.tagline && <div className="tagline">{p.tagline}</div>}
          <p className="kick-open" style={{ marginTop: 10 }}>{p.open}</p>
          <a
            className="btn primary"
            href={`/pitch?project=${encodeURIComponent(p.id)}`}
            style={{ marginTop: 14 }}
          >
            Get involved with {p.name} <span className="arrow">→</span>
          </a>
        </article>
      ))}
    </div>
  );
}
