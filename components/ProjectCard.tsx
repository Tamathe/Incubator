import Image from "next/image";
import { content } from "@/content/site";
import type { Project } from "@/content/site";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const collaborators = content.partners.filter(
    (partner) =>
      partner.showOnProjectCard &&
      (partner.project === project.id || partner.projects?.includes(project.id)),
  );

  return (
    <article className={styles.card} data-id={project.id}>
      <figure className={styles.figure}>
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
          style={{ objectPosition: project.imagePosition ?? "center" }}
        />
        <figcaption className="mono">Concept visualization</figcaption>
      </figure>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={`mono ${styles.number}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={`mono ${styles.area}`}>{project.area}</span>
        </div>

        <h2>{project.name}</h2>
        <p className={styles.question}>{project.question}</p>

        <div className={styles.now}>
          <span className="mono">Now</span>
          <p>{project.stage}</p>
        </div>

        <p className={styles.summary}>{project.summary}</p>

        {project.studentFit && project.studentFit.length > 0 && (
          <div className={styles.help}>
            <span className="mono">Where you could help</span>
            <ul>
              {project.studentFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {collaborators.length > 0 && (
        <div className={styles.collaborators}>
          <span className="mono">Collaborators</span>
          {collaborators.map((partner) => (
            <span key={partner.id}>
              {partner.name}
              {partner.role && ` (${partner.role.toLowerCase()})`}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
