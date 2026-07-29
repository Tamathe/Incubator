import type { Metadata } from "next";
import Link from "next/link";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { content, type MeetingSession } from "@/content/site";
import styles from "./page.module.css";

const SESSION_DATE = "2026-07-31";
const SESSION_PATH = "/sessions/copilot-cowork-knowledge-work";

function getSession(): MeetingSession {
  const session = content.meetings.find(
    (meeting) =>
      meeting.date === SESSION_DATE && meeting.pageUrl === SESSION_PATH,
  );

  if (!session) {
    throw new Error(`Missing session content for ${SESSION_PATH}`);
  }

  return session;
}

function recordingEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }

    if (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com"
    ) {
      const videoId = parsed.searchParams.get("v");
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function generateMetadata(): Metadata {
  const session = getSession();
  const isRecorded = Boolean(session.recordingUrl);
  const description = isRecorded
    ? "Watch Andrew Peng and Tama Thé demonstrate two ways to keep AI work grounded in project context."
    : "Join Andrew Peng and Tama Thé on July 31 for two practical walkthroughs of AI-supported research, planning, and ongoing knowledge work.";

  return {
    title: `${session.title} · AI Incubator`,
    description,
    alternates: { canonical: SESSION_PATH },
    openGraph: {
      title: session.title,
      description,
      type: "article",
      url: SESSION_PATH,
      images: [
        {
          url: "/media/sessions/copilot-cowork-knowledge-work-og.png",
          width: 1200,
          height: 630,
          alt: "Copilot Cowork for knowledge work, an AI Incubator learning session",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: session.title,
      description,
      images: ["/media/sessions/copilot-cowork-knowledge-work-og.png"],
    },
  };
}

const workflowCards = [
  {
    number: "01",
    tool: "Research project",
    presenter: "Andrew Peng",
    title: "Keep a research effort organized.",
    body:
      "Andrew will show how he gives a real research effort standing instructions and source material, then keeps the work coherent over time.",
  },
  {
    number: "02",
    tool: "Ongoing project",
    presenter: "Tama Thé",
    title: "Move ongoing work forward.",
    body:
      "Tama will show how he starts from project files, organizes the next steps, drafts from source material, and manages work that continues across sessions.",
  },
] as const;

export default function CopilotCoworkKnowledgeWorkPage() {
  const session = getSession();
  const isRecorded = Boolean(session.recordingUrl);
  const embedUrl = session.recordingUrl
    ? recordingEmbedUrl(session.recordingUrl)
    : null;

  return (
    <>
      <Nav active="fridays" />

      <main className={styles.page}>
        <header className={`container ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <div className={styles.statusLine}>
              <span className={styles.liveDot} aria-hidden="true" />
              <span>{isRecorded ? "Session recording" : "Upcoming learning session"}</span>
            </div>

            <h1>
              Copilot Cowork <span>for</span> knowledge work.
            </h1>

            <p className={styles.lead}>
              Two practical walkthroughs of how AI can support a real project
              after the first prompt. Andrew Peng will open a research effort
              with standing instructions and source material. Tama Thé will
              show how he uses project files to plan and manage work that
              continues over time.
            </p>

            <div className={styles.heroActions}>
              {isRecorded && session.recordingUrl ? (
                <a className="btn primary lg" href="#recording">
                  Watch the recording <span className="arrow">↓</span>
                </a>
              ) : (
                <>
                  <a
                    className="btn primary lg"
                    href={content.session.teamsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join on Microsoft Teams <span className="arrow">→</span>
                  </a>
                  <AddToCalendarButton
                    meeting={session}
                    indexOnDate={0}
                    className="btn lg"
                  />
                </>
              )}
            </div>

            <p className={styles.audienceNote}>
              Open to UK students, faculty, and staff. No preparation required.
            </p>
          </div>

          <aside className={styles.sessionCard} aria-label="Session details">
            <div className={styles.cardTopline}>
              <span className="mono">Friday learning session</span>
              <span className={styles.cardIndex}>07.31</span>
            </div>

            <div className={styles.toolPair} aria-hidden="true">
              <div className={styles.toolMark}>01</div>
              <div className={styles.connector}>
                <span />
                <span>project context</span>
                <span />
              </div>
              <div className={`${styles.toolMark} ${styles.toolMarkBlue}`}>
                02
              </div>
            </div>

            <dl className={styles.details}>
              <div>
                <dt>Date</dt>
                <dd>Friday, July 31, 2026</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>Noon to 12:30 p.m. ET</dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>Microsoft Teams</dd>
              </div>
              <div>
                <dt>With</dt>
                <dd>{session.presenters}</dd>
              </div>
            </dl>

            <p className={styles.recordingNote}>
              {isRecorded
                ? "Recorded by the AI Incubator at the University of Kentucky."
                : "We plan to record the session. This page will become the recording page after the event."}
            </p>
          </aside>
        </header>

        {isRecorded && session.recordingUrl && (
          <section
            className={`container ${styles.recordingSection}`}
            id="recording"
            aria-labelledby="recording-title"
          >
            <div className={styles.sectionIntro}>
              <p className="mono">Recording</p>
              <h2 id="recording-title">Watch the session.</h2>
            </div>

            {embedUrl ? (
              <div className={styles.videoFrame}>
                <iframe
                  src={embedUrl}
                  title={session.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                className={styles.recordingLink}
                href={session.recordingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Watch the full recording <span aria-hidden="true">→</span>
              </a>
            )}
          </section>
        )}

        <section
          className={`container ${styles.coverage}`}
          aria-labelledby="coverage-title"
        >
          <div className={styles.sectionIntro}>
            <p className="mono">{isRecorded ? "In this session" : "What we’ll cover"}</p>
            <h2 id="coverage-title">The work behind the chat window.</h2>
            <p>
              Most AI demonstrations end with a good answer. This one starts
              with the harder question: how do you give an AI tool enough
              context to help with a project that lasts for weeks or months?
            </p>
          </div>

          <div className={styles.workflowGrid}>
            {workflowCards.map((card) => (
              <article className={styles.workflowCard} key={card.tool}>
                <div className={styles.workflowMeta}>
                  <span>{card.number}</span>
                  <span>{card.presenter}</span>
                </div>
                <p className={styles.toolName}>{card.tool}</p>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.distinction}>
          <div className={`container ${styles.distinctionInner}`}>
            <p className={`mono ${styles.distinctionLabel}`}>The working distinction</p>
            <p className={styles.distinctionStatement}>
              One workflow keeps standing context around an effort. The other
              begins with the project workspace. We’ll show where each fits and
              how both can support ordinary knowledge work.
            </p>
          </div>
        </section>

        <section
          className={`container ${styles.forYou}`}
          aria-labelledby="for-you-title"
        >
          <div className={styles.sectionIntro}>
            <p className="mono">Who it’s for</p>
            <h2 id="for-you-title">Come if your work has context.</h2>
          </div>

          <div className={styles.forYouGrid}>
            <p>
              You have a research, administrative, creative, or operational
              project that cannot be reduced to one prompt.
            </p>
            <p>
              You are tired of re-explaining the same background every time you
              open an AI tool.
            </p>
            <p>
              You are curious about using AI for work that does not look like
              coding.
            </p>
          </div>

          {!isRecorded && (
            <div className={styles.bottomCta}>
              <div>
                <p className="mono">Friday, July 31 · Noon ET</p>
                <h2>Bring one project you keep having to explain.</h2>
              </div>
              <div className={styles.bottomActions}>
                <a
                  className="btn primary lg"
                  href={content.session.teamsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join the session <span className="arrow">→</span>
                </a>
                <Link className="btn ghost lg" href="/fridays">
                  See all Fridays
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
