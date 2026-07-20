import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectsFilteredList from "@/components/ProjectsFilteredList";

export const metadata = {
  title: "Current projects · AI Incubator",
  description:
    "See what teams across the UK AI Incubator are working on.",
};

export default function ProjectsPage() {
  return (
    <>
      <Nav active="projects" />

      <main className="community-page">
        <header className="community-hero container">
          <h1>Current projects.</h1>
        </header>

        <div id="project-list">
          <ProjectsFilteredList projects={content.projects} />
        </div>
      </main>

      <Footer />
    </>
  );
}
