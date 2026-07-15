"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CLIPS = [
  {
    video: "/media/story/02-student-demo.mp4",
    poster: "/media/story/02-student-demo.jpg",
  },
  {
    video: "/media/story/05-audience.mp4",
    poster: "/media/story/05-audience.jpg",
  },
  {
    video: "/media/story/06-event-crowd.mp4",
    poster: "/media/story/06-event-crowd.jpg",
  },
] as const;

export default function StudioClipStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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
        {CLIPS.map((clip, index) => {
          const isActive = index === activeIndex;
          const showVideo =
            isActive && isNear && !isPaused && !prefersReducedMotion;

          return (
            <figure key={clip.video} data-active={isActive}>
              {showVideo ? (
                <video
                  key={clip.video}
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  poster={clip.poster}
                  aria-hidden="true"
                  onEnded={() =>
                    setActiveIndex((current) => (current + 1) % CLIPS.length)
                  }
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
            isPaused ? "Play Friday meeting clips" : "Pause Friday meeting clips"
          }
        >
          {isPaused ? "Play clips" : "Pause clips"}
        </button>
      ) : null}
    </section>
  );
}
