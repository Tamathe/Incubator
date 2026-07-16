import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import RsvpForm from "@/components/RsvpForm";
import PitchForm from "@/components/PitchForm";

export const metadata = {
  title: "Come to a Friday meeting · AI Incubator",
  description:
    "Come to one UK AI Incubator meeting. You can listen, ask a question, show unfinished work, or meet people working on something that interests you.",
};

const JOIN_REASSURANCE = [
  {
    title: "You can just listen",
    body: "You do not need a project or a prepared question.",
  },
  {
    title: "Bring what you know",
    body: "Writing, design, evaluation, lived experience, subject knowledge, and technical skill all help.",
  },
  {
    title: "Try one Friday",
    body: "There is no application and no long-term commitment.",
  },
];

const FRIDAY_FLOW = [
  {
    time: "First few minutes",
    title: "People share what changed",
    body: "A useful tool, a new result, or something that did not work.",
  },
  {
    time: "Next",
    title: "Someone brings a question",
    body: "A research problem, workflow, concern, or early idea.",
  },
  {
    time: "Most of the meeting",
    title: "The group works on it",
    body: "People ask questions, test an assumption, or look at a demo together.",
  },
  {
    time: "Before we leave",
    title: "Someone names the next step",
    body: "One concrete thing to try before the next meeting.",
  },
];

const FAQ = [
  {
    q: "Do I need AI or coding experience?",
    a: "No. People contribute subject knowledge, design, writing, project management, evaluation, literature review, and technical work.",
  },
  {
    q: "Am I too junior to join?",
    a: "No. Undergraduate and graduate students join alongside faculty and staff. You can listen until you find where you want to contribute.",
  },
  {
    q: "Do I need to attend every week?",
    a: "No. Come when the agenda or a project interests you. There is no attendance requirement.",
  },
  {
    q: "Can this become academic work?",
    a: "Sometimes. Incubator projects have supported scholarly concentrations, capstones, thesis work, posters, papers, pilots, and grant applications. That depends on the project and the people involved.",
  },
  {
    q: "What if I cannot make Fridays at noon?",
    a: "Email the group or join the weekly update list in the footer. We can connect you with a project or a future session that fits.",
  },
];

export default function JoinPage() {
  return (
    <>
      <Nav active="join" />

      <main className="community-page">
        <header className="community-hero container">
          <div className="hero-meta">
            <span className="chip live">
              <span>Open to new members</span>
            </span>
            <span className="countdown">
              <span className="label">Next meeting in</span>
              <Countdown variant="short" />
            </span>
          </div>

          <h1>Come once. You can just listen.</h1>

          <p className="lead">
            Students, faculty, and staff meet Fridays at noon to show what they
            are learning, bring problems they are stuck on, and help one another
            take the next step. You do not need to prepare anything.
          </p>

          <div className="community-hero-actions">
            <a className="studio-button studio-button-primary" href="#rsvp">
              RSVP for Friday <span aria-hidden="true">-&gt;</span>
            </a>
            <a className="studio-text-link" href="#what-happens">
              See what the meeting is like <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>

        <section className="container community-reassurance" aria-label="What to expect">
          <div className="student-reassurance student-reassurance-join">
            {JOIN_REASSURANCE.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section container" id="what-happens">
          <div className="section-head">
            <div>
              <div className="section-label">
                <span className="idx">FRI</span>
                <span>Friday at noon</span>
              </div>
              <h2 className="h1">The agenda changes. The basic rhythm does not.</h2>
            </div>
            <p className="body friday-flow-note">
              Meetings run on Microsoft Teams and are open to students,
              faculty, and staff across UK.
            </p>
          </div>

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
              <div className="section-label">
                <span className="idx">RSVP</span>
                <span>Your first Friday</span>
              </div>
              <h2 className="h1">Tell us you are coming.</h2>
              <p className="body community-section-copy">
                We will send the Teams link and a reminder. You can also join
                the weekly update list.
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
              <div className="section-label">
                <span className="idx">BRING AN IDEA</span>
                <span>Unfinished is fine</span>
              </div>
              <h2 className="h1">Start with the problem.</h2>
              <p className="body community-section-copy">
                Tell us what is stuck, who feels it, and the smallest useful
                thing you could test. You can submit the form before you come or
                explain it in about a minute at the meeting.
              </p>

              <div className="community-agenda community-pitch-prompt">
                <div>A useful first pitch answers</div>
                <p>What is the problem?</p>
                <p>Who does it affect?</p>
                <p>What would you test first?</p>
              </div>
            </div>

            <PitchForm />
          </div>
        </section>

        <section className="section container">
          <div className="section-label">
            <span className="idx">FAQ</span>
            <span>Before your first meeting</span>
          </div>
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
