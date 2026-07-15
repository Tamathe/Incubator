import Link from "next/link";
import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import Countdown from "@/components/Countdown";
import RsvpForm from "@/components/RsvpForm";
import SubscribeForm from "@/components/SubscribeForm";
import PitchForm from "@/components/PitchForm";

export const metadata = {
  title: "Join us Friday · AI Incubator",
  description:
    "Students, faculty, and staff from across UK meet Fridays at noon to share what they are learning about AI, try ideas, and work on projects together.",
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
    body: "There is no application or long-term commitment.",
  },
];

const FRIDAY_FLOW = [
  {
    time: "First 5 min",
    title: "Share something",
    body: "A tool, a method, or something you learned.",
  },
  {
    time: "10-15 min",
    title: "Ask a question",
    body: "Bring a problem, workflow, or early idea.",
  },
  {
    time: "20-25 min",
    title: "Try something",
    body: "Look at a demo or prototype together.",
  },
  {
    time: "Last 10 min",
    title: "Pick a next step",
    body: "Decide what someone will try before the next meeting.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need AI or coding experience?",
    a: "No. People help in different ways, including subject knowledge, design, writing, project management, evaluation, literature review, and technical work.",
  },
  {
    q: "Am I too junior? Too senior?",
    a: "Undergraduate students, graduate students, faculty, and staff are welcome. Join as often as your schedule allows.",
  },
  {
    q: "Can faculty be involved?",
    a: "Yes. Faculty can attend, share expertise, mentor students, sponsor a project, or bring a question to the room.",
  },
  {
    q: "Is this for credit?",
    a: "Not by default. Incubator projects have supported scholarly concentrations, capstones, and thesis work.",
  },
  {
    q: "What happens to the work?",
    a: "Friday conversations may lead to studies, posters, papers, pilots, grant applications, prototypes, or shared learning for the group.",
  },
  {
    q: "What if I have class, clinic, or work on Fridays at noon?",
    a: "You can still join the weekly list, email the group about what interests you, and connect with project teams or future learning sessions outside the Friday meeting.",
  },
  {
    q: "Who funds this?",
    a: "Funding comes from campus seed support, pilot awards, project grants, and partner contributions. The group also helps teams shape external applications.",
  },
];

