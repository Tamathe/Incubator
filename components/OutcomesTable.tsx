"use client";

import { useMemo, useState } from "react";
import type { Outcome, OutcomeKind } from "@/content/site";
import { content } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";

interface OutcomesTableProps {
  outcomes: Outcome[];
}

const KINDS: { value: OutcomeKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "grant", label: "Grants" },
  { value: "paper", label: "Papers" },
  { value: "product", label: "Products" },
  { value: "student", label: "Students" },
  { value: "media", label: "Media" },
  { value: "talk", label: "Talks" },
];

export default function OutcomesTable({ outcomes }: OutcomesTableProps) {
  const [filter, setFilter] = useState<OutcomeKind | "all">("all");

  const sorted = useMemo(
    () =>
      outcomes
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [outcomes]
  );

  const visible = filter === "all" ? sorted : sorted.filter((o) => o.kind === filter);
  const projectName = (id?: string) =>
    id ? content.projects.find((p) => p.id === id)?.name ?? id : null;

  return (
    <div className="outcomes">
      <div className="outcomes-filters" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            className={`filter-chip ${filter === k.value ? "active" : ""}`}
            onClick={() => setFilter(k.value)}
            aria-pressed={filter === k.value}
          >
            {k.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="small">No entries in this category yet.</div>
      ) : (
        <ul className="outcomes-list">
          {visible.map((o) => (
            <li className="outcome-row" key={o.id}>
              <span className="outcome-date mono">{fmtIsoDate(o.date)}</span>
              <span className={`outcome-kind chip mono kind-${o.kind}`}>{o.kind}</span>
              <span className="outcome-title">
                {o.link ? (
                  <a href={o.link} target="_blank" rel="noopener noreferrer">
                    {o.title}
                  </a>
                ) : (
                  o.title
                )}
                {o.note && <span className="outcome-note small"> — {o.note}</span>}
              </span>
              {projectName(o.project) && (
                <span className="outcome-proj chip mono">{projectName(o.project)}</span>
              )}
              {o.value && <span className="outcome-value mono">{o.value}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
