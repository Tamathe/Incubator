import type { Project } from "@/content/site";
import { content } from "@/content/site";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const collaborators = content.partners.filter(
    (partner) =>
      partner.showOnProjectCard &&
      (partner.project === project.id || partner.projects?.includes(project.id)),
  );

  return (
    <article className="project-index-card" data-id={project.id}>
      <div className="project-index-body">
        <span className="project-index-area mono">{project.area}</span>
        <h2>{project.name}</h2>
        <p className="project-index-summary">{project.summary}</p>
      </div>

      {collaborators.length > 0 && (
        <p className="project-index-collaborators">
          <span className="mono">Collaborators</span>
          {collaborators.map((partner) => (
            <span key={partner.id}>
              {partner.name}
              {partner.role && ` (${partner.role.toLowerCase()})`}
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
