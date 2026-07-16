import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RsvpForm from "@/components/RsvpForm";
import PitchForm from "@/components/PitchForm";

export const metadata = {
  title: "Come to a Friday meeting · AI Incubator",
  description:
    "Come to one UK AI Incubator meeting. You can listen, ask a question, show unfinished work, or meet people working on something that interests you.",
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

        <section className="section container" id="pitch">
          <div className="join-section-grid">
            <div>
              <h2 className="h1">Bring a problem.</h2>
              <p className="body community-section-copy">
                Tell us what is stuck, who it affects, and what you would test
                first.
              </p>
            </div>

            <PitchForm />
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
