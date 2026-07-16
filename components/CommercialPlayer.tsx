"use client";

import type { MouseEvent } from "react";
import { useRef } from "react";

export default function CommercialPlayer() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousOverflowRef = useRef("");

  async function openCommercial() {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) return;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;

    try {
      await video.play();
    } catch {
      // Native controls remain available if a browser blocks programmatic play.
    }
  }

  function closeCommercial() {
    dialogRef.current?.close();
  }

  function handleClosed() {
    const video = videoRef.current;
    video?.pause();
    if (video) video.currentTime = 0;
    document.body.style.overflow = previousOverflowRef.current;
    triggerRef.current?.focus();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeCommercial();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="studio-commercial-link"
        onClick={openCommercial}
        aria-label="Watch the AI Incubator video with sound"
      >
        <span>Watch the video with sound</span>
      </button>

      <dialog
        ref={dialogRef}
        className="studio-commercial-dialog"
        aria-labelledby="commercial-title"
        onClose={handleClosed}
      >
        <h2 id="commercial-title" className="studio-visually-hidden">
          AI Incubator film
        </h2>
        <button
          type="button"
          className="studio-commercial-close"
          onClick={closeCommercial}
          aria-label="Close the film"
          title="Close"
        >
          <span aria-hidden="true">X</span>
        </button>
        <div className="studio-commercial-player" onClick={handleBackdropClick}>
          <video
            ref={videoRef}
            controls
            playsInline
            preload="none"
            poster="/media/incubator-commercial-poster.jpg"
          >
            <source src="/media/incubator-commercial.mp4" type="video/mp4" />
          </video>
        </div>
      </dialog>
    </>
  );
}
