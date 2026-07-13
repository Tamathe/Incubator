"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function StudioReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const manualMode = prefersReducedMotion;

  const updateActiveIndex = useCallback((nextIndex: number) => {
    if (activeIndexRef.current === nextIndex) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

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
      { threshold: 0.14 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex && isVisible && !motionPaused) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [activeIndex, isVisible, motionPaused]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || manualMode) return;

    let frame = 0;

    const updateFromPageScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const scrollableDistance = Math.max(
          1,
          section.offsetHeight - window.innerHeight,
        );
        const progress = clamp(-rect.top / scrollableDistance, 0, 1);
        updateActiveIndex(Math.round(progress * (CHAPTERS.length - 1)));
      });
    };

    window.addEventListener("scroll", updateFromPageScroll, { passive: true });
    window.addEventListener("resize", updateFromPageScroll);
    updateFromPageScroll();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateFromPageScroll);
      window.removeEventListener("resize", updateFromPageScroll);
    };
  }, [manualMode, updateActiveIndex]);

  const selectChapter = (index: number) => {
    updateActiveIndex(index);

    if (manualMode) return;

    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const scrollableDistance = section.offsetHeight - window.innerHeight;
    const progress = index / (CHAPTERS.length - 1);
    window.scrollTo({
      top: sectionTop + scrollableDistance * progress,
      behavior: "smooth",
    });
  };

  const getSlot = (index: number) => {
    const offset =
      (index - activeIndex + CHAPTERS.length) % CHAPTERS.length;
    return MOSAIC_SLOTS[offset];
  };

  return (
    <section
      ref={sectionRef}
      className={`studio-reel ${manualMode ? "studio-reel-manual" : ""}`}
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
              title={motionPaused ? "Play video motion" : "Pause video motion"}
            >
              <span aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="studio-mosaic-viewport">
          <div className="studio-mosaic-stage">
            {CHAPTERS.map((chapter, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={chapter.number}
                  type="button"
                  className={`studio-mosaic-tile ${isActive ? "is-active" : ""}`}
                  data-slot={getSlot(index)}
                  onClick={() => selectChapter(index)}
                  aria-label={`${chapter.title}. ${chapter.body}`}
                  aria-pressed={isActive}
                >
                  <video
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={chapter.poster}
                    aria-hidden="true"
                    style={{ objectPosition: chapter.focus }}
                  >
                    <source src={chapter.video} type="video/mp4" />
                  </video>
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

        <div className="studio-shell studio-reel-footer" aria-hidden="true">
          <div className="studio-reel-progress">
            <span
              style={{ width: `${((activeIndex + 1) / CHAPTERS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
