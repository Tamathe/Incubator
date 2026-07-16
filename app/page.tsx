import Image from "next/image";
import Link from "next/link";
import CommercialPlayer from "@/components/CommercialPlayer";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import StudioClipStrip from "@/components/StudioClipStrip";
import StoryChapter from "@/components/StoryChapter";
import { content } from "@/content/site";

const FEATURED_STORIES = [
  {
    id: "ky-ahead",
    question:
      "How do we help more people get the cancer screening they are due for?",
    image: "/media/research/ky-ahead-concept.png",
    imageAlt: "Kentucky map for the KY-AHEAD cancer-screening project",
  },
  {
    id: "dr-retinopathy-rural-ky",
    question:
      "Could AI-supported screening help catch diabetic eye disease earlier in rural Kentucky?",
    image: "/media/research/retinopathy-concept.png",
    imageAlt: "Portable retinal camera beside a retinal image",
  },
  {
    id: "whole-blood-drone",
    question:
      "Can whole blood stay at the right temperature and remain intact during a drone flight?",
    image: "/media/research/blood-drone-concept.png",
    imageAlt: "Drone carrying an insulated container with test instrumentation",
  },
] as const;

const STUDENT_STORIES = [
  {
    id: "philanthropy-outreach-site",
    chapterId: "chaelyn-build",
    side: "right",
    variant: "standard",
    title: "Philanthropy outreach site",
    body:
      "Chaelyn McGuire built the site to help her sorority organize outreach and raise money for survivors of domestic abuse.",
    video: "/media/studio-reel/03-chaelyn.mp4",
    poster: "/media/studio-reel/03-chaelyn.jpg",
  },
  {
    id: "socratic-tutor",
    chapterId: "hunter-tutor",
    side: "left",
    variant: "proof",
    title: "Socratic Tutor",
    body:
      "Hunter Colson, Matthew Bernard, and Alex Dripchak built a tutor that answers with questions and asks students to explain their reasoning.",
    video: "/media/studio-reel/05-hunter.mp4",
    poster: "/media/studio-reel/05-hunter.jpg",
  },
  {
    id: "vibe-coding-workshop",
    chapterId: "alex-workshop",
    side: "right",
    variant: "proof",
    title: "An introduction to vibe coding with Alex Dripchak",
    video: "/media/story/07-alex-vibecoding.mp4",
    poster: "/media/story/07-alex-vibecoding.jpg",
  },
] as const;

function getFeaturedStories() {
  return FEATURED_STORIES.flatMap((story) => {
    const project = content.projects.find((item) => item.id === story.id);
    return project ? [{ story, project }] : [];
  });
}

export default function HomePage() {
  const featured = getFeaturedStories();
  const studentStories = STUDENT_STORIES;
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
              <Logo
                alt="AI Incubator at the University of Kentucky"
                className="studio-hero-logo"
                src="/logo-incubator-modern.png"
                style={{
                  width: "clamp(170px, 15vw, 220px)",
                  height: "auto",
                  borderRadius: 4,
                  boxShadow: "0 18px 44px rgba(0, 0, 0, 0.28)",
                }}
              />
              <h1>Students, faculty, and staff are using AI to solve problems.</h1>
            </div>

            <div className="studio-hero-copy">
              <p className="studio-hero-deck">
                Current work includes cancer screening, rural eye care,
                emergency medicine, tutoring, and student-built tools.
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
          title="The person teaching changes every week."
          body="Recent sessions have included image segmentation, vibe coding, Socratic tutors, and student-built websites."
          video="/media/story/01-student-presenter.mp4"
          poster="/media/story/01-student-presenter.jpg"
        >
          <CommercialPlayer />
        </StoryChapter>

        <StudioClipStrip />

        <section className="studio-builds" id="work" aria-labelledby="builds-title">
          <div className="studio-shell studio-builds-intro">
            <h2 id="builds-title">What people are working on</h2>
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
                </figure>

                <div className="studio-research-copy">
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
            <div>
              <h2 id="student-work-title">Student projects</h2>
              <Link className="studio-student-work-share" href="/join#pitch">
                Share a project or demo <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </div>

          <div className="studio-student-work-stories">
            {studentStories.map((story) => (
              <StoryChapter
                id={story.chapterId}
                key={story.id}
                side={story.side}
                variant={story.variant}
                title={story.title}
                body={"body" in story ? story.body : undefined}
                video={story.video}
                poster={story.poster}
                focus={story.id === "philanthropy-outreach-site" ? "46% center" : undefined}
              />
            ))}
          </div>

        </section>

        <StoryChapter
          id="hunter-image-segmentation"
          side="left"
          variant="proof"
          title="Hunter Colson on medical image segmentation"
          video="/media/story/08-hunter-image-segmentation.mp4"
          poster="/media/story/08-hunter-image-segmentation.jpg"
          withSound
        />

        <StoryChapter
          id="sully-chen"
          side="right"
          variant="proof"
          title="Sully Chen on AI and time with patients"
          body="Sully joined from Duke to talk about his work at OpenAI and AI in medicine."
          video="/media/story/09-sully-chen.mp4"
          poster="/media/story/09-sully-chen.jpg"
          withSound
        />

        <StoryChapter
          id="come-this-friday"
          side="left"
          tone="final"
          variant="anchor"
          title="Join the AI Incubator."
          body="We meet Fridays at noon on Microsoft Teams. Students, faculty, and staff across UK are welcome. No AI or coding experience is required."
          video="/media/story/04-smiling-student.mp4"
          poster="/media/story/04-smiling-student.jpg"
          primaryLink={{ href: "/join", label: "Join us Friday" }}
        />
      </main>

      <Footer />
    </>
  );
}
