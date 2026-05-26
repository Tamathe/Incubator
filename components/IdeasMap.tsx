"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type Idea,
  THEME_LABELS,
  themeToCluster,
  commitmentToVisual,
  parseIdeaRow,
} from "@/lib/ideas";

type LoadState = "loading" | "ready" | "error" | "disabled";

export default function IdeasMap() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 600 });

  useEffect(() => {
    if (!supabase) {
      setState("disabled");
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("ideas_public")
        .select("*")
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error(error);
        setState("error");
        return;
      }
      setIdeas((data ?? []).map(parseIdeaRow));
      setState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(320, r.width), h: Math.max(360, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (state === "disabled") {
    return (
      <div className="ideas-map container" style={{ color: "var(--ink-3)", padding: 40 }}>
        Ideas page is not configured yet (missing Supabase env vars).
      </div>
    );
  }

  return (
    <div ref={containerRef} className="ideas-map container">
      {state === "loading" && <div className="ideas-state">Loading…</div>}
      {state === "error" && (
        <div className="ideas-state ideas-state--error">
          Couldn&apos;t load ideas — please refresh.
        </div>
      )}
      {state === "ready" && ideas.length === 0 && (
        <div className="ideas-state">No ideas yet — be the first.</div>
      )}
      {state === "ready" && ideas.length > 0 && (
        <svg className="ideas-canvas" viewBox={`0 0 ${size.w} ${size.h}`}>
          {/* Cluster labels */}
          {Object.entries(THEME_LABELS).map(([key, label]) => {
            const c = themeToCluster(key as keyof typeof THEME_LABELS);
            return (
              <text
                key={key}
                x={c.x * size.w}
                y={c.y * size.h - 60}
                className="ideas-cluster-label"
                textAnchor="middle"
              >
                {label.toUpperCase()}
              </text>
            );
          })}

          {/* Nodes */}
          {ideas.map((idea) => {
            const c = themeToCluster(idea.theme);
            // Deterministic jitter so re-renders don't shuffle nodes.
            const jitterX = ((hash(idea.id) % 100) - 50) * 1.2;
            const jitterY = ((hash(idea.id + "y") % 100) - 50) * 1.2;
            const v = commitmentToVisual(idea.commitment);
            const isPending = idea.status === "pending";
            return (
              <g
                key={idea.id}
                transform={`translate(${c.x * size.w + jitterX}, ${c.y * size.h + jitterY})`}
              >
                {v.halo && (
                  <circle
                    r={v.radius + 4}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={isPending ? 0.4 : 0.9}
                  />
                )}
                <circle
                  r={v.radius}
                  fill="var(--accent)"
                  fillOpacity={v.fillOpacity * (isPending ? 0.6 : 1)}
                  stroke={isPending ? "var(--accent)" : "none"}
                  strokeDasharray={isPending ? "3 3" : undefined}
                  strokeWidth={isPending ? 1 : 0}
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// Tiny string hash for deterministic per-id jitter.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
