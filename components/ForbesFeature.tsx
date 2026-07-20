const FORBES_ARTICLE_URL =
  "https://www.forbes.com/sites/rayravaglia/2026/07/19/you-cant-outsource-understandinghow-two-universities-are-teaching-ai/";

export default function ForbesFeature() {
  return (
    <section
      className="studio-forbes-feature"
      aria-labelledby="forbes-feature-title"
    >
      <div className="studio-shell studio-forbes-feature-inner">
        <div className="studio-forbes-feature-source">
          <span>Featured in</span>
          <strong>Forbes</strong>
          <time dateTime="2026-07-19">July 19, 2026</time>
        </div>

        <div className="studio-forbes-feature-copy">
          <h2 id="forbes-feature-title">
            You Can’t Outsource Understanding
          </h2>
          <p>
            Forbes profiles Hunter Colson’s Socratic Tutor and the AI
            Incubator’s approach to learning AI: start with a real problem,
            build something useful, and keep judgment with the person doing the
            work.
          </p>
        </div>

        <a
          className="studio-button studio-button-dark studio-forbes-feature-link"
          href={FORBES_ARTICLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Read the Forbes feature (opens in a new tab)"
        >
          Read the Forbes feature <span aria-hidden="true">-&gt;</span>
        </a>
      </div>
    </section>
  );
}
