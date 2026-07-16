import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectsFilteredList from "@/components/ProjectsFilteredList";

export const metadata = {
  title: "Current projects · AI Incubator",
  description:
    "See what people in the UK AI Incubator are working on and where a student or collaborator could help.",
};

export default function ProjectsPage() {
  return (
    <>
      <Nav active="projects" />

      <main className="community-page">
        <header className="community-hero container">
          <h1>Current projects.</h1>
          <p className="lead">
            See what teams are working on and where you could help.
          </p>
        </header>

        <div id="project-list">
          <ProjectsFilteredList projects={content.projects} />
        </div>
      </main>

      <Footer />
    </>
  );
}
