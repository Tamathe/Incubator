import Link from "next/link";
import type { ReactNode } from "react";
import StoryVideo from "./StoryVideo";

type StoryLink = {
  href: string;
  label: string;
  external?: boolean;
};

type StoryChapterProps = {
  id: string;
  side: "left" | "right";
  tone?: "ink" | "blue" | "final";
  variant?: "anchor" | "standard" | "proof";
  eyebrow: string;
  title: string;
  body: string;
  video: string;
  poster: string;
  caption: string;
  focus?: string;
  primaryLink?: StoryLink;
  secondaryLink?: StoryLink;
  children?: ReactNode;
};

function ChapterLink({
  link,
  className,
}: {
  link: StoryLink;
  className: string;
}) {
  const contents = (
    <>
      {link.label} <span aria-hidden="true">-&gt;</span>
    </>
  );

  if (link.external) {
    return (
      <a
        className={className}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {contents}
      </a>
    );
  }

  return (
    <Link className={className} href={link.href}>
      {contents}
    </Link>
  );
}

export default function StoryChapter({
  id,
  side,
  tone = "ink",
  variant = "standard",
  eyebrow,
  title,
  body,
  video,
  poster,
  caption,
  focus,
  primaryLink,
  secondaryLink,
  children,
}: StoryChapterProps) {
  const titleId = `${id}-title`;

  return (
    <article
      className="studio-story"
      id={id}
      data-tone={tone}
      data-variant={variant}
      aria-labelledby={titleId}
    >
      <div className="studio-shell studio-story-chapter" data-side={side}>
        <StoryVideo
          id={id}
          video={video}
          poster={poster}
          caption={caption}
          focus={focus}
        />

        <div className="studio-story-copy">
          <p className="studio-section-index">{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
          <p className="studio-story-body">{body}</p>

          {primaryLink || secondaryLink ? (
            <div className="studio-story-actions">
              {primaryLink ? (
                <ChapterLink
                  link={primaryLink}
                  className="studio-button studio-button-primary"
                />
              ) : null}
              {secondaryLink ? (
                <ChapterLink link={secondaryLink} className="studio-text-link" />
              ) : null}
            </div>
          ) : null}

          {children ? <div className="studio-story-extra">{children}</div> : null}
        </div>
      </div>
    </article>
  );
}
