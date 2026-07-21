import Link from "next/link";
import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import PublicPageHero from "@/components/PublicPageHero";
import styles from "./page.module.css";

export const metadata = {
  title: "Current projects · AI Incubator",
  description:
    "See the questions UK AI Incubator teams are working on, what they are testing now, and where another person could help.",
};

export default function ProjectsPage() {
  return (
    <>
      <Nav active="projects" />

      <main className={`community-page ${styles.page}`}>
        <PublicPageHero
          kicker="Work in progress"
          title="Current projects."
          description="The work is still taking shape. See the question each team is working on, what it is testing now, and where another person could help."
          image={{
            src: "/media/studio-demo.jpg",
            alt: "AI Incubator members reviewing work together beside a large display",
            caption: "Projects begin with a question, then take shape in the room.",
          }}
        >
          <a className="studio-button studio-button-primary" href="#project-list">
            See the projects <span aria-hidden="true">-&gt;</span>
          </a>
          <Link className="studio-text-link" href="/join">
            Join the Incubator <span aria-hidden="true">-&gt;</span>
          </Link>
        </PublicPageHero>

        <section className={`container ${styles.projects}`} id="project-list">
          <div className={styles.intro}>
            <div>
              <p className={`mono ${styles.kicker}`}>
                {content.projects.length} questions in progress
              </p>
              <h2>Start with the question.</h2>
            </div>
            <p>
              Each project begins with a problem someone is already trying to
              solve. Teams test where AI can help while people remain
              responsible for the decisions that matter.
            </p>
          </div>

          <div className={styles.grid}>
            {content.projects.map((project, index) => (
              <ProjectCard project={project} index={index} key={project.id} />
            ))}
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`container ${styles.closingInner}`}>
            <div>
              <p className={`mono ${styles.kicker}`}>Bring your perspective</p>
              <h2>See a place you could help?</h2>
              <p>
                Come to a Friday meeting, ask a question, or bring experience
                the project does not have yet.
              </p>
            </div>
            <Link className="studio-button studio-button-primary" href="/join">
              Join the Incubator <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
