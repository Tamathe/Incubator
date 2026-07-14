import Link from "next/link";
import Logo from "./Logo";

type NavKey =
  | "overview"
  | "projects"
  | "ideas"
  | "team"
  | "open-problems"
  | "outcomes"
  | "built"
  | "join";

interface NavProps {
  active?: NavKey;
  tone?: "default" | "overlay";
}

export default function Nav({ active, tone = "default" }: NavProps) {
  const cls = (key: NavKey) => (active === key ? "active" : undefined);

  return (
    <nav className={`nav ${tone === "overlay" ? "nav-overlay" : ""}`}>
      <div className="nav-inner">
        <Link
          className="nav-brand"
          href="/"
          aria-label="AI Incubator at the University of Kentucky home"
        >
          <Logo alt="" className="nav-logo" src="/logo.png" />
          <span className="tag">University of Kentucky</span>
        </Link>

        <div className="nav-links">
          <Link href="/projects" className={cls("projects")}>Work</Link>
          <Link href="/#studio">Inside Friday</Link>
          <Link href="/#student-work">Student work</Link>
          <Link href="/#fridays">Fridays</Link>
          <Link
            href="/join"
            className={`btn primary sm ${active === "join" ? "active" : ""}`}
          >
            Join Friday <span className="arrow">-&gt;</span>
          </Link>
        </div>

        <details className="nav-mobile">
          <summary aria-label="Open site navigation">Menu</summary>
          <div className="nav-mobile-panel">
            <Link href="/projects" className={cls("projects")}>Work</Link>
            <Link href="/#studio">Inside Friday</Link>
            <Link href="/#student-work">Student work</Link>
            <Link href="/#fridays">Fridays</Link>
            <Link href="/join" className="nav-mobile-cta">
              Join Friday <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </details>
      </div>
    </nav>
  );
}
