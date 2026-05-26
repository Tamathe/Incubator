"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type Idea,
  type IdeaTheme,
  THEME_LABELS,
  COMMITMENT_LABELS,
  parseIdeaRow,
} from "@/lib/ideas";
import IdeaIntakeDrawer from "./IdeaIntakeDrawer";
import IdeaDetailPanel from "./IdeaDetailPanel";

const COMMITMENT_ORDER: Record<string, number> = {
  committed: 0,
  exploring: 1,
  curious: 2,
};

export default function IdeasGrid() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selected, setSelected] = useState<Idea | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from("ideas_public")
        .select("*")
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false });
      setIdeas((data ?? []).map(parseIdeaRow));
    })();
  }, []);

  return (
    <div className="container ideas-grid-wrap">
      <button className="btn primary lg" style={{ width: "100%" }} onClick={() => setIntakeOpen(true)}>
        + Add your idea
      </button>

      {(Object.keys(THEME_LABELS) as IdeaTheme[]).map((theme) => {
        const inTheme = ideas
          .filter((i) => i.theme === theme)
          .sort((a, b) => COMMITMENT_ORDER[a.commitment] - COMMITMENT_ORDER[b.commitment]);
        if (inTheme.length === 0) return null;
        return (
          <section key={theme} className="ideas-grid-section">
            <h3 className="h3">{THEME_LABELS[theme]}</h3>
            <div className="ideas-grid-cards">
              {inTheme.map((idea) => (
                <button
                  key={idea.id}
                  className={`ideas-grid-card ideas-grid-card--${idea.commitment} ${
                    idea.status === "pending" ? "is-pending" : ""
                  }`}
                  onClick={() => setSelected(idea)}
                >
                  <span className="ideas-grid-dot" />
                  <div className="ideas-grid-card-body">
                    <div className="ideas-grid-card-title">{idea.title}</div>
                    <div className="ideas-grid-card-meta">
                      {COMMITMENT_LABELS[idea.commitment]} · {idea.submitterName}
                      {idea.status === "pending" ? " · pending" : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {ideas.length === 0 && (
        <div className="ideas-state">No ideas yet — be the first.</div>
      )}

      <IdeaDetailPanel idea={selected} onClose={() => setSelected(null)} />
      <IdeaIntakeDrawer
        open={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        onInsert={(row) => setIdeas((prev) => [parseIdeaRow(row), ...prev])}
      />
    </div>
  );
}
