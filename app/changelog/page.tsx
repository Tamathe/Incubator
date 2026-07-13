import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import data from "./data.json";

interface Commit {
  hash: string;
  date: string;
  author: string;
  message: string;
}
interface Week {
  key: string;
  label: string;
  commits: Commit[];
}
interface ChangelogData {
  generatedAt: string;
  weeks: Week[];
}

const changelog = data as ChangelogData;

function fmtCommitDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const metadata = {
  title: "Changelog — AI Incubator @ UK",
  description: "Edit history of the AI Incubator site content.",
};

export default function ChangelogPage() {
  const weeks = changelog.weeks ?? [];

  return (
    <>
      <Nav active="overview" />
      <section className="section container">
        <div className="section-label">
          <span className="idx">·</span> <span>Changelog</span>
        </div>
        <div className="section-head">
          <h1 className="h1" style={{ maxWidth: "22ch" }}>
            What changed.
          </h1>
          <span className="small">
            Edits to <span className="mono">content/site.ts</span>, newest first.
          </span>
        </div>

        {weeks.length === 0 && (
          <div className="changelog-empty">No history available yet.</div>
        )}

        {weeks.map((w) => (
          <div className="changelog-week" key={w.key}>
            <h3>{w.label}</h3>
            {w.commits.map((c) => (
              <div className="changelog-row" key={c.hash}>
                <div className="cl-date">{fmtCommitDate(c.date)}</div>
                <div className="cl-author">{c.author}</div>
                <div className="cl-msg">{c.message}</div>
              </div>
            ))}
          </div>
        ))}
      </section>
      <Footer />
    </>
  );
}
