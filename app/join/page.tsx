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
  title: "Get involved · AI Incubator",
  description:
    "Join the weekly AI Incubator community at the University of Kentucky. No project or coding background required.",
};

const JOIN_REASSURANCE = [
  {
    title: "No project required",
    body: "Come to listen, ask questions, or see what people are learning.",
  },
  {
    title: "No coding required",
    body: "Projects need writing, workflow mapping, literature review, evaluation, design, and domain expertise.",
  },
  {
    title: "Try one meeting",
    body: "There is no application, audition, or long-term commitment.",
  },
];

const FRIDAY_FLOW = [
  {
    time: "First 5 min",
    title: "Settle in",
    body: "Introduce yourself and hear what people are working on.",
  },
  {
    time: "10-15 min",
    title: "Learn something",
    body: "A demo, skill session, policy question, or expert walkthrough of a tool or workflow.",
  },
  {
    time: "20-25 min",
    title: "Roundtable",
    body: "Discuss current projects, open questions, and student ideas.",
  },
  {
    time: "Last 10 min",
    title: "Find a next step",
    body: "Choose a resource to read, a person to contact, or a project to revisit.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need to know how to code?",
    a: "No. Projects need domain expertise, design, writing, project management, evaluation, and literature review.",
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
            Come learn AI <em>with us.</em>
          </h1>

          <p className="lead" style={{ marginTop: 28 }}>
            Anyone is welcome. The group meets Fridays at noon in Microsoft
            Teams. You do not need a project, a slide, or a technical background
            to try a session.
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

          <div
            className="join-card"
            style={{
              background: "var(--ink)",
              color: "var(--bg)",
              borderColor: "var(--ink)",
            }}
          >
            <div className="num" style={{ color: "var(--accent)" }}>
              PATH 02
            </div>
            <div>
              <h2 className="h2" style={{ color: "var(--bg)" }}>
                Bring something to discuss
              </h2>
              <p
                className="body"
                style={{
                  color: "color-mix(in oklab, var(--bg) 75%, transparent)",
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
                color: "color-mix(in oklab, var(--bg) 55%, transparent)",
              }}
            >
              <span>01 A question you are stuck on</span>
              <span>02 A tool or workflow to show</span>
              <span>03 An idea you want to test</span>
            </div>
            <Link
              href="#rsvp"
              className="cta"
              style={{
                color: "var(--accent)",
                borderTopColor:
                  "color-mix(in oklab, var(--bg) 20%, transparent)",
              }}
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
              A typical Friday.
            </h2>
          </div>
          <p className="body friday-flow-note">
            The agenda changes each week. This is a common rhythm.
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
              Have a project idea?
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
