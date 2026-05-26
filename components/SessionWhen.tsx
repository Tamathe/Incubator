"use client";

import { useEffect, useState } from "react";
import { nextSession, fmtSessionWhen, fmtCadenceLine } from "@/lib/session";

interface SessionWhenProps {
  variant?: "when" | "cadence-line";
}

/**
 * Renders the next-session label client-side. The "next Friday" computation
 * depends on `Date.now()`, so SSR would bake in a stale value.
 */
export default function SessionWhen({ variant = "when" }: SessionWhenProps) {
  const [label, setLabel] = useState<string>("—");

  useEffect(() => {
    const d = nextSession();
    setLabel(variant === "cadence-line" ? fmtCadenceLine(d) : fmtSessionWhen(d));
  }, [variant]);

  return <>{label}</>;
}
