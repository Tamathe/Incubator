"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function JoinHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    function respectMotionPreference() {
      if (motionPreference.matches) {
        videoRef.current?.pause();
        setPaused(true);
      }
    }

    respectMotionPreference();
    motionPreference.addEventListener("change", respectMotionPreference);

    return () =>
      motionPreference.removeEventListener("change", respectMotionPreference);
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await video.play();
    } catch {
      setPaused(true);
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/join/chaelyn-interview-poster.jpg"
        aria-hidden="true"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      >
        <source src="/media/join/chaelyn-interview.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        className={styles.videoToggle}
        onClick={togglePlayback}
        aria-label={
          paused
            ? "Play Chaelyn interview video"
            : "Pause Chaelyn interview video"
        }
        title={paused ? "Play video" : "Pause video"}
      >
        <span aria-hidden="true">{paused ? "\u25b6" : "\u2161"}</span>
      </button>
    </>
  );
}
