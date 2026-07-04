import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import ProjectsFilteredList from "@/components/ProjectsFilteredList";

export const metadata = {
  title: "Projects · AI Incubator",
  description:
    "All active, in-flight, and just-kicked-off projects at the AI Incubator @ University of Kentucky.",
};

export default function ProjectsPage() {
  return (
    <>
      <Nav active="projects" />

      <header
        className="projects-hero container"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Projects · {content.cohort.replace(/^Cohort\s+\d+\s+·\s+/, "")}
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Current work.
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            Active builds, new pitches, and open collaboration paths across
            teaching, research, operations, student life, community work, and
            technical teams. Use the filters to find where your energy fits.
          </p>
        </div>
      </header>

      <ProjectsFilteredList projects={content.projects} />

      <Footer />
    </>
  );
}
