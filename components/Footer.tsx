import Link from "next/link";
import { content } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import SubscribeForm from "./SubscribeForm";
import Logo from "./Logo";

const GH_HISTORY_URL =
  "https://github.com/uky-ai-incubator/site/commits/master/content/site.ts";

export default function Footer() {
  const lastUpdated = fmtIsoDate(content.lastUpdated, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link
              className="nav-brand"
              href="/"
              style={{ marginBottom: 14 }}
              aria-label="AI Incubator @ University of Kentucky — home"
            >
              <Logo alt="" className="nav-logo" />
            </Link>
            <p
              className="body"
              style={{ maxWidth: "36ch", fontSize: 14, marginTop: 10 }}
            >
              A weekly project studio for the University of Kentucky. AI projects
              across campus.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/#team">Ways in</Link></li>
              <li><Link href="/ideas">Ideas map</Link></li>
              <li><Link href="/changelog">Changelog</Link></li>
              <li><Link href="/join">Get involved</Link></li>
            </ul>
          </div>
          <div>
            <h4>Connect</h4>
            <ul>
              <li><a href="mailto:incubator@uky.edu">incubator@uky.edu</a></li>
              <li><a href="/join">Weekly listserv →</a></li>
              <li><a href="https://github.com/uky-ai-incubator" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4>Listserv</h4>
            <p className="small" style={{ marginBottom: 10 }}>
              Weekly updates from the group.
            </p>
            <SubscribeForm />
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} · AI Incubator @ University of Kentucky</span>
          <span className="mono">
            v1 · last updated{" "}
            <a href={GH_HISTORY_URL} target="_blank" rel="noopener noreferrer">
              {lastUpdated}
            </a>
          </span>
        </div>
        <div className="foot-curator">
          Last curated by the group lead · {lastUpdated}
        </div>
      </div>
    </footer>
  );
}
