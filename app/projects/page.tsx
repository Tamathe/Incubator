import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import ProjectsFilteredList from "@/components/ProjectsFilteredList";

export const metadata = {
  title: "Projects · AI Incubator",
  description:
    "See what University of Kentucky AI Incubator teams are working on in cancer screening, rural health, education, trauma care, and more.",
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
            What people are working on.
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            These projects are in different stages. Some are still being
            planned. Clinicians, engineers, educators, researchers, and
            students are working on them together. Each card says what the team
            is doing now and where someone else could help.
          </p>
        </div>
      </header>

      <ProjectsFilteredList projects={content.projects} />

      <Footer />
    </>
  );
}
