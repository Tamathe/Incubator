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
            “You Can’t Outsource Understanding”
          </h2>
          <blockquote cite={FORBES_ARTICLE_URL}>
            <p>
              “The university’s AI incubator … brings together people from
              medicine, engineering, law, agriculture, physical therapy and
              other fields to build projects that no one discipline could
              develop as effectively on its own.
            </p>
            <p>
              That work is closely tied to Kentucky’s public mission. In rural
              communities hours from medical specialists, or cut off by
              flooding, remote clinical support and drone delivery are not
              demonstrations built for prestige but responses to conditions
              people already face. For a public university whose graduates
              often remain in Kentucky, this is as much workforce development
              as experimentation.”
            </p>
            <footer>Forbes · July 2026</footer>
          </blockquote>
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
