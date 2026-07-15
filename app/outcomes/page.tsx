import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import OutcomesTable from "@/components/OutcomesTable";

export const metadata = {
  title: "Outcomes · AI Incubator",
  description:
    "Documented grants, papers, talks, tools, and student achievements from University of Kentucky AI Incubator work.",
};

export default function OutcomesPage() {
  const o = content.outcomes;

  return (
    <>
      <Nav active="outcomes" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>Documented results</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            What the work <em>has produced.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "60ch" }}>
            We list public results here when we can point to a date, a source,
            or a link.
          </p>
        </div>
      </header>

      <section className="section container">
        {o.length === 0 ? (
          <p className="small">
            There are no results to list here yet. The projects page shows what
            is underway.
          </p>
        ) : (
          <OutcomesTable outcomes={o} />
        )}
      </section>

      <Footer />
    </>
  );
}
