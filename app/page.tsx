import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import CTABanner from "@/components/CTABanner";
import Logo from "@/components/Logo";

const CAMPUS_AREAS = [
  "Arts & Sciences",
  "Engineering",
  "Education",
  "Business",
  "Agriculture",
  "Libraries",
  "Operations",
];

const FEATURED_PROJECT_IDS = ["socratic-tutor", "ahead", "ncipp"];

const JOIN_PATHS = [
  {
    label: "I am a student",
    title: "Find a build you can learn from.",
    body:
      "Join an active project, turn coursework into a portfolio piece, or bring a question from class into the studio.",
    href: "/join",
    action: "Start here",
  },
  {
    label: "I am faculty",
    title: "Turn domain insight into a scoped project.",
    body:
      "Bring a research, teaching, or operations problem. We will help shape the first prototype, evaluation plan, and team.",
    href: "/pitch",
    action: "Pitch an idea",
  },
  {
    label: "I have a campus problem",
    title: "Get the right people in the room.",
    body:
      "Use the Incubator to pressure-test workflow problems, student-facing ideas, and cross-unit opportunities.",
    href: "/pitch",
    action: "Bring the problem",
  },
  {
    label: "I can build",
    title: "Plug into projects that need hands.",
    body:
      "Software, data, design, evaluation, writing, and project management all matter. Builders are welcome.",
    href: "/projects",
    action: "See projects",
  },
];

function getFeaturedProjects() {
  return FEATURED_PROJECT_IDS.map((id) =>
    content.projects.find((project) => project.id === id)
  ).filter(Boolean) as (typeof content.projects)[number][];
}

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <Nav active="overview" />

      <header className="hero container">
        <DotGrid />
        <div className="hero-grid">
          <div className="hero-copy">
            <Logo
              alt="AI Incubator @ University of Kentucky"
              className="hero-logo"
              width={1200}
              height={542}
            />

            <div className="hero-meta">
              <span className="chip live">Friday project studio</span>
              <span className="chip">Open to the entire campus</span>
            </div>

            <h1 className="h-display">
              Build real AI in <br />
              <em>every corner of UK</em>.
            </h1>

            <p className="lead" style={{ marginTop: 28 }}>
              A weekly project studio where students, faculty, staff,
              researchers, and builders turn AI ideas into prototypes, studies,
              presentations, grants, and publications.
            </p>

            <div className="hero-cta">
              <a href="/join" className="btn primary lg">
                Join the Friday studio <span className="arrow">→</span>
              </a>
              <a href="/projects" className="btn lg">
                Explore current projects
              </a>
            </div>
          </div>

          <aside
            className="hero-proof"
            aria-label="AI Incubator project studio snapshot"
          >
            <div className="proof-window">
              <div className="proof-window-head">
                <span className="proof-light" />
                <span>Live project studio</span>
              </div>
              <div className="proof-flow">
                <div>
                  <span>01</span>
                  <strong>Bring a real problem</strong>
                  <small>Classroom, lab, operations, research, community.</small>
                </div>
                <div>
                  <span>02</span>
                  <strong>Scope the first build</strong>
                  <small>Prototype, dataset, protocol, or evaluation plan.</small>
                </div>
                <div>
                  <span>03</span>
                  <strong>Leave with collaborators</strong>
                  <small>Students, faculty, staff, and technical builders.</small>
                </div>
              </div>
              <div className="proof-output">
                <span>Outputs in motion</span>
                <p>
                  Prototypes, protocols, presentations, grants, and publishable
                  studies.
                </p>
              </div>
            </div>

            <div className="quote-card">
              <p>
                “I came with a half-formed idea and left with a team, a next
                step, and a reason to keep building.”
              </p>
              <span>Incubator participant</span>
            </div>
          </aside>
        </div>
      </header>

      <section className="campus-strip container" aria-label="Campus reach">
        <div>
          <span className="eyebrow">Campus reach</span>
          <h2>Built for every college, center, and team with a real problem.</h2>
        </div>
        <div className="campus-pills">
          {CAMPUS_AREAS.map((area) => (
            <span className="campus-pill" key={area}>
              {area}
            </span>
          ))}
        </div>
      </section>

      <section className="section container" id="projects">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="idx">01</span> <span>Featured builds</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "18ch" }}>
              Proof that the room makes things happen.
            </h2>
          </div>
          <a href="/projects" className="btn ghost">
            See the full project board <span className="arrow">→</span>
          </a>
        </div>

        <div className="featured-builds">
          {featured.map((project) => (
            <article className="featured-build" key={project.id}>
              <div className="featured-build-top">
                <span className="chip">{project.area}</span>
                <span className="featured-stage mono">{project.stage}</span>
              </div>
              <h3>{project.name}</h3>
              {project.tagline && <p className="tagline">{project.tagline}</p>}
              <p>{project.summary}</p>
              <div className="featured-evidence">
                {(project.anchors ?? []).slice(0, 2).map((anchor) => (
                  <span key={anchor}>{anchor}</span>
                ))}
              </div>
            </article>
          ))}

          <article className="featured-build featured-build-open">
            <div className="featured-build-top">
              <span className="chip live">Open call</span>
              <span className="featured-stage mono">Bring next</span>
            </div>
            <h3>Your campus problem</h3>
            <p className="tagline">The next featured build can start Friday.</p>
            <p>
              If AI could reduce friction in a course, lab, office,
              service line, or community program, bring the problem. We will
              help find the smallest useful first build.
            </p>
            <a href="/pitch" className="btn primary sm">
              Start a pitch <span className="arrow">→</span>
            </a>
          </article>
        </div>
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">02</span> <span>How it works</span>
        </div>
        <h2
          className="h1"
          style={{
            maxWidth: "22ch",
            marginBottom: "calc(48px * var(--d))",
          }}
        >
          Bring an idea. Leave with momentum.
        </h2>
        <div className="steps">
          <div className="step">
            <div className="num">Step 01</div>
            <h3 className="h3">Show up Friday</h3>
            <p>
              Fridays at noon in Microsoft Teams. Bring curiosity, a half-formed
              idea, or a project that needs more hands.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 02</div>
            <h3 className="h3">Shape the first build</h3>
            <p>
              The group helps turn broad AI energy into a crisp next step:
              prototype, literature review, evaluation path, data plan, or demo.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 03</div>
            <h3 className="h3">Build toward proof</h3>
            <p>
              Teams bring progress back to the room. The bar is practical:
              something working, something learned, something ready to share.
            </p>
          </div>
        </div>
      </section>

      <section className="section container" id="team">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="idx">03</span> <span>Ways in</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "18ch" }}>
              Pick the door that fits you.
            </h2>
          </div>
          <a href="/join" className="btn ghost">
            Get involved <span className="arrow">→</span>
          </a>
        </div>

        <div className="join-routes">
          {JOIN_PATHS.map((path) => (
            <a className="join-route" href={path.href} key={path.label}>
              <span className="join-route-label mono">{path.label}</span>
              <strong>{path.title}</strong>
              <p>{path.body}</p>
              <span className="join-route-action">
                {path.action} <span className="arrow">→</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <CTABanner />

      <Footer />
    </>
  );
}
