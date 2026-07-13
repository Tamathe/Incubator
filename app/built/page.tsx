import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import ArtifactCard from "@/components/ArtifactCard";

export const metadata = {
  title: "Built · AI Incubator",
  description:
    "Working products and prototypes from University of Kentucky AI Incubator teams.",
};

export default function BuiltPage() {
  const artifacts = content.artifacts;

  return (
    <>
      <Nav active="built" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>{artifacts.length} live artifact{artifacts.length === 1 ? "" : "s"}</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Built <em>and shipped.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Working products and prototypes from Incubator teams. Open an
            artifact to see what it does and who built it.
          </p>
        </div>
      </header>

      <section className="section container">
        {artifacts.length === 0 ? (
          <p className="small">No public artifacts yet. See the projects page for work underway.</p>
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
