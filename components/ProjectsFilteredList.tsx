"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectStatus } from "@/content/site";
import ProjectCard from "./ProjectCard";

type StatusFilter = "all" | ProjectStatus;

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  active: "Active",
  building: "In development",
  kickoff: "New",
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
    // Split combined areas written with either a slash or middle dot.
    const set = new Set<string>();
    projects.forEach((p) => {
      p.area.split(/[\/\u00b7]/).forEach((a) => set.add(a.trim()));
    });
    return Array.from(set).sort();
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
          <div className="group" aria-label="Filter projects by status">
            {statusFilters.filter((s) => s === "all" || projects.some((project) => project.status === s)).map((s) => (
              <button
                type="button"
                key={s}
                className={`filter-chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
                aria-pressed={statusFilter === s}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <label className="projects-area-select" aria-label="Filter projects by area">
            <select
              value={areaFilter ?? ""}
              onChange={(event) => setAreaFilter(event.target.value || null)}
            >
              <option value="">All areas</option>
              {areas.map((area) => <option value={area} key={area}>{area}</option>)}
            </select>
          </label>
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
            No projects match those filters. Try another area or stage.
          </div>
        ) : (
          <div className="proj-grid big" style={{ marginTop: 32 }}>
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
