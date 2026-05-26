import type { Artifact } from "@/content/site";
import { content } from "@/content/site";

interface ArtifactCardProps {
  artifact: Artifact;
}

export default function ArtifactCard({ artifact: a }: ArtifactCardProps) {
  const projectName = content.projects.find((p) => p.id === a.project)?.name ?? a.project;

  return (
    <article className="artifact-card card">
      {a.thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.thumb} alt={`${a.name} thumbnail`} className="artifact-thumb" />
      )}
      <div className="top">
        <span className={`chip mono kind-${a.kind}`}>{a.kind.replace("-", " ")}</span>
        <span className="area mono">{projectName}</span>
      </div>
      <div className="title" style={{ marginTop: 8 }}>{a.name}</div>
      {a.note && <p className="kick-summary" style={{ marginTop: 8 }}>{a.note}</p>}
      <a
        className="btn primary"
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: 14 }}
      >
        Try it <span className="arrow">→</span>
      </a>
    </article>
  );
}
