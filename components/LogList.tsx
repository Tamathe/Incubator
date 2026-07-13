import { content } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import { deriveActivityLog } from "@/lib/derive";

export default function LogList() {
  const entries = deriveActivityLog(content);
  return (
    <div className="log-list">
      {entries.map((entry) => (
        <div className="log-row" key={entry.id}>
          <div className="log-date mono">{fmtIsoDate(entry.date)}</div>
          <div className="log-proj mono">{entry.project}</div>
          <div className="log-note">{entry.note}</div>
        </div>
      ))}
    </div>
  );
}
