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

function countByKind(outcomes: typeof content.outcomes, kind: typeof content.outcomes[number]["kind"]) {
  return outcomes.filter((o) => o.kind === kind).length;
}

function sumGrantValues(outcomes: typeof content.outcomes) {
  let cents = 0;
  for (const o of outcomes.filter((x) => x.kind === "grant")) {
    if (!o.value) continue;
    const m = o.value.match(/\$([\d.]+)\s*([KM]?)/i);
    if (!m) continue;
    const n = parseFloat(m[1]);
    const mult = m[2]?.toUpperCase() === "M" ? 1_000_000 : m[2]?.toUpperCase() === "K" ? 1_000 : 1;
    cents += n * mult;
  }
  if (cents >= 1_000_000) return `$${(cents / 1_000_000).toFixed(1)}M`;
  if (cents >= 1_000) return `$${Math.round(cents / 1_000)}K`;
  if (cents > 0) return `$${cents}`;
  return null;
}

export default function OutcomesPage() {
  const o = content.outcomes;
  const grantsTotal = sumGrantValues(o);

  return (
    <>
      <Nav active="outcomes" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>{o.length} outcomes logged</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            What we&apos;ve <em>made.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "60ch" }}>
            Grants, papers, products, students trained, talks. Numbers and dates.
            We don&apos;t dress this up.
          </p>
        </div>
      </header>

      <section className="section container">
        <div className="outcomes-counters mono" style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 28 }}>
          {grantsTotal && <span><strong>{grantsTotal}</strong> · grants funded</span>}
          <span><strong>{countByKind(o, "grant")}</strong> · grants</span>
          <span><strong>{countByKind(o, "paper")}</strong> · papers</span>
          <span><strong>{countByKind(o, "product")}</strong> · products</span>
          <span><strong>{countByKind(o, "student")}</strong> · students</span>
          <span><strong>{countByKind(o, "media")}</strong> · media</span>
          <span><strong>{countByKind(o, "talk")}</strong> · talks</span>
        </div>
        <OutcomesTable outcomes={o} />
      </section>

      <Footer />
    </>
  );
}
