import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JoinIncubator from "@/components/JoinIncubator";
import PitchForm from "@/components/PitchForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Join the AI Incubator",
  description:
    "Join the University of Kentucky AI Incubator, come to a Friday meeting, or propose a session.",
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
    a: "Join anyway. We also share projects, collaborator requests, and other ways to participate by email.",
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
          <h1>Join the Incubator.</h1>

          <p className="lead">
            We meet Fridays at noon on Microsoft Teams to share work, learn
            from each other, and help move projects forward. Students, faculty,
            staff, researchers, and community partners are all welcome.
          </p>

          <div className="community-hero-actions">
            <a
              className="studio-button studio-button-primary"
              href="#join-incubator"
            >
              Join the Incubator <span aria-hidden="true">-&gt;</span>
            </a>
            <a className="studio-text-link" href="#what-happens">
              What happens Friday <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </header>

        <section className="section container" id="join-incubator">
          <div className="join-incubator-layout">
            <div>
              <span className="mono join-incubator-kicker">Open to everyone</span>
              <h2 className="h1">See you Friday.</h2>
              <p className="body community-section-copy">
                Come to learn, share something you&apos;re building, find
                collaborators, or just listen. No AI experience, project, or
                weekly commitment required.
              </p>
            </div>
            <div>
              <JoinIncubator />
              <p className="join-incubator-note">
                We&apos;ll send Friday details and occasional ways to get involved.
              </p>
            </div>
          </div>
        </section>

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

        <section className="section container">
          <div className="join-friday-layout">
            <div>
              <span className="mono join-incubator-kicker">This Friday</span>
              <h2 className="h1">Come as you are.</h2>
              <p className="body community-section-copy">
                The Incubator is open to both active and passive participation.
                If you want to log in and spectate, you can keep your camera
                off. If you want to be included in the conversation, turn your
                camera on.
              </p>

              <div className="community-agenda">
                <div>This week · {content.cohort}</div>
                {content.session.agenda.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
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
