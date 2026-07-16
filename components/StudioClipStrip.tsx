"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CLIPS = [
  {
    video: "/media/story/02-student-demo.mp4",
    poster: "/media/story/02-student-demo.jpg",
  },
] as const;

export default function StudioClipStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(motionQuery.matches);

    syncPreference();
    motionQuery.addEventListener("change", syncPreference);
    return () => motionQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNear(entry.isIntersecting),
      { rootMargin: "260px 0px", threshold: 0 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="studio-clip-strip"
      aria-label="Inside a Friday meeting"
    >
      <div className="studio-clip-strip-grid">
        {CLIPS.map((clip) => {
          const showVideo = isNear && !isPaused && !prefersReducedMotion;

          return (
            <figure key={clip.video} data-active="true">
              {showVideo ? (
                <video
                  key={clip.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={clip.poster}
                  aria-hidden="true"
                >
                  <source src={clip.video} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={clip.poster}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 100vw, 34vw"
                />
              )}
            </figure>
          );
        })}
      </div>

      {!prefersReducedMotion ? (
        <button
          type="button"
          className="studio-clip-strip-control"
          onClick={() => setIsPaused((current) => !current)}
          aria-pressed={isPaused}
          aria-label={
            isPaused ? "Play Friday meeting clip" : "Pause Friday meeting clip"
          }
        >
          {isPaused ? "Play clip" : "Pause clip"}
        </button>
      ) : null}
    </section>
  );
}
