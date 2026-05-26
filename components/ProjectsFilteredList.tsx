"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectStatus } from "@/content/site";
import ProjectCard from "./ProjectCard";
import KickoffCard from "./KickoffCard";

type StatusFilter = "all" | ProjectStatus;

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  active: "Active",
  building: "Building",
  kickoff: "Just kicked off",
  paused: "On hold",
};

export default function ProjectsFilteredList({
  projects,
}: {
  projects: Project[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [areaFilter, setAreaFilter] = useState<string | null>(null);

  const areas = useMemo(() => {
    // Split combined areas (e.g. "Trauma · Aerospace") into individual tokens
    const set = new Set<string>();
    projects.forEach((p) => {
      p.area.split("·").forEach((a) => set.add(a.trim()));
    });
    return Array.from(set).sort();
  }, [projects]);

  const statusCounts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: projects.length,
      active: 0,
      building: 0,
      kickoff: 0,
      paused: 0,
    };
    projects.forEach((p) => {
      c[p.status]++;
    });
    return c;
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (areaFilter && !p.area.includes(areaFilter)) return false;
      return true;
    });
  }, [projects, statusFilter, areaFilter]);

  const statusFilters: StatusFilter[] = [
    "all",
    "active",
    "building",
    "kickoff",
    "paused",
  ];

  return (
    <>
      <section className="container">
        <div className="projects-filter">
          <div className="group">
            <span className="lbl">Status</span>
            {statusFilters.map((s) => (
              <button
                key={s}
                className={`filter-chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_LABELS[s]} · {statusCounts[s]}
              </button>
            ))}
          </div>
          <div className="group" style={{ marginLeft: "auto" }}>
            <span className="lbl">Area</span>
            <button
              className={`filter-chip ${areaFilter === null ? "active" : ""}`}
              onClick={() => setAreaFilter(null)}
            >
              All
            </button>
            {areas.map((a) => (
              <button
                key={a}
                className={`filter-chip ${areaFilter === a ? "active" : ""}`}
                onClick={() => setAreaFilter(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="container"
        style={{ paddingBottom: "calc(80px * var(--d))" }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "80px 0",
              textAlign: "center",
              color: "var(--ink-3)",
              fontFamily: "var(--mono)",
              fontSize: 13,
            }}
          >
            No projects match those filters.
          </div>
        ) : (
          <div className="proj-grid big" style={{ marginTop: 32 }}>
            {filtered.map((p) =>
              p.status === "kickoff" ? (
                <KickoffCard key={p.id} project={p} />
              ) : (
                <ProjectCard key={p.id} project={p} />
              )
            )}
          </div>
        )}
      </section>
    </>
  );
}
