import Link from "next/link";
import Logo from "./Logo";
import SubscribeForm from "./SubscribeForm";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link
              className="nav-brand"
              href="/"
              style={{ marginBottom: 14 }}
              aria-label="AI Incubator at the University of Kentucky home"
            >
              <Logo alt="" className="nav-logo" src="/logo-incubator.png" />
            </Link>
            <p
              className="body"
              style={{ maxWidth: "36ch", fontSize: 14, marginTop: 10 }}
            >
              Fridays at noon on Microsoft Teams. Open to students, faculty,
              and staff across UK.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/#fridays">Fridays</Link></li>
              <li><Link href="/#student-work">Student projects</Link></li>
              <li><Link href="/join">Ways to join</Link></li>
            </ul>
          </div>
          <div>
            <h4>Connect</h4>
            <ul>
              <li><a href="mailto:incubator@uky.edu">incubator@uky.edu</a></li>
              <li>
                <a
                  href="https://tamathe.com/incubator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About Tama Thé, founder -&gt;
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/uky-ai-incubator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Friday updates</h4>
            <SubscribeForm />
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            (c) {new Date().getFullYear()} - AI Incubator @ University of
            Kentucky
          </span>
        </div>
      </div>
    </footer>
  );
}
