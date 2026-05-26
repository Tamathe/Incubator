import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import RightNowBar from "@/components/RightNowBar";
import ProjectCard from "@/components/ProjectCard";
import KickoffCard from "@/components/KickoffCard";
import PersonCard from "@/components/PersonCard";
import LogList from "@/components/LogList";
import OnTheTableSection from "@/components/OnTheTableSection";
import PitchSection from "@/components/PitchSection";
import CTABanner from "@/components/CTABanner";
import PartnersStrip from "@/components/PartnersStrip";
import Logo from "@/components/Logo";
import { fmtIsoDate } from "@/lib/session";

export default function HomePage() {
  const rich = content.projects.filter((p) => p.status !== "kickoff");
  const kick = content.projects.filter((p) => p.status === "kickoff");
  const lastUpdated = fmtIsoDate(content.lastUpdated, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Nav active="overview" />

      {/* ───── Hero ───── */}
      <header className="hero container">
        <DotGrid />
        <div className="hero-grid">
          <div>
            <Logo
              alt="AI Incubator @ University of Kentucky"
              className="hero-logo"
              width={1200}
              height={542}
            />

            <h1 className="h-display">
              A working group at the
              <br />
              <em>University of Kentucky</em>.
            </h1>

            <p className="lead" style={{ marginTop: 28 }}>
              Students, clinicians, and faculty building AI projects in
              healthcare and education. We meet every{" "}
              <strong>Friday at noon in Microsoft Teams</strong>.
            </p>

            <div className="hero-cta">
              <a href="#rightnow" className="btn primary lg">
                Join Friday&apos;s meeting <span className="arrow">→</span>
              </a>
              <a href="#projects" className="btn lg">
                See current projects
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Right Now strip ───── */}
      <RightNowBar />

      {/* ───── Active projects ───── */}
      <section className="section container" id="projects">
        <div className="section-head">
          <h2 className="h1" style={{ maxWidth: "18ch" }}>
            Current projects.
          </h2>
          <a href="/projects" className="btn ghost">
            View all projects <span className="arrow">→</span>
          </a>
        </div>
        <div className="proj-grid">
          {rich.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        <div className="divider-text">
          <span>Recently started · looking for collaborators</span>
        </div>
        <div className="proj-grid kickoff-grid">
          {kick.map((p) => (
            <KickoffCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section className="section container">
        <h2
          className="h1"
          style={{
            maxWidth: "22ch",
            marginBottom: "calc(48px * var(--d))",
          }}
        >
          How to get involved.
        </h2>
        <div className="steps">
          <div className="step">
            <div className="num">Step 01</div>
            <h3 className="h3">Attend a meeting</h3>
            <p>
              Fridays at noon in Microsoft Teams. Anyone can attend. Usually
              around thirty people — students, clinicians, faculty, staff.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 02</div>
            <h3 className="h3">Pitch an idea</h3>
            <p>
              Bring a problem from clinic, research, or class. Around sixty
              seconds to describe it. The group helps scope it and pairs you with
              collaborators.
            </p>
          </div>
          <div className="step">
            <div className="num">Step 03</div>
            <h3 className="h3">Work on the project</h3>
            <p>
              Teams meet between Fridays and bring progress back to the group.
              Output ranges from prototypes to IRB-approved studies to published
              papers.
            </p>
          </div>
        </div>
      </section>

      {/* ───── Faculty leads ───── */}
      <section className="section container" id="team">
        <div className="section-head">
          <h2 className="h1" style={{ maxWidth: "16ch" }}>
            Faculty and collaborators.
          </h2>
          <span className="small">
            Plus students and staff across UKCOM, Engineering, and Markey.
          </span>
        </div>
        <div className="people">
          {content.leads.map((p) => (
            <PersonCard key={p.initials} person={p} />
          ))}
        </div>
      </section>

      {/* ───── Activity log ───── */}
      <section className="section container" id="log">
        <div className="section-head">
          <h2 className="h1" style={{ maxWidth: "22ch" }}>
            Recent updates.
          </h2>
          <span className="small">Newest first. Updated {lastUpdated}.</span>
        </div>
        <LogList />
      </section>

      {/* ───── What's on the table ───── */}
      <OnTheTableSection />

      {/* ───── Pitch a project ───── */}
      <PitchSection />

      {/* ───── CTA banner ───── */}
      <CTABanner />

      {/* ───── Partners ───── */}
      <PartnersStrip />

      <Footer />
    </>
  );
}
