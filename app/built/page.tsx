import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import ArtifactCard from "@/components/ArtifactCard";

export const metadata = {
  title: "Built · AI Incubator",
  description:
    "Public tools and prototypes made by University of Kentucky AI Incubator teams.",
};

export default function BuiltPage() {
  const artifacts = content.artifacts;

  return (
    <>
      <Nav active="built" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Things people <em>have made.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Public tools and prototypes.
          </p>
        </div>
      </header>

      <section className="section container">
        {artifacts.length === 0 ? (
          <p className="small">Nothing is ready to share here yet. The projects page shows what teams are working on.</p>
        ) : (
          <div className="proj-grid">
            {artifacts.map((a) => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
