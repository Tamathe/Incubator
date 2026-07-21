import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PublicPageHero from "@/components/PublicPageHero";
import UpcomingSessions from "@/components/UpcomingSessions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upcoming Fridays · AI Incubator",
  description:
    "See what the UK AI Incubator is working on and find an open Friday for something you want to bring.",
};

export default function SessionsPage() {
  return (
    <>
      <Nav active="sessions" />

      <main className={`community-page ${styles.page}`}>
        <PublicPageHero
          kicker="Fridays at noon ET · Microsoft Teams"
          title="Upcoming Fridays."
          description="See what the group is working on and find an open Friday for something you want to bring."
          image={{
            src: "/media/studio-conversation.jpg",
            alt: "A University of Kentucky student showing a drone during an AI Incubator gathering",
            caption: "Bring unfinished work. The room helps find the next step.",
            position: "center 44%",
          }}
        >
          <a className="studio-button studio-button-primary" href="#upcoming">
            See upcoming Fridays <span aria-hidden="true">-&gt;</span>
          </a>
          <Link className="studio-text-link" href="/pitch">
            Propose a Friday <span aria-hidden="true">-&gt;</span>
          </Link>
        </PublicPageHero>

        <section className={`container ${styles.guide}`}>
          <div>
            <p className={`mono ${styles.kicker}`}>How scheduling works</p>
            <h2>Bring the rough version.</h2>
          </div>

          <div className={styles.guideDetails}>
            <div>
              <span className="mono">Open Fridays</span>
              <p>
                Choose one when you propose a session. We&apos;ll hold your
                preferred date for seven days while we review it.
              </p>
            </div>
            <div>
              <span className="mono">First Friday</span>
              <p>
                The first Friday of each month stays open for an
                Incubator-led session.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.calendar}>
          <UpcomingSessions />
        </div>

        <section className={styles.propose}>
          <div className={`container ${styles.proposeInner}`}>
            <div>
              <p className={`mono ${styles.proposeKicker}`}>
                Have something for the room?
              </p>
              <h2>Propose a Friday.</h2>
              <p>
                Send the rough version. Choose a preferred date if you have
                one, and we&apos;ll follow up about the fit and format.
              </p>
            </div>
            <Link className="studio-button studio-button-light" href="/pitch">
              Propose a Friday <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
