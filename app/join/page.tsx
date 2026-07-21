import Link from "next/link";
import { content } from "@/content/site";
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

const FRIDAY_FLOW = [
  {
    number: "01",
    title: "Show something real",
    body: "A demo, result, question, or failure gives the room somewhere to start.",
  },
  {
    number: "02",
    title: "Work the problem",
    body: "The group asks questions, tests ideas, and makes useful connections.",
  },
  {
    number: "03",
    title: "Choose a next step",
    body: "We end with one concrete thing to try, build, or investigate next.",
  },
];

const FRIDAY_FACTS = [
  ["When", "Fridays at noon ET"],
  ["Where", "Microsoft Teams"],
  ["Prep", "None required"],
  ["Commitment", "Come when it is useful"],
];

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
              <p className={styles.joinNote}>
                We&apos;ll send the Teams link, Friday details, and occasional
                ways to get involved.
              </p>
            </div>
          </div>

          <figure className={styles.heroFigure}>
            <div className={styles.heroImage}>
              <JoinHeroVideo />
            </div>
            <figcaption>
              Bring an idea, unfinished work, or a question worth exploring.
            </figcaption>
          </figure>
        </header>

        <section className={`container ${styles.fridaySection}`}>
          <div className={styles.sectionIntro}>
            <p className={`mono ${styles.kicker}`}>What happens on Friday</p>
            <h2>Come as you are.</h2>
            <p>
              No AI or coding experience is required. Listening counts. Keep
              your camera off if you want to listen; turn it on when you want
              to join the conversation.
            </p>
          </div>

          <div className={styles.fridayFlow}>
            {FRIDAY_FLOW.map((item) => (
              <article key={item.title}>
                <span className="mono">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <aside className={styles.fridayCard}>
            <div className={styles.factList}>
              {FRIDAY_FACTS.map(([label, value]) => (
                <div key={label}>
                  <span className="mono">{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className={styles.agenda}>
              <p className="mono">Current agenda</p>
              {content.session.agenda.map((item) => (
                <div key={item}>{item}</div>
              ))}
              <Link className={styles.calendarLink} href="/sessions">
                See upcoming Fridays <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </aside>
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
