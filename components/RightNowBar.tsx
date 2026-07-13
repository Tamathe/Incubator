import { content } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import { deriveActivityLog, deriveAgenda } from "@/lib/derive";
import Countdown from "./Countdown";
import SessionWhen from "./SessionWhen";

export default function RightNowBar() {
  const { session } = content;
  const agenda = deriveAgenda(content);
  const recent = deriveActivityLog(content).slice(0, 3);

  return (
    <section className="container" id="rightnow" style={{ paddingTop: 8 }}>
      <div className="rightnow">
        <div className="rn-col rn-session">
          <div className="rn-eyebrow">Next session</div>
          <div className="rn-when">
            <SessionWhen variant="when" />
          </div>
          <div className="rn-meta">
            <span>{session.venue}</span>
            <span className="rn-dot">·</span>
            <Countdown variant="compact" />
          </div>
          <a className="rn-join" href={session.teamsUrl}>
            Join in Teams <span className="arrow">→</span>
          </a>
        </div>

        <div className="rn-col rn-agenda">
          <div className="rn-eyebrow">On the agenda</div>
          <ul>
            {agenda.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rn-col rn-activity">
          <div className="rn-eyebrow">Recent activity</div>
          <ul>
            {recent.map((entry) => (
              <li key={entry.id}>
                <span className="log-date mono">{fmtIsoDate(entry.date)}</span>
                <span className="log-note">{entry.note}</span>
              </li>
            ))}
          </ul>
          <a className="rn-more" href="/projects">
            View project board <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