export default function JoinPage() {
  return (
    <>
      <Nav active="join" />

      {/* ───── Join hero ───── */}
      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>Open to new members</span>
            </span>
            <span className="countdown">
              <span className="label">Next meeting in</span>
              <Countdown variant="short" />
            </span>
          </div>

          <h1 className="h-display" style={{ maxWidth: "18ch" }}>
            Come to a <em>Friday meeting.</em>
          </h1>

          <p className="lead" style={{ marginTop: 28 }}>
            You can bring a question, a tool, or an idea. You can also just
            listen. Students, faculty, and staff from across campus meet Fridays
            at noon to compare notes, try things, and help one another. You do
            not need AI or coding experience.
          </p>
        </div>
      </header>

      <section className="container">
        <div className="student-reassurance student-reassurance-join">
          {JOIN_REASSURANCE.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Three paths ───── */}
      <section
        className="container"
        style={{ paddingBottom: "calc(40px * var(--d))" }}
      >
        <div className="join-paths">
          <div className="join-card">
            <div className="num">PATH 01</div>
            <div>
              <h2 className="h2">Attend a meeting</h2>
              <p className="body" style={{ marginTop: 10 }}>
                Drop in to listen, ask a question, or meet people working with
                AI across UK.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--ink-3)",
              }}
            >
              <span>Friday · 12:00 pm</span>
              <span>{content.session.venue}</span>
              <span>Open to students, faculty, and staff</span>
            </div>
            <a href="#rsvp" className="cta">
              RSVP for this Friday <span>→</span>
            </a>
          </div>

          <div className="join-card join-card-featured">
            <div className="num">
              PATH 02
            </div>
            <div>
              <h2 className="h2">
                Bring something to discuss
              </h2>
              <p
                className="body"
                style={{
                  marginTop: 10,
                }}
              >
                Bring a question, demo, concern, workflow, or early project
                idea. The group will discuss it with you.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--ink-3)",
              }}
            >
              <span>01 A question you are stuck on</span>
              <span>02 A tool or workflow to show</span>
              <span>03 An idea you want to test</span>
            </div>
            <Link
              href="#rsvp"
              className="cta"
            >
              Bring something Friday <span>→</span>
            </Link>
          </div>

          <div className="join-card" id="cant-make-friday">
            <div className="num">PATH 03</div>
            <div>
              <h2 className="h2">Can&apos;t make Friday?</h2>
              <p className="body" style={{ marginTop: 10 }}>
                Join the weekly list and tell us what interests you. We can
                connect you to projects and future learning sessions outside
                the noon meeting.
              </p>
            </div>
            <SubscribeForm source="friday-conflict" />
            <a
              className="cta"
              href="mailto:incubator@uky.edu?subject=Interested%20in%20AI%20Incubator%20but%20cannot%20attend%20Fridays"
            >
              Tell us what interests you <span>-&gt;</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="idx">FRI</span> <span>Friday at noon</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "18ch" }}>
              What a Friday usually looks like.
            </h2>
          </div>
          <p className="body friday-flow-note">
            The agenda changes, but this is how most meetings go.
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

      {/* ───── RSVP form ───── */}
      <section className="section container" id="rsvp">
        <div className="join-section-grid">
          <div>
            <div className="section-label">
              <span className="idx">RSVP</span>{" "}
              <span>Join a Friday meeting</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              Come to the next meeting.
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "36ch" }}>
              RSVP if you want a reminder and the Teams link. Opt into the
              listserv if you want the weekly digest too.
            </p>

            <div
              style={{
                marginTop: 28,
                padding: 18,
                background: "var(--surface-2)",
                borderRadius: 12,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--ink-3)",
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: "var(--ink)", marginBottom: 6 }}>
                THIS WEEK · {content.cohort}
              </div>
              {content.session.agenda.map((item, i) => (
                <div key={i}>· {item}</div>
              ))}
            </div>
          </div>

          <RsvpForm />
        </div>
      </section>

      {/* ───── Pitch form ───── */}
      <section className="section container" id="pitch">
        <div className="join-section-grid">
          <div>
            <div className="section-label">
              <span className="idx">PITCH</span>{" "}
              <span>Pitch when ready</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              Have an idea you want to try?
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "36ch" }}>
              Pitch it in about sixty seconds at a Friday meeting, or submit
              the form before you come.
            </p>
            <div
              style={{
                marginTop: 28,
                padding: 18,
                background: "var(--surface-2)",
                borderRadius: 12,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--ink-3)",
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: "var(--ink)", marginBottom: 6 }}>
                A GOOD PITCH ANSWERS
              </div>
              <div>01 The problem</div>
              <div>02 Who it affects</div>
              <div>03 What you&apos;d build first</div>
            </div>
          </div>
          <PitchForm />
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="section container">
        <div className="section-label">
          <span className="idx">FAQ</span> <span>Common questions</span>
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

      {/* ───── Contact strip ───── */}
      <section
        className="section container"
        style={{ paddingBottom: "calc(80px * var(--d))" }}
      >
        <div className="join-contact-grid">
          <div className="card">
            <div className="eyebrow">Meeting</div>
            <h3 className="h3" style={{ marginTop: 8 }}>
              Fridays at noon
            </h3>
            <p className="body" style={{ marginTop: 6, fontSize: 14 }}>
              {content.session.venue}
              <br />
              Friday · 12:00 pm
              <br />
              Link in the weekly listserv
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">Email</div>
            <h3 className="h3" style={{ marginTop: 8 }}>
              Reach the group
            </h3>
            <p
              className="mono"
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "var(--ink-2)",
                lineHeight: 1.7,
              }}
            >
              general ·{" "}
              <a
                href="mailto:incubator@uky.edu"
                style={{ color: "var(--accent)" }}
              >
                incubator@uky.edu
              </a>
              <br />
              pitches · send a short note with your idea
              <br />
              partners · tell us what you are exploring
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">Other channels</div>
            <h3 className="h3" style={{ marginTop: 8 }}>
              Online
            </h3>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <a
                href="https://github.com/uky-ai-incubator"
                target="_blank"
                rel="noopener noreferrer"
                className="chip"
                style={{ fontSize: 12 }}
              >
                GitHub →
              </a>
              <a
                href="mailto:incubator@uky.edu?subject=AI%20Incubator%20connection"
                className="chip"
                style={{ fontSize: 12 }}
              >
                Email →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
