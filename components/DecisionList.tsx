import type { Decision } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import { content } from "@/content/site";

interface DecisionListProps {
  decisions: Decision[];
  /** When true, show the session-date chip ("for FRI MAY 29"). On the homepage section we already know the session, so hide. */
  showSession?: boolean;
  emptyText: string;
}

export default function DecisionList({ decisions, showSession = true, emptyText }: DecisionListProps) {
  if (decisions.length === 0) {
    return <div className="dec-empty small">{emptyText}</div>;
  }

  const projectName = (id?: string) =>
    id ? content.projects.find((p) => p.id === id)?.name ?? id : "general";

  return (
    <ul className="dec-list">
      {decisions.map((d) => (
        <li className="dec-row" key={d.id}>
          <span className={`dec-proj chip mono ${d.project ? "" : "muted"}`}>
            {projectName(d.project)}
          </span>
          <span className="dec-q">{d.question}</span>
          {showSession && (
            <span className="dec-when mono">
              for {fmtIsoDate(d.forSession, { weekday: "short", month: "short", day: "numeric" })}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
