import Link from "next/link";
import Logo from "./Logo";

type NavKey = "overview" | "projects" | "ideas" | "team" | "activity" | "open-problems" | "outcomes" | "built" | "join";

interface NavProps {
  active?: NavKey;
}

export default function Nav({ active }: NavProps) {
  const cls = (key: NavKey) => (active === key ? "active" : undefined);
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="nav-brand" href="/" aria-label="AI Incubator @ University of Kentucky — home">
          <Logo alt="" className="nav-logo" />
          <span className="tag">University of Kentucky</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className={cls("overview")}>Overview</Link>
          <Link href="/projects" className={cls("projects")}>Projects</Link>
          <Link href="/ideas" className={cls("ideas")}>Ideas</Link>
          <Link href="/#team" className={cls("team")}>Team</Link>
          <Link href="/#log" className={cls("activity")}>Activity</Link>
          <Link href="/join" className={`btn primary sm ${active === "join" ? "active" : ""}`}>
            Join Friday <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
