"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const PLAY_EVENT = "ai-incubator:story-video-play";

type StoryVideoProps = {
  id: string;
  video: string;
  poster: string;
  label: string;
  focus?: string;
  withSound?: boolean;
};

export default function StoryVideo({
  id,
  video,
  poster,
  label,
  focus = "center",
  withSound = false,
}: StoryVideoProps) {
  const figureRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(motionQuery.matches);

    syncPreference();
    motionQuery.addEventListener("change", syncPreference);

    return () => motionQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;

    const loadObserver = new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;
        setIsNear(true);
        observer.disconnect();
      },
      { rootMargin: "420px 0px", threshold: 0 },
    );

    const activeObserver = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting && entry.intersectionRatio >= 0.45),
      { rootMargin: "-12% 0px -12% 0px", threshold: [0, 0.45, 0.7] },
    );

    loadObserver.observe(figure);
    activeObserver.observe(figure);

    return () => {
      loadObserver.disconnect();
      activeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleAnotherVideo = (event: Event) => {
      const claimedId = (event as CustomEvent<string>).detail;
      if (claimedId === id) return;
      videoRef.current?.pause();
    };

    window.addEventListener(PLAY_EVENT, handleAnotherVideo);
    return () => window.removeEventListener(PLAY_EVENT, handleAnotherVideo);
  }, [id]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    if (!isActive || !isNear || document.hidden || prefersReducedMotion) {
      element.pause();
      return;
    }

    if (userPaused || withSound) return;

    window.dispatchEvent(new CustomEvent<string>(PLAY_EVENT, { detail: id }));
    void element.play().catch(() => setIsPlaying(false));
  }, [id, isActive, isNear, prefersReducedMotion, userPaused, withSound]);

  useEffect(() => {
    const handleVisibility = () => {
      const element = videoRef.current;
      if (!element) return;

      if (document.hidden) {
        element.pause();
        return;
      }

      if (
        isActive &&
        isNear &&
        !prefersReducedMotion &&
        !userPaused &&
        !withSound
      ) {
        window.dispatchEvent(new CustomEvent<string>(PLAY_EVENT, { detail: id }));
        void element.play().catch(() => setIsPlaying(false));
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [id, isActive, isNear, prefersReducedMotion, userPaused, withSound]);

  async function togglePlayback() {
    const element = videoRef.current;
    if (!element) return;

    if (!element.paused) {
      setUserPaused(true);
      element.pause();
      return;
    }

    setUserPaused(false);
    window.dispatchEvent(new CustomEvent<string>(PLAY_EVENT, { detail: id }));

    try {
      await element.play();
    } catch {
      setIsPlaying(false);
    }
  }

  return (
    <figure
      ref={figureRef}
      className={`studio-story-media ${isActive ? "is-active" : ""} ${
        isPlaying ? "is-playing" : ""
      }`}
    >
      {prefersReducedMotion && !withSound ? (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 58vw"
          style={{ objectPosition: focus }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay={isActive && !userPaused && !withSound}
          muted={!withSound}
          loop={!withSound}
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden="true"
          style={{ objectPosition: focus }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          {isNear ? <source src={video} type="video/mp4" /> : null}
        </video>
      )}

      {isNear && (!prefersReducedMotion || withSound) ? (
        <button
          type="button"
          className="studio-story-play"
          onClick={togglePlayback}
          aria-label={`${isPlaying ? "Pause" : "Play"} ${withSound ? "video with sound" : "silent video"}: ${label}`}
        >
          <span aria-hidden="true">{isPlaying ? "II" : ">"}</span>
          <span>
            {isPlaying
              ? "Pause"
              : withSound
                ? "Play with sound"
                : "Play"}
          </span>
        </button>
      ) : null}
    </figure>
  );
}
