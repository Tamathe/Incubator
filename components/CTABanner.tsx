import { content } from "@/content/site";
import DotGrid from "./DotGrid";
import SessionWhen from "./SessionWhen";

export default function CTABanner() {
  const { session } = content;
  return (
    <section
      className="container"
      style={{ paddingBottom: "calc(80px * var(--d))" }}
    >
      <div className="cta-banner">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">Friday at noon</span>
          <h2 style={{ marginTop: 14 }}>
            Join the next
            <br />
            <span className="accent">meeting.</span>
          </h2>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            alignItems: "flex-start",
          }}
        >
          <div className="meta">
            <span>
              <SessionWhen variant="cadence-line" />
            </span>
            <span>Link in the weekly listserv</span>
            <span>incubator@uky.edu</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={session.teamsUrl} className="btn primary lg">
              Join this Friday <span className="arrow">→</span>
            </a>
            <a href="#" className="btn lg btn-cta-secondary">
              Add to calendar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
