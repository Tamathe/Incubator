import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import { content } from "@/content/site";
import IdeasMap from "@/components/IdeasMap";
import IdeasGrid from "@/components/IdeasGrid";

export const metadata = {
  title: "Ideas · AI Incubator",
  description:
    "Ideas in the air at the AI Incubator @ University of Kentucky. Some are seeds, some are pitches. Add yours.",
};

export default function IdeasPage() {
  return (
    <>
      <Nav active="ideas" />

      <header
        className="ideas-hero container"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Ideas · {content.cohort.replace(/^Cohort\s+\d+\s+·\s+/, "")}
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Ideas in the air.
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            What people in the group are thinking about. Some are seeds, some are
            pitches. Add yours.
          </p>
        </div>
      </header>

      <div className="ideas-surface-desktop">
        <IdeasMap />
      </div>
      <div className="ideas-surface-mobile">
        <IdeasGrid />
      </div>

      <Footer />
    </>
  );
}
