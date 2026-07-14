import Image from "next/image";
import Link from "next/link";
import { content } from "@/content/site";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import StudioReel from "@/components/StudioReel";

const FEATURED_STORIES = [
  {
    id: "ky-ahead",
    number: "01",
    question:
      "How do we help more people get the cancer screening they are due for?",
    image: "/media/research/ky-ahead-kentucky.svg",
    imageAlt:
      "Conceptual visualization of the Kentucky map with screening-navigation markers",
    motion: "map",
  },
  {
    id: "dr-retinopathy-rural-ky",
    number: "02",
    question:
      "How do we catch preventable vision loss before it changes a life?",
    image: "/media/research/retinopathy-concept.png",
    imageAlt:
      "Conceptual visualization of a portable retinal camera and retinal image",
    motion: "focus",
  },
  {
    id: "whole-blood-drone",
    number: "03",
    question:
      "Can blood travel by drone and still arrive ready for emergency use?",
    image: "/media/research/blood-drone-concept.png",
    imageAlt:
      "Conceptual visualization of a drone, insulated carrier, and test instrumentation",
    motion: "route",
  },
] as const;

const FRIDAY_MODES = [
  {
    number: "01",
    title: "Roundtables",
    body: "Talk through current work, hard questions, and what people are learning.",
  },
  {
    number: "02",
    title: "Demonstrations",
    body: "Members show tools, workflows, prototypes, and techniques they are using.",
  },
  {
    number: "03",
    title: "Learning sessions",
    body: "Learn a model, method, policy, or technical skill together.",
  },
  {
    number: "04",
    title: "Project pitches",
    body: "Bring an early idea and get questions and feedback from the room.",
  },
] as const;

type ResearchMotionKind = (typeof FEATURED_STORIES)[number]["motion"];

function ResearchMotion({ kind }: { kind: ResearchMotionKind }) {
  if (kind === "map") {
    return (
      <span className="studio-research-motion studio-research-motion-map" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} />
        ))}
      </span>
    );
  }

  if (kind === "focus") {
    return (
      <span className="studio-research-motion studio-research-motion-focus" aria-hidden="true">
        <span />
      </span>
    );
  }

  return (
    <span className="studio-research-motion studio-research-motion-route" aria-hidden="true">
      <span />
    </span>
  );
}

function getFeaturedStories() {
  return FEATURED_STORIES.flatMap((story) => {
    const project = content.projects.find((item) => item.id === story.id);
    return project ? [{ story, project }] : [];
  });
}

