import Link from "next/link";
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
          <div className="eyebrow">
            Current projects · {content.cohort.replace(/^Cohort\s+\d+\s+[-·]\s+/, "")}
          </div>
          <h1>See what people are building—and where you could help.</h1>
          <p className="lead">
            Some of this work is still an early idea. Some is research or a
            prototype. Each project entry says what the team is doing now and
            names useful first steps for a student or collaborator. You do not
            have to arrive as the expert.
          </p>
          <div className="community-hero-actions">
            <Link className="studio-button studio-button-primary" href="/join">
              Meet the community <span aria-hidden="true">-&gt;</span>
            </Link>
            <a className="studio-text-link" href="#project-list">
              Browse the projects <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>

        <div id="project-list">
          <ProjectsFilteredList projects={content.projects} />
        </div>
      </main>

      <Footer />
    </>
  );
}
