"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3-force";
import { supabase } from "@/lib/supabase";
import {
  type Idea,
  THEME_LABELS,
  themeToCluster,
  commitmentToVisual,
  parseIdeaRow,
} from "@/lib/ideas";
import IdeaDetailPanel from "./IdeaDetailPanel";

type LoadState = "loading" | "ready" | "error" | "disabled";

export default function IdeasMap() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 600 });
  const [selected, setSelected] = useState<Idea | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

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

  type Pos = { x: number; y: number; vx?: number; vy?: number };
  const [positions, setPositions] = useState<Record<string, Pos>>({});

  useEffect(() => {
    if (state !== "ready" || ideas.length === 0) return;

    const nodes = ideas.map((idea) => {
      const c = themeToCluster(idea.theme);
      return {
        id: idea.id,
        theme: idea.theme,
        x: c.x * size.w,
        y: c.y * size.h,
      } as d3.SimulationNodeDatum & { id: string; theme: string };
    });

    const sim = d3
      .forceSimulation(nodes)
      .force(
        "x",
        d3.forceX<typeof nodes[0]>((d) => themeToCluster(d.theme as any).x * size.w).strength(0.08),
      )
      .force(
        "y",
        d3.forceY<typeof nodes[0]>((d) => themeToCluster(d.theme as any).y * size.h).strength(0.08),
      )
      .force(
        "collide",
        d3.forceCollide<typeof nodes[0]>((d) => {
          const idea = ideas.find((i) => i.id === d.id)!;
          return commitmentToVisual(idea.commitment).radius + 6;
        }),
      )
      .alphaDecay(0.05)
      .on("tick", () => {
        const next: Record<string, Pos> = {};
        for (const n of nodes) next[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
        setPositions(next);
      });

    return () => {
      sim.stop();
    };
  }, [ideas, state, size.w, size.h]);

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
            const pos = positions[idea.id];
            if (!pos) return null;
            const v = commitmentToVisual(idea.commitment);
            const isPending = idea.status === "pending";
            return (
              <g
                key={idea.id}
                className={`idea-node ${hovered === idea.id ? "is-hovered" : ""}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHovered(idea.id)}
                onMouseLeave={() => setHovered((h) => (h === idea.id ? null : h))}
                onClick={() => setSelected(idea)}
                style={{ cursor: "pointer" }}
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
                {hovered === idea.id && (
                  <text y={-(v.radius + 10)} textAnchor="middle" className="idea-node-tip">
                    {idea.title}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      <IdeaDetailPanel idea={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

