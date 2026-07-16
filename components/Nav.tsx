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
          <Logo alt="" className="nav-logo" src="/logo-incubator.png" />
        </Link>

        <div className="nav-links">
          <Link href="/#fridays">What happens</Link>
          <Link href="/projects" className={cls("projects")}>Projects</Link>
          <Link href="/#student-work">Student work</Link>
          <Link
            href="/join"
            className={`btn primary sm ${active === "join" ? "active" : ""}`}
          >
            Come Friday <span className="arrow">-&gt;</span>
          </Link>
        </div>

        <details className="nav-mobile">
          <summary aria-label="Open site navigation">Menu</summary>
          <div className="nav-mobile-panel">
            <Link href="/#fridays">What happens</Link>
            <Link href="/projects" className={cls("projects")}>Projects</Link>
            <Link href="/#student-work">Student work</Link>
            <Link href="/join" className="nav-mobile-cta">
              Come Friday <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </details>
      </div>
    </nav>
  );
}
