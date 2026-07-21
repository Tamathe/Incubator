import Link from "next/link";
import Logo from "./Logo";
import MobileNav from "./MobileNav";

type NavKey = "overview" | "fridays" | "projects";

interface NavProps {
  active?: NavKey;
  tone?: "default" | "overlay";
}

export default function Nav({ active, tone = "default" }: NavProps) {
  const cls = (key: NavKey) => (active === key ? "active" : undefined);
  const workClass = active === "overview" || active === "projects" ? "active" : undefined;

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
          <Link href="/#work" className={workClass}>Work</Link>
          <Link href="/fridays" className={cls("fridays")}>Fridays</Link>
          <Link
            href="/fridays#join"
            className="btn primary sm"
          >
            Join the Incubator <span className="arrow">-&gt;</span>
          </Link>
        </div>

        <MobileNav active={active} />
      </div>
    </nav>
  );
}
