"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CommercialPlayer from "./CommercialPlayer";

const CHAPTERS = [
  {
    number: "01",
    title: "Gather",
    body: "Students, faculty, and staff arrive from across campus.",
    video: "/media/studio-reel/01-gather.mp4",
    poster: "/media/studio-reel/01-gather.jpg",
    focus: "52% center",
  },
  {
    number: "02",
    title: "Collaborate",
    body: "People from different fields discuss the same question.",
    video: "/media/studio-reel/02-collaborate.mp4",
    poster: "/media/studio-reel/02-collaborate.jpg",
    focus: "50% center",
  },
  {
    number: "03",
    title: "Build",
    body: "Chaelyn McGuire builds a philanthropy website for her sorority.",
    video: "/media/studio-reel/03-chaelyn.mp4",
    poster: "/media/studio-reel/03-chaelyn.jpg",
    focus: "50% center",
  },
  {
    number: "04",
    title: "Test",
    body: "The group tests an idea and examines what works.",
    video: "/media/studio-reel/04-test.mp4",
    poster: "/media/studio-reel/04-test.jpg",
    focus: "42% center",
  },
  {
    number: "05",
    title: "Teach",
    body: "Hunter Colson demonstrates the student-built Socratic Tutor.",
    video: "/media/studio-reel/05-hunter.mp4",
    poster: "/media/studio-reel/05-hunter.jpg",
    focus: "50% center",
  },
] as const;

const MOSAIC_SLOTS = ["focus", "upper", "top", "lower", "bottom"] as const;

export default function StudioReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreferences = () => {
      setPrefersReducedMotion(motionQuery.matches);
      if (motionQuery.matches) setMotionPaused(true);
    };

    syncPreferences();
    motionQuery.addEventListener("change", syncPreferences);
    return () => motionQuery.removeEventListener("change", syncPreferences);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || motionPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % CHAPTERS.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [activeIndex, isVisible, motionPaused, prefersReducedMotion]);

  const getSlot = (index: number) => {
    const offset = (index - activeIndex + CHAPTERS.length) % CHAPTERS.length;
    return MOSAIC_SLOTS[offset];
  };

  return (
    <section
      ref={sectionRef}
      className="studio-reel"
      id="studio"
      aria-labelledby="studio-reel-title"
    >
      <div className="studio-reel-sticky">
        <div className="studio-shell studio-reel-head">
          <div>
            <p className="studio-section-index">Inside the room</p>
            <h2 id="studio-reel-title">What happens on Fridays.</h2>
          </div>

          <div className="studio-reel-status">
            <p aria-live="polite">
              <strong>{CHAPTERS[activeIndex].number}</strong>
              <span>/ {String(CHAPTERS.length).padStart(2, "0")}</span>
            </p>
            <button
              type="button"
              className={`studio-reel-motion-toggle ${motionPaused ? "is-paused" : ""}`}
              onClick={() => setMotionPaused((paused) => !paused)}
              aria-label={motionPaused ? "Play video motion" : "Pause video motion"}
              title={motionPaused ? "Play motion" : "Pause motion"}
              disabled={prefersReducedMotion}
            >
              <span aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="studio-mosaic-viewport">
          <div className="studio-mosaic-stage">
            {CHAPTERS.map((chapter, index) => {
              const isActive = index === activeIndex;
              const shouldPlay =
                isActive && isVisible && !motionPaused && !prefersReducedMotion;

              return (
                <button
                  key={chapter.number}
                  type="button"
                  className={`studio-mosaic-tile ${isActive ? "is-active" : ""}`}
                  data-slot={getSlot(index)}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${chapter.title}. ${chapter.body}`}
                  aria-pressed={isActive}
                >
                  {shouldPlay ? (
                    <video
                      key={chapter.video}
                      src={chapter.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster={chapter.poster}
                      aria-hidden="true"
                      style={{ objectPosition: chapter.focus }}
                    />
                  ) : (
                    <Image
                      src={chapter.poster}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 100vw, 70vw"
                      aria-hidden="true"
                      style={{ objectPosition: chapter.focus }}
                    />
                  )}
                  <span className="studio-mosaic-shade" aria-hidden="true" />
                  <span className="studio-mosaic-caption" aria-hidden="true">
                    <span className="studio-mosaic-number">{chapter.number}</span>
                    <span className="studio-mosaic-copy">
                      <strong>{chapter.title}</strong>
                      <span>{chapter.body}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="studio-shell studio-reel-footer">
          <div className="studio-reel-progress" aria-hidden="true">
            <span
              style={{ width: `${((activeIndex + 1) / CHAPTERS.length) * 100}%` }}
            />
          </div>
          <CommercialPlayer />
        </div>
      </div>
    </section>
  );
}
