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
            <p className={`mono ${styles.kicker}`}>
              Fridays <span aria-hidden="true">·</span> Noon ET{" "}
              <span aria-hidden="true">·</span> Microsoft Teams
            </p>

            <h1>Build something with us.</h1>

            <p className={styles.heroLead}>
              The AI Incubator is a weekly working session for UK students,
              faculty, and staff who want to learn AI by trying it on real
              problems. Bring an idea, brainstorm with us, or just listen.
            </p>

            <div className={styles.joinBlock} id="join">
              <p className={styles.joinLabel}>Get the Friday link and schedule</p>
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

        <nav className={styles.jumpNav} aria-label="Fridays page">
          <div className={`container ${styles.jumpNavInner}`}>
            <span className={styles.jumpLabel}>On this page</span>
            <div>
              <a href="#join">Join</a>
              <a href="#propose">Propose something</a>
              <a href="#schedule">Schedule</a>
            </div>
          </div>
        </nav>

        <section
          className={`container ${styles.proposeSection}`}
          id="propose"
          aria-labelledby="propose-title"
        >
          <div className={styles.proposeIntro}>
            <p className={`mono ${styles.kicker}`}>Bring something to the room</p>
            <h2 id="propose-title">Have something we can work through with you?</h2>
            <p>
              Bring an idea, demonstration, collaborator request, or problem.
              Tell us what you want from the group and choose a Friday if you
              have one in mind. No polished deck required.
            </p>

            <div className={styles.nextSteps}>
              <p className={`mono ${styles.kicker}`}>After you send it</p>
              <ol>
                <li>
                  <span className="mono">01</span>
                  <p>
                    We review what you sent. If you chose a Friday, we hold it
                    for seven days.
                  </p>
                </li>
                <li>
                  <span className="mono">02</span>
                  <p>We follow up by email about the date, fit, and format.</p>
                </li>
              </ol>
            </div>
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
