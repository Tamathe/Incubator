import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link
              className="nav-brand"
              href="/"
              style={{ marginBottom: 14 }}
              aria-label="AI Incubator at the University of Kentucky home"
            >
              <Logo alt="" className="footer-logo" src="/logo-mark-dark.png" />
            </Link>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/#work">Featured work</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/fridays">Fridays</Link></li>
              <li><Link href="/fridays#join">Join the Incubator</Link></li>
              <li><Link href="/fridays#propose">Propose something</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            &copy; {new Date().getFullYear()} AI Incubator, University of Kentucky
          </span>
        </div>
      </div>
    </footer>
  );
}
