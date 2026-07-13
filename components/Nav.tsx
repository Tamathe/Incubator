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
  const moreActive = ["outcomes", "built", "open-problems"].includes(active ?? "");

  return (
    <nav className={`nav ${tone === "overlay" ? "nav-overlay" : ""}`}>
      <div className="nav-inner">
        <Link
          className="nav-brand"
          href="/"
          aria-label="AI Incubator at the University of Kentucky home"
        >
          <Logo
            alt=""
            className="nav-logo"
            src="/logo.png"
          />
          <span className="tag">University of Kentucky</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className={cls("overview")}>
            Home
          </Link>
          <Link href="/#fridays">Fridays</Link>
          <Link href="/projects" className={cls("projects")}>
            Projects
          </Link>
          <Link href="/ideas" className={cls("ideas")}>
            Ideas
          </Link>
          <details className={`nav-more ${moreActive ? "active" : ""}`}>
            <summary>More</summary>
            <div className="nav-popover">
              <Link href="/outcomes" className={cls("outcomes")}>What we&apos;ve made</Link>
              <Link href="/built" className={cls("built")}>Working prototypes</Link>
              <Link href="/open-problems" className={cls("open-problems")}>Open problems</Link>
              <Link href="/pitch">Pitch an idea</Link>
            </div>
          </details>
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
            <Link href="/" className={cls("overview")}>Home</Link>
            <Link href="/#fridays">Fridays</Link>
            <Link href="/projects" className={cls("projects")}>Projects</Link>
            <Link href="/ideas" className={cls("ideas")}>Ideas</Link>
            <Link href="/outcomes" className={cls("outcomes")}>What we&apos;ve made</Link>
            <Link href="/built" className={cls("built")}>Working prototypes</Link>
            <Link href="/open-problems" className={cls("open-problems")}>Open problems</Link>
            <Link href="/pitch">Pitch an idea</Link>
            <Link href="/join" className="nav-mobile-cta">Join Friday <span aria-hidden="true">→</span></Link>
          </div>
        </details>
      </div>
    </nav>
  );
}
