import type { Blocker } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import { content } from "@/content/site";

interface StuckListProps {
  blockers: Blocker[];
  /** When true, show the project chip (used on /open-problems). When false, hide it (used in project-specific contexts). */
  showProject?: boolean;
  /** Empty-state copy. Required — empty states are part of the honesty contract. */
  emptyText: string;
}

export default function StuckList({ blockers, showProject = true, emptyText }: StuckListProps) {
  if (blockers.length === 0) {
    return <div className="stuck-empty small">{emptyText}</div>;
  }

  const projectName = (id: string) => content.projects.find((p) => p.id === id)?.name ?? id;

  return (
    <ul className="stuck-list">
      {blockers.map((b) => (
        <li className="stuck-row" key={b.id}>
          {showProject && (
            <span className="stuck-proj chip mono">{projectName(b.project)}</span>
          )}
          <span className="stuck-body">{b.body}</span>
          {b.waitingOn && (
            <span className="stuck-waiting chip mono">
              waiting on: {b.waitingOn}
            </span>
          )}
          <span className="stuck-since mono">
            since {fmtIsoDate(b.created)}
          </span>
        </li>
      ))}
    </ul>
  );
}
