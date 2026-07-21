import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JoinIncubator from "@/components/JoinIncubator";
import JoinHeroVideo from "./JoinHeroVideo";
import styles from "./page.module.css";

export const metadata = {
  title: "Join the AI Incubator",
  description:
    "Join the University of Kentucky AI Incubator for a Friday working session on Microsoft Teams.",
};

export default function JoinPage() {
  return (
    <>
      <Nav active="join" />

      <main className="community-page">
        <header className={`container ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <p className={`mono ${styles.kicker}`}>
              Fridays <span aria-hidden="true">&middot;</span> Noon ET{" "}
              <span aria-hidden="true">&middot;</span> Microsoft Teams
            </p>

            <h1>Build something with us.</h1>

            <p className={styles.heroLead}>
              The AI Incubator is a weekly working session for UK students who
              want to learn AI by trying it on real problems. Bring an idea,
              help someone else, or just listen. Faculty, staff, researchers,
              and community partners are welcome too.
            </p>

            <div className={styles.joinBlock} id="join-incubator">
              <JoinIncubator />
            </div>
          </div>

          <figure className={styles.heroFigure}>
            <div className={styles.heroImage}>
              <JoinHeroVideo />
            </div>
            <figcaption>
              Chaelyn McGuire talks about the philanthropy outreach site she
              built.
            </figcaption>
          </figure>
        </header>

        <section className={`container ${styles.fridaySection}`}>
          <div className={styles.sectionIntro}>
            <h2>Meetings.</h2>
            <p>
              No previous experience required. Turn your camera on to join the
              conversation, or leave it off in second-screen mode.
            </p>
            <Link className={styles.calendarLink} href="/sessions">
              See this Friday&apos;s agenda <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>

        <section className={`container ${styles.bringSection}`} id="pitch">
          <div>
            <p className={`mono ${styles.kicker}`}>Bring your work</p>
            <h2>Have something for the room?</h2>
            <p>
              Pitch an idea, show unfinished work, teach a tool, find
              collaborators, or bring a problem the group can work through
              with you. No polished deck required.
            </p>
          </div>

          <div className={styles.bringActions}>
            <Link className="studio-button studio-button-primary" href="/pitch">
              Propose a Friday <span aria-hidden="true">-&gt;</span>
            </Link>
            <Link className={styles.projectLink} href="/projects">
              Explore current projects <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
