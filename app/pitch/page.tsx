import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PitchForm from "@/components/PitchForm";
import PublicPageHero from "@/components/PublicPageHero";
import styles from "./page.module.css";

export const metadata = {
  title: "Propose a Friday · AI Incubator",
  description:
    "Tell the University of Kentucky AI Incubator what you want to bring to a Friday working session.",
};

export default function PitchPage() {
  return (
    <>
      <Nav active="sessions" />

      <main className={`community-page ${styles.page}`}>
        <PublicPageHero
          kicker="Propose a Friday"
          title="Bring us a problem."
          description="Tell us what you are bringing, what you want from the room, and what we should know first. Choose a Friday if you have one in mind."
          image={{
            src: "/media/story/01-student-presenter.jpg",
            alt: "A University of Kentucky student presenting work to an AI Incubator audience",
            caption: "No polished deck required. Start with the rough version.",
          }}
        />

        <section className={`container ${styles.formSection}`}>
          <div className={styles.formIntro}>
            <p className={`mono ${styles.kicker}`}>What to send</p>
            <h2>Tell us enough to start.</h2>
            <p>
              Bring an idea, demonstration, collaborator request, or problem.
              If you know which Friday you want, choose it. If not, send the
              idea anyway.
            </p>
          </div>
          <PitchForm />
        </section>

        <section className={`container ${styles.next}`}>
          <div className={styles.nextIntro}>
            <p className={`mono ${styles.kicker}`}>After you send it</p>
            <h2>What happens next.</h2>
          </div>

          <div className={styles.steps}>
            <article>
              <span className="mono">01</span>
              <h3>Send the rough version</h3>
              <p>Your answers go to the Incubator team.</p>
            </article>
            <article>
              <span className="mono">02</span>
              <h3>We review it</h3>
              <p>
                If you chose a Friday, we hold that date for seven days while
                we review the proposal.
              </p>
            </article>
            <article>
              <span className="mono">03</span>
              <h3>We confirm by email</h3>
              <p>We follow up about the date, fit, and format.</p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
