import Image from "next/image";
import Link from "next/link";
import CommercialPlayer from "@/components/CommercialPlayer";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import StoryChapter from "@/components/StoryChapter";
import { content } from "@/content/site";

const FEATURED_STORIES = [
  {
    id: "ky-ahead",
    question:
      "How do we help more people get the cancer screening they are due for?",
    image: "/media/research/ky-ahead-kentucky.svg",
    imageAlt: "Accurate Kentucky silhouette for the KY-AHEAD cancer-screening project",
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

function getStudentStoryLink(id: string) {
  const item = content.studentWork.find((work) => work.id === id);
  if (!item?.videoUrl) return undefined;

  return {
    href: item.videoUrl,
    label: item.videoLabel ?? "Watch the video",
    external: true,
  };
}

export default function HomePage() {
  const featured = getFeaturedStories();
  const studentStories = STUDENT_STORIES;

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
                src="/logo-incubator.png"
              />
              <p className="studio-hero-kicker">The AI Incubator at UK</p>
              <h1>Learn AI by working on something real.</h1>
            </div>

            <div className="studio-hero-copy">
              <p className="studio-hero-deck">
                Every Friday, people across UK bring questions, show unfinished
                work, and help each other figure out the next step.
              </p>

              <p className="studio-hero-lead">
                You can come listen. You do not need AI or coding experience.
              </p>

              <div className="studio-hero-actions">
                <Link
                  className="studio-button studio-button-primary"
                  href="/join"
                >
                  Plan your first Friday <span aria-hidden="true">-&gt;</span>
                </Link>
                <Link className="studio-text-link" href="/projects">
                  See current projects <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>

              <p className="studio-hero-meta">
                Fridays at noon <span aria-hidden="true">/</span> Microsoft Teams
                <span aria-hidden="true">/</span> Open across UK
              </p>
            </div>
          </div>
        </header>

        <StoryChapter
          id="fridays"
          side="right"
          variant="anchor"
          title="Friday is where the community meets."
          body="One week, a student demos a tool. The next, someone brings a research problem or asks the group to test an idea. The agenda changes because the people in the room change it."
          video="/media/story/02-student-demo.mp4"
          poster="/media/story/02-student-demo.jpg"
        >
          <CommercialPlayer />
        </StoryChapter>

        <section
          className="studio-student-work studio-student-work-sequenced"
          aria-labelledby="student-work-title"
        >
          <StoryChapter
            id="student-work"
            side="left"
            variant="anchor"
            title="Students do not have to wait until they are experts."
            body="They can bring a problem, build a small first version, and show the group what happened."
            video="/media/story/01-student-presenter.mp4"
            poster="/media/story/01-student-presenter.jpg"
            primaryLink={{
              href: "/join#pitch",
              label: "Bring your work to the group",
            }}
          />

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
                primaryLink={getStudentStoryLink(story.id)}
              />
            ))}
          </div>
        </section>

        <section className="studio-builds" id="work" aria-labelledby="builds-title">
          <div className="studio-shell studio-builds-intro">
            <div>
              <p className="studio-section-index">Current projects</p>
              <h2 id="builds-title">Projects people are building together</h2>
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
              See the full project list <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>

        <StoryChapter
          id="come-this-friday"
          side="left"
          tone="final"
          variant="anchor"
          title="Come once. See what you think."
          body="We meet Fridays at noon on Microsoft Teams. Students, faculty, and staff across UK are welcome. You can bring a question, a project, or nothing at all."
          video="/media/story/04-smiling-student.mp4"
          poster="/media/story/04-smiling-student.jpg"
          primaryLink={{ href: "/join", label: "Plan your first Friday" }}
        />
      </main>

      <Footer />
    </>
  );
}