export default function HomePage() {
  const featured = getFeaturedStories();
  const { session, studentWork } = content;

  return (
    <>
      <Nav active="overview" tone="overlay" />

      <main className="studio-home">
        <header className="studio-hero" id="about">
          <div className="studio-hero-visual" aria-hidden="true">
            <Image
              src="/media/incubator-primary.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="studio-hero-photo"
            />
            <div className="studio-hero-shade" />
          </div>

          <div className="studio-hero-content">
            <div className="studio-hero-intro">
              <p className="studio-kicker">University of Kentucky AI Incubator</p>
              <h1>AI is changing every field.</h1>
            </div>

            <div className="studio-hero-copy">
              <p className="studio-hero-deck">Learn to work with it, together at UK.</p>
              <p className="studio-hero-lead">
                Every Friday at noon, students, faculty, and staff from across
                campus gather to solve problems and learn to use AI. The meeting
                is completely open. No coding background or project required.
              </p>

              <div className="studio-hero-actions">
                <a
                  className="studio-button studio-button-primary"
                  href={session.teamsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Attend this Friday <span aria-hidden="true">-&gt;</span>
                </a>
                <Link className="studio-text-link" href="/join#cant-make-friday">
                  I cannot attend at noon
                </Link>
              </div>
            </div>
          </div>

          <div className="studio-hero-foot" aria-label="Meeting details">
            <span>Every Friday</span>
            <span>12:00 pm</span>
            <span>Microsoft Teams</span>
            <span>Open to everyone</span>
          </div>
        </header>

        <section className="studio-builds" id="work" aria-labelledby="builds-title">
          <div className="studio-shell studio-builds-intro">
            <p className="studio-section-index">Current work</p>
            <div>
              <h2 id="builds-title">Three projects underway now.</h2>
              <p>
                Current teams are working on cancer screening, preventable
                vision loss, and blood delivery for rural emergency care.
              </p>
            </div>
          </div>

          <div className="studio-shell studio-build-gallery">
            {featured.map(({ story, project }) => (
              <article
                className="studio-research-card"
                data-project={project.id}
                key={project.id}
              >
                <figure className="studio-research-image">
                  <Image
                    src={story.image}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 900px) 88vw, 30vw"
                  />
                  <ResearchMotion kind={story.motion} />
                  <span className="studio-research-number">{story.number}</span>
                  <figcaption>Concept visualization</figcaption>
                </figure>

                <div className="studio-research-copy">
                  <div className="studio-research-meta">
                    <span>{project.area}</span>
                    <span>{project.stage}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p className="studio-research-question">{story.question}</p>
                  <p className="studio-research-summary">{project.summary}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="studio-shell studio-portfolio-link">
            <Link href="/projects">
              Explore the broader portfolio <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>

        <StudioReel />

        <section className="studio-friday" id="fridays" aria-labelledby="friday-title">
          <div className="studio-shell studio-friday-grid">
            <div className="studio-friday-when" aria-label="Friday meeting time">
              <span>FRI</span>
              <strong>12:00</strong>
              <small>Microsoft Teams / Completely open</small>
            </div>

            <div className="studio-friday-copy">
              <p className="studio-section-index">Every Friday at noon</p>
              <h2 id="friday-title">See a demo. Ask a question. Join the work.</h2>
              <p className="studio-friday-intro">
                Each meeting may include a project roundtable, demonstration,
                learning session, policy discussion, or new project pitch.
              </p>

              <div className="studio-friday-modes">
                {FRIDAY_MODES.map((mode) => (
                  <div key={mode.title}>
                    <span>{mode.number}</span>
                    <strong>{mode.title}</strong>
                    <p>{mode.body}</p>
                  </div>
                ))}
              </div>

              <div className="studio-friday-actions">
                <Link className="studio-button studio-button-primary" href="/join#rsvp">
                  Get the next invitation <span aria-hidden="true">-&gt;</span>
                </Link>
                <Link className="studio-text-link" href="/join#cant-make-friday">
                  I cannot attend at noon
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          className="studio-student-work"
          id="student-work"
          aria-labelledby="student-work-title"
        >
          <div className="studio-shell studio-student-work-head">
            <p className="studio-section-index">Student work</p>
            <div>
              <h2 id="student-work-title">Students are already making things.</h2>
              <p>
                Workshops, prototypes, and practical builds all have a place in
                the studio. These are three examples shared by students.
              </p>
            </div>
          </div>

          <div className="studio-shell studio-student-work-grid">
            {studentWork.map((item, index) => (
              <article className="studio-student-work-card" key={item.id}>
                <figure>
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 700px) 100vw, 33vw"
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </figure>
                <div>
                  <p className="studio-student-work-meta">
                    <span>{item.person}</span>
                    <span>{item.format}</span>
                  </p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="studio-shell studio-student-work-action">
            <Link href="/join#pitch">
              Bring what you are building Friday <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>

        <section className="studio-final" aria-labelledby="final-title">
          <div className="studio-shell studio-final-grid">
            <div>
              <p className="studio-section-index">Join the community</p>
              <h2 id="final-title">Start by showing up.</h2>
            </div>
            <div>
              <p>
                Come for one meeting. Listen, ask a question, or introduce
                yourself. That is enough.
              </p>
              <div className="studio-final-actions">
                <Link className="studio-button studio-button-primary" href="/join">
                  See every way to join <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
