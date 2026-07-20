import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RsvpForm from "@/components/RsvpForm";
import PitchForm from "@/components/PitchForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Come Friday or pitch a session · AI Incubator",
  description:
    "Come to a UK AI Incubator Friday meeting, or propose a talk, demo, collaborator request, or working session.",
};

const FRIDAY_FLOW = [
  {
    time: "Start",
    title: "Updates",
    body: "A demo, result, or failure.",
  },
  {
    time: "Then",
    title: "Work the problem",
    body: "The group asks questions and tests ideas.",
  },
  {
    time: "Before we leave",
    title: "Next step",
    body: "Someone leaves with one thing to try.",
  },
];

const FAQ = [
  {
    q: "Do I need AI or coding experience?",
    a: "No. Subject knowledge, design, writing, project management, evaluation, and technical work all help.",
  },
  {
    q: "Am I too junior to join?",
    a: "No. Undergraduate and graduate students join alongside faculty and staff.",
  },
  {
    q: "Do I need to attend every week?",
    a: "No. Come when the agenda or a project interests you.",
  },
  {
    q: "Can this become academic work?",
    a: "Sometimes. Projects have supported capstones, thesis work, posters, papers, pilots, and grant applications.",
  },
  {
    q: "What if I cannot make Fridays at noon?",
    a: "Email the group or join the update list in the footer.",
  },
];

const PITCH_FORMATS = [
  {
    title: "Pitch an idea",
    body: "Explain what you want to try and who you need.",
  },
  {
    title: "Give a talk",
    body: "Teach a method, tool, or idea the group should know.",
  },
  {
    title: "Show your work",
    body: "Present research, a prototype, or something unfinished.",
  },
  {
    title: "Find collaborators",
    body: "Show what you are trying to do and the people or expertise you are missing.",
  },
  {
    title: "Work a problem",
    body: "Bring something stuck. We can investigate it with AI or build a first prototype together.",
  },
];

export default function JoinPage() {
  return (
    <>
      <Nav active="join" />

      <main className="community-page">
        <header className="community-hero container">
          <h1>Come Friday.</h1>

          <p className="lead">
            Join us on Microsoft Teams at noon. No experience, project, or
            weekly commitment required.
          </p>

          <div className="community-hero-actions">
            <a className="studio-button studio-button-primary" href="#rsvp">
              RSVP <span aria-hidden="true">-&gt;</span>
            </a>
            <a className="studio-text-link" href="#pitch">
              Pitch a Friday <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </header>

        <section className="section container" id="what-happens">
          <h2 className="h1">What happens on Friday.</h2>

          <div className="friday-flow">
            {FRIDAY_FLOW.map((item) => (
              <div key={item.title} className="friday-flow-step">
                <span className="mono">{item.time}</span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section container" id="rsvp">
          <div className="join-section-grid">
            <div>
              <h2 className="h1">RSVP.</h2>
              <p className="body community-section-copy">
                We will send the Teams link and a reminder.
              </p>

              <div className="community-agenda">
                <div>This week · {content.cohort}</div>
                {content.session.agenda.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <RsvpForm />
          </div>
        </section>

        <section
          className={`section container ${styles.pitchSection}`}
          id="pitch"
        >
          <div className={styles.pitchLayout}>
            <div className={styles.pitchCopy}>
              <div className={`mono ${styles.kicker}`}>Selected Fridays</div>
              <h2 className="h1">Pitch a Friday.</h2>
              <p className={`body ${styles.pitchLead}`}>
                Pitch an idea. Give a talk. Show your work. Find collaborators.
                Or bring a problem and let the group work on it with you.
              </p>

              <div className={styles.formatList}>
                {PITCH_FORMATS.map((format, index) => (
                  <div className={styles.format} key={format.title}>
                    <span className={`mono ${styles.formatNumber}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{format.title}</h3>
                      <p>{format.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className={styles.pitchNote}>
                No finished project or polished deck required. Send the rough
                version. We will follow up by email to choose a Friday and the
                right format.
              </p>
            </div>

            <div className={styles.formColumn}>
              <div className={styles.formHeading}>
                <span className="mono">Propose a session</span>
                <p>Three short answers.</p>
              </div>
              <PitchForm />
            </div>
          </div>
        </section>

        <section className="section container">
          <h2 className="h1">Before you come.</h2>
          <div className="faq">
            {FAQ.map((item) => (
              <div className="faq-item" key={item.q}>
                <div className="q">{item.q}</div>
                <div className="a">{item.a}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
