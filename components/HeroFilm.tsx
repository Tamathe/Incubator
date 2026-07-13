"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function respectMotionPreference() {
      if (media.matches) {
        videoRef.current?.pause();
        setPaused(true);
      }
    }

    respectMotionPreference();
    media.addEventListener("change", respectMotionPreference);
    return () => media.removeEventListener("change", respectMotionPreference);
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPaused(true);
      }
      return;
    }

    video.pause();
  }

  return (
    <div className="studio-hero-film">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/incubator-hero-poster.jpg"
        aria-hidden="true"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      >
        <source src="/media/incubator-hero.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        className="studio-film-toggle"
        onClick={togglePlayback}
        aria-label={paused ? "Play background video" : "Pause background video"}
        title={paused ? "Play video" : "Pause video"}
      >
        <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
      </button>
    </div>
  );
}
