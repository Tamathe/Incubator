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
      "Could AI-supported screening help catch diabetic eye disease earlier in rural Kentucky?",
    image: "/media/research/retinopathy-concept.png",
    imageAlt:
      "Conceptual visualization of a portable retinal camera and retinal image",
    motion: "focus",
  },
  {
    id: "whole-blood-drone",
    number: "03",
    question:
      "Can whole blood stay at the right temperature and remain intact during a drone flight?",
    image: "/media/research/blood-drone-concept.png",
    imageAlt:
      "Conceptual visualization of a drone, insulated carrier, and test instrumentation",
    motion: "route",
  },
] as const;

const FRIDAY_MODES = [
  {
    number: "01",
    title: "Show what you learned",
    body: "Bring a tool, a method, or something that worked.",
  },
  {
    number: "02",
    title: "Bring an idea",
    body: "It does not have to be polished. The group will ask questions.",
  },
  {
    number: "03",
    title: "Try it together",
    body: "Test the tool or prototype and see where it holds up.",
  },
  {
    number: "04",
    title: "Choose the next step",
    body: "Decide what is worth doing before the next meeting.",
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

function StudentWorkCard({
  item,
  index,
}: {
  item: (typeof content.studentWork)[number];
  index: number;
}) {
  const cardContent = (
    <>
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
        {item.videoLabel ? (
          <span className="studio-student-work-watch">
            {item.videoLabel} <span aria-hidden="true">-&gt;</span>
          </span>
        ) : null}
      </div>
    </>
  );

  if (!item.videoUrl || !item.videoLabel) {
    return <article className="studio-student-work-card">{cardContent}</article>;
  }

  return (
    <a
      className="studio-student-work-card"
      href={item.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title}: ${item.videoLabel}`}
    >
      {cardContent}
    </a>
  );
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
              <h1>AI is changing how people work.</h1>
            </div>

            <div className="studio-hero-copy">
              <p className="studio-hero-deck">
                The AI Incubator is where people across UK compare notes and build things together.
              </p>
              <p className="studio-hero-lead">
                Students, faculty, and staff meet every Friday at noon. Someone
                shows a tool. Someone brings a problem. Someone pitches an
                idea. The group asks questions, tries things, and helps decide
                what to do next.
              </p>

              <div className="studio-hero-actions">
                <a
                  className="studio-button studio-button-primary"
                  href={session.teamsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join us this Friday <span aria-hidden="true">-&gt;</span>
                </a>
                <Link className="studio-text-link" href="/projects">
                  See what people are working on
                </Link>
              </div>
            </div>
          </div>

          <div className="studio-hero-foot" aria-label="Meeting details">
            <span>Every Friday</span>
            <span>12:00 pm</span>
            <span>Microsoft Teams</span>
            <span>Open across UK</span>
          </div>
        </header>

        <section className="studio-manifesto" aria-labelledby="possibility-title">
          <div className="studio-shell studio-manifesto-grid">
            <p className="studio-section-index">Why we meet</p>
            <div>
              <h2 id="possibility-title">
                Ideas get better when you put them in front of other people.
              </h2>
              <p>
                A clinician may know the problem. An engineer may know how to
                test it. A student may see a simpler way in. The Incubator gives
                them a place to meet, try something, and learn from it.
              </p>
            </div>
          </div>
        </section>

        <StudioReel />

        <section className="studio-builds" id="work" aria-labelledby="builds-title">
          <div className="studio-shell studio-builds-intro">
            <p className="studio-section-index">What people are working on</p>
            <div>
              <h2 id="builds-title">Some of those ideas become projects.</h2>
              <p>
                Right now, teams are working on cancer screening, rural eye
                care, and whether blood can stay within the right temperature
                and integrity limits during drone flight. The cards below say
                what is happening now—and what is still being planned.
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
              See all projects <span aria-hidden="true">-&gt;</span>
            </Link>
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
              <h2 id="student-work-title">Students are making things, too.</h2>
              <p>
                Sometimes a Friday idea becomes a working tool, a workshop, or
                a new research question. Here are three examples.
              </p>
            </div>
          </div>

          <div className="studio-shell studio-student-work-grid">
            {studentWork.map((item, index) => (
              <StudentWorkCard item={item} index={index} key={item.id} />
            ))}
          </div>

          <div className="studio-shell studio-student-work-action">
            <Link href="/join#pitch">
              Share what you are building <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>

        <section className="studio-friday" id="fridays" aria-labelledby="friday-title">
          <div className="studio-shell studio-friday-grid">
            <p className="studio-section-index studio-friday-label">Every Friday at noon</p>

            <div className="studio-friday-copy">
              <h2 id="friday-title">Here is what we do on Fridays.</h2>
              <p className="studio-friday-intro">
                The agenda changes, but the meeting is simple: show people
                something, ask for help, try an idea, and leave with a next step.
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
                  Join us this Friday <span aria-hidden="true">-&gt;</span>
                </Link>
                <Link className="studio-text-link" href="/join#cant-make-friday">
                  What if I cannot make Friday?
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="studio-final" aria-labelledby="final-title">
          <div className="studio-shell studio-final-grid">
            <div>
              <p className="studio-section-index">Come to a meeting</p>
              <h2 id="final-title">Come by on Friday.</h2>
            </div>
            <div>
              <p>
                You do not need to know how to code or have a project ready.
                Bring a question, tell us what you are curious about, or just
                listen the first time.
              </p>
              <div className="studio-final-actions">
                <Link className="studio-button studio-button-primary" href="/join">
                  Join Friday&apos;s meeting <span aria-hidden="true">-&gt;</span>
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
