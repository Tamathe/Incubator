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
  },
  {
    id: "dr-retinopathy-rural-ky",
    number: "02",
    question:
      "How do we catch preventable vision loss before it changes a life?",
    image: "/media/research/retinopathy-concept.png",
    imageAlt:
      "Conceptual visualization of a portable retinal camera and retinal image",
  },
  {
    id: "whole-blood-drone",
    number: "03",
    question:
      "Can blood travel by drone and still arrive ready for emergency use?",
    image: "/media/research/blood-drone-concept.png",
    imageAlt:
      "Conceptual visualization of a drone, insulated carrier, and test instrumentation",
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
];

const DISCIPLINES = [
  "Medicine",
  "Engineering",
  "Education",
  "Design",
  "Agriculture",
  "Humanities",
  "Business",
  "Public Health",
  "Nursing",
  "Communication",
];

function getFeaturedStories() {
  return FEATURED_STORIES.flatMap((story) => {
    const project = content.projects.find((item) => item.id === story.id);
    return project ? [{ story, project }] : [];
  });
}

export default function HomePage() {
  const featured = getFeaturedStories();
  const { session } = content;

  return (
    <>
      <Nav active="overview" tone="overlay" />

      <main className="studio-home">
        <header className="studio-hero">
          <div className="studio-hero-visual">
            <Image
              src="/media/incubator-primary.jpg"
              alt="University of Kentucky AI Incubator members gathered at a campus showcase"
              fill
              priority
              sizes="100vw"
              className="studio-hero-photo"
            />
            <div className="studio-hero-shade" aria-hidden="true" />
          </div>

          <div className="studio-hero-content">
            <div className="studio-hero-intro">
              <p className="studio-kicker">University of Kentucky</p>
              <h1>This is where UK learns AI together.</h1>
            </div>

            <div className="studio-hero-copy">
              <p className="studio-hero-lead">
                Every Friday at noon, students, faculty, and staff meet on Teams
                to share projects, demonstrate tools, learn new skills, and ask
                questions. Anyone can attend. You do not need a project or coding
                background.
              </p>

              <div className="studio-hero-actions">
                <a
                  className="studio-button studio-button-primary"
                  href={session.teamsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Attend this Friday <span aria-hidden="true">→</span>
                </a>
                <Link className="studio-button studio-button-glass" href="/join#cant-make-friday">
                  Friday at noon doesn&apos;t work?
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

        <section className="studio-manifesto" aria-labelledby="manifesto-title">
          <div className="studio-shell studio-manifesto-grid">
            <p className="studio-section-index">Across campus</p>
            <div>
              <h2 id="manifesto-title">
                AI needs every field.
              </h2>
              <p>
                Students, faculty, and staff bring knowledge of patients,
                classrooms, communities, systems, language, ethics, and design.
                On Fridays, they compare how AI is being used in their fields
                and discuss the questions it raises.
              </p>
            </div>
          </div>

          <div className="studio-discipline-rail" aria-label="Disciplines welcome at the Incubator">
            <div className="studio-discipline-track">
              <div>
                {DISCIPLINES.map((discipline) => (
                  <span key={discipline}>{discipline}</span>
                ))}
              </div>
              <div aria-hidden="true">
                {DISCIPLINES.map((discipline) => (
                  <span key={discipline}>{discipline}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <StudioReel />

        <section className="studio-builds" id="work" aria-labelledby="builds-title">
          <div className="studio-shell studio-builds-intro">
            <p className="studio-section-index">Three flagship builds</p>
            <div>
              <h2 id="builds-title">
                Cancer screening. Rural vision. Trauma logistics.
              </h2>
              <p>
                Faculty, students, clinicians, engineers, and community
                partners are working on these projects now.
              </p>
            </div>
          </div>

          <div className="studio-shell studio-build-gallery">
            {featured.map(({ story, project }) => (
              <article className="studio-research-card" key={project.id}>
                <figure className="studio-research-image">
                  <Image
                    src={story.image}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 900px) 88vw, 30vw"
                  />
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
              Explore the broader portfolio <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section className="studio-friday" id="fridays" aria-labelledby="friday-title">
          <div className="studio-shell studio-friday-grid">
            <div className="studio-friday-when" aria-label="Friday meeting time">
              <span>FRI</span>
              <strong>12:00</strong>
              <small>Microsoft Teams · Completely open</small>
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
                <a
                  className="studio-button studio-button-light"
                  href={session.teamsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the Friday meeting <span aria-hidden="true">→</span>
                </a>
                <Link className="studio-text-link" href="/join#cant-make-friday">
                  I can&apos;t attend at noon
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="studio-final" aria-labelledby="final-title">
          <div className="studio-shell studio-final-grid">
            <div>
              <p className="studio-section-index">Your first Friday</p>
              <h2 id="final-title">Start by showing up.</h2>
            </div>
            <div>
              <p>
                Come for one meeting. Listen, ask a question, or introduce
                yourself. That is enough.
              </p>
              <div className="studio-final-actions">
                <a
                  className="studio-button studio-button-primary"
                  href={session.teamsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Attend this Friday <span aria-hidden="true">→</span>
                </a>
                <Link className="studio-button studio-button-dark" href="/join">
                  See every way to join
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
