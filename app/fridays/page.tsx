import Footer from "@/components/Footer";
import JoinIncubator from "@/components/JoinIncubator";
import Nav from "@/components/Nav";
import PitchForm from "@/components/PitchForm";
import UpcomingSessions from "@/components/UpcomingSessions";
import JoinHeroVideo from "./JoinHeroVideo";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fridays · AI Incubator",
  description:
    "Join the University of Kentucky AI Incubator, see upcoming Friday sessions, or bring something for the group to work through with you.",
};

export default function FridaysPage() {
  return (
    <>
      <Nav active="fridays" />

      <main className={`community-page ${styles.page}`}>
        <header className={`container ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <p className={`mono ${styles.heroSchedule}`}>
              Fridays
              <span aria-hidden="true">·</span>
              Noon ET
              <span aria-hidden="true">·</span>
              Microsoft Teams
            </p>

            <h1>Build something with us.</h1>

            <p className={styles.heroLead}>
              The AI Incubator is a weekly working session for UK students,
              faculty, and staff who want to learn AI by trying it on real
              problems. Bring an idea, brainstorm with us, or just listen.
            </p>

            <div className={styles.joinBlock} id="join">
              <p className={styles.joinLabel}>Get the link and schedule</p>
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

        <section
          className={`container ${styles.proposeSection}`}
          id="propose"
          aria-labelledby="propose-title"
        >
          <div className={styles.proposeIntro}>
            <h2 id="propose-title">
              Have an idea, a project, a prototype, or a problem?
            </h2>
            <p>Bring it to the group. Choose a date. Bring what you have.</p>
          </div>

          <PitchForm />
        </section>

        <div className={styles.calendar}>
          <UpcomingSessions />
        </div>
      </main>

      <Footer />
    </>
  );
}
