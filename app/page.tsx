import Image from "next/image";
import Link from "next/link";
import CommercialPlayer from "@/components/CommercialPlayer";
import Footer from "@/components/Footer";
import ForbesFeature from "@/components/ForbesFeature";
import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import StoryChapter from "@/components/StoryChapter";
import { content } from "@/content/site";

const FEATURED_STORIES = [
  {
    id: "ky-ahead",
    image: "/media/research/ky-ahead-kentucky.svg",
    imageAlt: "Accurate Kentucky silhouette for the KY-AHEAD cancer-screening project",
  },
  {
    id: "dr-retinopathy-rural-ky",
    image: "/media/research/retinopathy-concept.png",
    imageAlt: "Portable retinal camera beside a retinal image",
  },
  {
    id: "whole-blood-drone",
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
      "Chaelyn McGuire built a site that helps her sorority organize outreach and raise money for survivors of domestic abuse. Her work is featured in Microsoft’s “Creating an AI Future for Kentucky.”",
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
      "Hunter Colson, Matthew Bernard, and Alex Dripchak built a tutor that asks students to explain their reasoning. Their work is featured in Microsoft’s “Creating an AI Future for Kentucky.”",
    video: "/media/studio-reel/05-hunter.mp4",
    poster: "/media/studio-reel/05-hunter.jpg",
  },
  {
    id: "vibe-coding-workshop",
    chapterId: "alex-workshop",
    side: "right",
    variant: "proof",
    title: "Agentic Engineering with Alex Dripchak",
    body:
      "Alex runs through a live demonstration of Agentic coding tools that UK students have access to.",
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
            <Logo
              alt="AI Incubator at the University of Kentucky"
              className="studio-hero-logo"
              src="/logo-incubator.png"
            />

            <div className="studio-hero-message">
              <h1>Learn AI by working on something real.</h1>
              <p className="studio-hero-deck">
                The AI Incubator is a group of students, faculty, and staff who
                meet once a week to solve problems with AI.
              </p>
            </div>
          </div>
        </header>

        <StoryChapter
          id="fridays"
          side="right"
          variant="anchor"
          title="Meet people across campus"
          body="to share strategies, pitch ambitious ideas, and test new tools."
          video="/media/story/02-student-demo.mp4"
          poster="/media/story/02-student-demo.jpg"
        >
          <CommercialPlayer />
        </StoryChapter>

        <ForbesFeature />

        <section
          className="studio-student-work studio-student-work-sequenced"
          aria-labelledby="student-work-title"
        >
          <StoryChapter
            id="student-work"
            side="left"
            variant="anchor"
            title="Students are building solutions"
            body="Founding their own startups, leading national discussions, and taking on real-life projects."
            video="/media/story/10-andrew-peng-drone-demo.mp4"
            poster="/media/story/10-andrew-peng-drone-demo.jpg"
            primaryLink={{
              href: "/pitch",
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
              <h2 id="builds-title">Current projects</h2>
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
                  <p className="studio-research-question">{project.question}</p>
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
          id="come-this-friday"
          side="left"
          tone="final"
          variant="anchor"
          title="Join the Incubator"
          body="We meet Fridays at noon on Microsoft Teams. Students, faculty, staff, researchers, and community partners are all welcome."
          video="/media/story/01-student-presenter.mp4"
          poster="/media/story/01-student-presenter.jpg"
          primaryLink={{ href: "/join", label: "Join the Incubator" }}
        />
      </main>

      <Footer />
    </>
  );
}
