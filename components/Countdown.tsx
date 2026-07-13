"use client";

import { useEffect, useState } from "react";
import { nextSession } from "@/lib/session";

const pad = (n: number) => String(n).padStart(2, "0");

interface CountdownProps {
  variant?: "short" | "compact";
}

/**
 * Live countdown to the next session. Ticks every 1s.
 * Renders a placeholder pre-mount to avoid hydration mismatch — the
 * "next Friday" depends on the current time, which only exists client-side.
 */
export default function Countdown({ variant = "short" }: CountdownProps) {
  const [parts, setParts] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);

  useEffect(() => {
    const tick = () => {
      const target = nextSession();
      const diff = Math.max(0, target.getTime() - Date.now());
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (variant === "compact") {
    // mono span variant used inside Right Now bar meta row
    if (!parts) return <span className="mono">—</span>;
    return (
      <span className="mono">
        {parts.d}d {pad(parts.h)}h {pad(parts.m)}m
      </span>
    );
  }

  // "short" variant: pill with mixed labels
  if (!parts) {
    return (
      <span className="units">
        <span className="unit-num">—</span>
      </span>
    );
  }
  return (
    <span className="units">
      <span className="unit-num">{parts.d}</span>
      <span className="unit-lbl">d</span>{" "}
      <span className="unit-num">{pad(parts.h)}</span>
      <span className="unit-lbl">h</span>{" "}
      <span className="unit-num">{pad(parts.m)}</span>
      <span className="unit-lbl">m</span>{" "}
      <span className="unit-num">{pad(parts.s)}</span>
      <span className="unit-lbl">s</span>
    </span>
  );
}
