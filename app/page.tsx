import Image from "next/image";
import Link from "next/link";
import CommercialPlayer from "@/components/CommercialPlayer";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import StudioClipStrip from "@/components/StudioClipStrip";
import StoryChapter from "@/components/StoryChapter";
import { content } from "@/content/site";

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

const STUDENT_STORIES = [
  {
    id: "philanthropy-outreach-site",
    chapterId: "chaelyn-build",
    side: "right",
    variant: "standard",
    title: "Chaelyn built a site for philanthropy outreach.",
    body:
      "It helps her sorority organize outreach and raise money for survivors of domestic abuse. She put the working site on screen and walked the room through it.",
    video: "/media/studio-reel/03-chaelyn.mp4",
    poster: "/media/studio-reel/03-chaelyn.jpg",
    caption: "Chaelyn and other students walk through the philanthropy site",
  },
  {
    id: "socratic-tutor",
    chapterId: "hunter-tutor",
    side: "left",
    variant: "proof",
    title: "Hunter built a tutor that answers with questions.",
    body:
      "It asks students to explain their reasoning. The room tried it, challenged it, and helped him decide what to test next.",
    video: "/media/studio-reel/05-hunter.mp4",
    poster: "/media/studio-reel/05-hunter.jpg",
    caption: "Hunter explains the Socratic Tutor prototype",
  },
  {
    id: "vibe-coding-workshop",
    chapterId: "alex-workshop",
    side: "right",
    variant: "proof",
    title: "Alex led a coding workshop.",
    body:
      "Participants used AI coding tools to build a small app during the session.",
    video: "/media/story/07-alex-vibecoding.mp4",
    poster: "/media/story/07-alex-vibecoding.jpg",
    caption: "Alex leads a live AI-assisted coding session",
  },
] as const;

type ResearchMotionKind = (typeof FEATURED_STORIES)[number]["motion"];

function ResearchMotion({ kind }: { kind: ResearchMotionKind }) {
  if (kind === "map") {
    return (
      <span
        className="studio-research-motion studio-research-motion-map"
        aria-hidden="true"
      >
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} />
        ))}
      </span>
    );
  }

  if (kind === "focus") {
    return (
      <span
        className="studio-research-motion studio-research-motion-focus"
        aria-hidden="true"
      >
        <span />
      </span>
    );
  }

  return (
    <span
      className="studio-research-motion studio-research-motion-route"
      aria-hidden="true"
    >
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

function getStudentStories() {
  return STUDENT_STORIES.flatMap((story) => {
    const item = content.studentWork.find((work) => work.id === story.id);
    return item ? [{ story, item }] : [];
  });
}

export default function HomePage() {
  const featured = getFeaturedStories();
  const studentStories = getStudentStories();
  const { session } = content;

  return (
    <>
      <Nav active="overview" tone="overlay" />

      <main className="studio-home">
        <header className="studio-hero" id="about">
          <div className="studio-hero-visual">
            <Image
              src="/media/incubator-primary.jpg"
              alt="Students, faculty, and staff from the UK AI Incubator gathered at a campus event"
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
                Every Friday at noon, someone in the room has something the rest of us can learn from.
              </p>
              <p className="studio-hero-lead">
                Students, faculty, and staff bring tools, problems, and work in
                progress. The room helps decide what to try next.
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
              </div>

              <p className="studio-hero-meta">
                Microsoft Teams <span aria-hidden="true">/</span> Open across UK
              </p>
            </div>
          </div>
        </header>

        <StoryChapter
          id="fridays"
          side="right"
          variant="anchor"
          eyebrow="A Friday meeting"
          title="The person teaching changes every week."
          body="One week, a student shows a tool. The next, a clinician brings a problem and an engineer helps figure out how to test it. Whoever has learned something can lead."
          video="/media/story/01-student-presenter.mp4"
          poster="/media/story/01-student-presenter.jpg"
          caption="A student presents his work to the room"
        />

        <StudioClipStrip />

        <section className="studio-builds" id="work" aria-labelledby="builds-title">
          <div className="studio-shell studio-builds-intro">
            <p className="studio-section-index">What people are working on</p>
            <div>
              <h2 id="builds-title">Some of those ideas become projects.</h2>
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
              <h2 id="student-work-title">What students brought to Friday.</h2>
              <Link className="studio-student-work-share" href="/join#pitch">
                Share what you are building <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </div>

          <div className="studio-student-work-stories">
            {studentStories.map(({ story, item }) => (
              <StoryChapter
                id={story.chapterId}
                key={story.id}
                side={story.side}
                variant={story.variant}
                eyebrow={`${item.person} / ${item.format}`}
                title={story.title}
                body={story.body}
                video={story.video}
                poster={story.poster}
                caption={story.caption}
                secondaryLink={
                  item.videoUrl && item.videoLabel
                    ? {
                        href: item.videoUrl,
                        label: item.videoLabel,
                        external: true,
                      }
                    : undefined
                }
              />
            ))}
          </div>

        </section>

        <StoryChapter
          id="join-from-anywhere"
          side="left"
          variant="proof"
          eyebrow="Join from anywhere"
          title="Sometimes the person teaching is on a screen."
          body="Students and guests can join on Teams, walk through a project, and take questions from the room."
          video="/media/story/03-zoom-presentation.mp4"
          poster="/media/story/03-zoom-presentation.jpg"
          caption="A remote presentation plays on the room's main screen"
        />

        <StoryChapter
          id="come-this-friday"
          side="right"
          tone="final"
          variant="anchor"
          eyebrow="Come this Friday"
          title="What would you show the room?"
          body="Bring a tool, a problem, or something that worked. Or just come listen. No AI or coding experience is required. Just bring your curiosity."
          video="/media/story/04-smiling-student.mp4"
          poster="/media/story/04-smiling-student.jpg"
          caption="A student smiles during an Incubator event"
          primaryLink={{ href: "/join", label: "Join Friday's meeting" }}
        >
          <CommercialPlayer />
        </StoryChapter>
      </main>

      <Footer />
    </>
  );
}
