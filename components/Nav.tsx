import Link from "next/link";
import Logo from "./Logo";
import MobileNav from "./MobileNav";

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
          <Link href="/#fridays">Fridays</Link>
          <Link href="/projects" className={cls("projects")}>Projects</Link>
          <Link className="nav-student-work" href="/#student-work">
            <span>Student work</span>
            <small>(page in development)</small>
          </Link>
          <Link
            href="/join"
            className={`btn primary sm ${active === "join" ? "active" : ""}`}
          >
            Join us <span className="arrow">-&gt;</span>
          </Link>
        </div>

        <MobileNav projectsActive={active === "projects"} />
      </div>
    </nav>
  );
}
