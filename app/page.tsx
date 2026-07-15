import Image from "next/image";
import Link from "next/link";
import CommercialPlayer from "@/components/CommercialPlayer";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
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

const FRIDAY_MODES = [
  {
    number: "01",
    title: "Show something",
    body: "Bring a tool, a method, or something that worked.",
  },
  {
    number: "02",
    title: "Ask for help",
    body: "It does not have to be polished. Let the room ask questions.",
  },
  {
    number: "03",
    title: "Try it",
    body: "Test the tool or prototype and see where it holds up.",
  },
  {
    number: "04",
    title: "Pick the next step",
    body: "Decide what is worth doing before the next meeting.",
  },
] as const;

const STUDENT_STORIES = [
  {
    id: "philanthropy-outreach-site",
    chapterId: "chaelyn-build",
    side: "right",
    variant: "anchor",
    title: "Chaelyn brought a site she built.",
    body:
      "She made it to help her sorority organize outreach and raise money for survivors of domestic abuse. Then she put the real thing on screen so everyone could see how it worked.",
    video: "/media/studio-reel/03-chaelyn.mp4",
    poster: "/media/studio-reel/03-chaelyn.jpg",
    caption: "Chaelyn and other students walk through the philanthropy site",
  },
  {
    id: "socratic-tutor",
    chapterId: "hunter-tutor",
    side: "left",
    variant: "proof",
    title: "Hunter brought a tutor that answers with questions.",
    body:
      "He showed how it asks students to explain their reasoning. The room tried it, challenged it, and helped him think about what to test next.",
    video: "/media/studio-reel/05-hunter.mp4",
    poster: "/media/studio-reel/05-hunter.jpg",
    caption: "Hunter explains the Socratic Tutor prototype",
  },
  {
    id: "vibe-coding-workshop",
    chapterId: "alex-workshop",
    side: "right",
    variant: "proof",
    title: "Alex led a hands-on build.",
    body:
      "Participants used AI coding tools to build a small app during the session. They did not just hear about the tools. They left having made something.",
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
                Every Friday, someone in the room has something the rest of us can learn from.
              </p>
              <p className="studio-hero-lead">
                Students, faculty, and staff show what they are trying, bring
                real problems, and help one another figure out what comes next.
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

        <StoryChapter
          id="a-friday-meeting"
          side="right"
          variant="anchor"
          eyebrow="A Friday meeting"
          title="The person teaching the room changes every week."
          body="One Friday it is a student showing a tool. The next it might be a clinician walking through a workflow, or a staff member explaining what failed. Anyone can bring something the rest of us can learn from."
          video="/media/story/01-student-presenter.mp4"
          poster="/media/story/01-student-presenter.jpg"
          caption="A student presents his work to the room"
        />

        <section className="studio-builds" id="work" aria-labelledby="builds-title">
          <div className="studio-shell studio-builds-intro">
            <p className="studio-section-index">What people are working on</p>
            <div>
              <h2 id="builds-title">Some of those ideas become projects.</h2>
              <p>
                Right now, teams are working on cancer screening, rural eye
                care, and whether blood can stay within the right temperature
                and integrity limits during drone flight. The cards below say
                what is happening now and what is still being planned.
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

        <StoryChapter
          id="bring-what-you-built"
          side="left"
          variant="standard"
          eyebrow="Then the room gets involved"
          title="Bring what you built."
          body="This is not a show-and-tell where everyone nods and moves on. People gather around the screen, ask how it works, spot what is missing, and help decide what to try next."
          video="/media/story/02-student-demo.mp4"
          poster="/media/story/02-student-demo.jpg"
          caption="Students gather around a project demo"
        />

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
          eyebrow="The room can stretch"
          title="Sometimes the person teaching is on a screen."
          body="A student can walk the room through a project. A guest can call in from somewhere else. If you have tried something and learned from it, you have something worth sharing."
          video="/media/story/03-zoom-presentation.mp4"
          poster="/media/story/03-zoom-presentation.jpg"
          caption="A remote presentation plays on the room's main screen"
        />

        <StoryChapter
          id="fridays"
          side="right"
          tone="blue"
          variant="anchor"
          eyebrow="Every Friday at noon"
          title="Here is what we do on Fridays."
          body="The agenda changes, but the meeting is simple: show people something, ask for help, try an idea, and leave with a next step."
          video="/media/story/05-audience.mp4"
          poster="/media/story/05-audience.jpg"
          caption="Students listen and ask questions during a presentation"
          details={FRIDAY_MODES}
          primaryLink={{ href: "/join#rsvp", label: "Join us this Friday" }}
          secondaryLink={{
            href: "/join#cant-make-friday",
            label: "What if I cannot make Friday?",
          }}
        />

        <StoryChapter
          id="the-room-teaches-back"
          side="left"
          variant="proof"
          eyebrow="The room teaches back"
          title="One person starts. Everybody adds something."
          body="Someone spots a problem. Someone else knows a tool. A third person has seen the same thing in another field. By the end, the person who brought the idea usually has a clearer next step."
          video="/media/story/06-event-crowd.mp4"
          poster="/media/story/06-event-crowd.jpg"
          caption="People crowd around a screen to see a student demo"
        />

        <StoryChapter
          id="come-this-friday"
          side="right"
          tone="final"
          variant="anchor"
          eyebrow="Come this Friday"
          title="What would you show the room?"
          body="Bring a tool, a method, a problem, or something that worked. Or just come listen the first time. You do not need AI or coding experience. Just bring your curiosity."
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
