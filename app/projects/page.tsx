import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import ProjectsFilteredList from "@/components/ProjectsFilteredList";

export const metadata = {
  title: "Projects · AI Incubator",
  description:
    "Active projects and ways students can contribute at the University of Kentucky AI Incubator.",
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
            Work in motion.
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            See what teams are exploring, what stage each project has reached,
            and where students can contribute.
          </p>
        </div>
      </header>

      <ProjectsFilteredList projects={content.projects} />

      <Footer />
    </>
  );
}
