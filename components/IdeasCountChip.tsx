"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function IdeasCountChip() {
  const [counts, setCounts] = useState<{ total: number; needsHelp: number } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from("ideas_public")
        .select("looking_for")
        .in("status", ["pending", "approved"]);
      if (!data) return;
      const total = data.length;
      const needsHelp = data.filter(
        (r: { looking_for: string[] | null }) =>
          Array.isArray(r.looking_for) && r.looking_for.length > 0,
      ).length;
      setCounts({ total, needsHelp });
    })();
  }, []);

  if (!counts) return null;
  return (
    <span className="chip ideas-count-chip">
      {counts.total} {counts.total === 1 ? "idea" : "ideas"}
      {counts.needsHelp > 0 && <> · {counts.needsHelp} looking for collaborators</>}
    </span>
  );
}
