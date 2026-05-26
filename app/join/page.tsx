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
    "Three paths into the group: attend a meeting, pitch a project, or stay in the loop.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need to know how to code?",
    a: "No. About half of attendees don't code. Projects also need clinical input, design, writing, project management, and literature review.",
  },
  {
    q: "Am I too junior? Too senior?",
    a: "Anyone from undergrads to attendings is welcome. People contribute based on their availability.",
  },
  {
    q: "Can faculty be involved?",
    a: "Yes. Most projects have a faculty PI or clinical sponsor. Email the group lead to discuss seeding or sponsoring a project.",
  },
  {
    q: "Is this for credit?",
    a: "Not by default. Students have used projects as scholarly concentrations, capstones, and thesis work. We can help with the paperwork.",
  },
  {
    q: "What happens to the work?",
    a: "Projects have produced IRB-approved studies, posters, papers, pilots, and patents. Every current project began as a pitch at a Friday meeting.",
  },
  {
    q: "Who funds this?",
    a: "Funding comes from CCTS pilot funds, an Innovation Award, faculty seed money, and a $475K SUP grant from the KY Cabinet for Health and Family Services. Active applications include Macy and Precision Medicine grants.",
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
            How to join <em>the group.</em>
          </h1>

          <p className="lead" style={{ marginTop: 28 }}>
            Anyone is welcome. The group meets Fridays at noon in Microsoft
            Teams. If you have a project to pitch, see Path 02 below.
          </p>
        </div>
      </header>

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
                Fridays at noon in Microsoft Teams. RSVP is optional. The link
                is in the listserv.
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
              <span>Typically around 30 attendees</span>
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
                Pitch a project
              </h2>
              <p
                className="body"
                style={{
                  color: "color-mix(in oklab, var(--bg) 75%, transparent)",
                  marginTop: 10,
                }}
              >
                Around sixty seconds, with or without a slide. The group helps
                scope the idea down and pairs you with collaborators.
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
              <span>① The problem</span>
              <span>② Who it affects</span>
              <span>③ What you&apos;d build first</span>
            </div>
            <Link
              href="#pitch"
              className="cta"
              style={{
                color: "var(--accent)",
                borderTopColor:
                  "color-mix(in oklab, var(--bg) 20%, transparent)",
              }}
            >
              Start an AI-guided intake <span>→</span>
            </Link>
          </div>

          <div className="join-card">
            <div className="num">PATH 03</div>
            <div>
              <h2 className="h2">Stay in the loop</h2>
              <p className="body" style={{ marginTop: 10 }}>
                Weekly digest of group activity. Sent Mondays.
              </p>
            </div>
            <SubscribeForm />
            <div className="small">~50 subscribers</div>
          </div>
        </div>
      </section>

      {/* ───── RSVP form ───── */}
      <section className="section container" id="rsvp">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "calc(64px * var(--d))",
            alignItems: "start",
          }}
        >
          <div>
            <div className="section-label">
              <span className="idx">RSVP</span>{" "}
              <span>Friday&apos;s meeting</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              RSVP for the next meeting.
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "36ch" }}>
              See you Friday. The Teams link is in the weekly listserv — opt in
              below if you&apos;re not on it yet.
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "calc(64px * var(--d))",
            alignItems: "start",
          }}
        >
          <div>
            <div className="section-label">
              <span className="idx">PITCH</span>{" "}
              <span>Bring a problem to the group</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              Pitch a project.
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "36ch" }}>
              Sixty seconds at a Friday meeting works too. If you&apos;d rather
              write it down first, this form gives the group a structured one-pager
              to read before you arrive.
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
              <div>① The problem</div>
              <div>② Who it affects</div>
              <div>③ What you&apos;d build first</div>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 24,
          }}
        >
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
              partnerships · partnerships@uky.edu
              <br />
              press · press@uky.edu
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
                href="#"
                className="chip"
                style={{ fontSize: 12 }}
              >
                LinkedIn →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
