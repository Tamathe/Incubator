import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import OutcomesTable from "@/components/OutcomesTable";

export const metadata = {
  title: "Outcomes · AI Incubator",
  description:
    "What the AI Incubator has produced: grants, papers, products, students trained, talks given. Numbers and dates.",
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
              <span>Verified outputs</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            What we&apos;ve <em>made.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "60ch" }}>
            Verified grants, papers, products, student work, and talks, listed
            with dates and public links when available.
          </p>
        </div>
      </header>

      <section className="section container">
        <OutcomesTable outcomes={o} />
      </section>

      <Footer />
    </>
  );
}
