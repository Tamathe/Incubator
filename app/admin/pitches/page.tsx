import { prisma } from "@/lib/prisma";
import { setPitchStatus, setPitchNotes } from "./actions";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "reviewing", "accepted", "declined", "converted"] as const;
type StatusKey = (typeof STATUSES)[number];

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PitchesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedId = params.id;

  const pitches = await prisma.pitch.findMany({ orderBy: { createdAt: "desc" } });
  const selected = selectedId ? pitches.find((p) => p.id === selectedId) : undefined;

  const byStatus: Record<StatusKey, typeof pitches> = {
    new: [], reviewing: [], accepted: [], declined: [], converted: [],
  };
  for (const p of pitches) byStatus[p.status as StatusKey].push(p);

  return (
    <>
      <div className="topbar">
        <h1>Pitches</h1>
        <a href="/api/admin/pitches.csv" className="btn sm" download>Export CSV</a>
      </div>

      {pitches.length === 0 ? (
        <p className="small" style={{ color: "var(--ink-3)" }}>
          No pitches yet. The form is live on <code>/join</code> (Path 02).
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {STATUSES.map((s) => (
              <div key={s} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 10, minHeight: 200 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{s} · {byStatus[s].length}</div>
                {byStatus[s].map((p) => (
                  <a
                    key={p.id}
                    href={`/admin/pitches?id=${p.id}`}
                    className="card"
                    style={{
                      display: "block",
                      padding: 10,
                      marginBottom: 8,
                      textDecoration: "none",
                      color: "inherit",
                      fontSize: 12,
                      border: selectedId === p.id ? "1px solid var(--accent)" : undefined,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{p.submitterName}</div>
                    <div className="small" style={{ color: "var(--ink-3)" }}>{p.role ?? ""}</div>
                    <div style={{ marginTop: 6, color: "var(--ink-2)", lineHeight: 1.4 }}>
                      {p.problem.length > 80 ? p.problem.slice(0, 80) + "…" : p.problem}
                    </div>
                  </a>
                ))}
              </div>
            ))}
          </div>

          {selected && (
            <aside style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: 20, position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{selected.submitterName}</h2>
                <a href="/admin/pitches" className="small" style={{ color: "var(--ink-3)" }}>close ✕</a>
              </div>
              <div className="small" style={{ color: "var(--ink-3)", marginBottom: 14 }}>
                {selected.submitterEmail} {selected.role ? `· ${selected.role}` : ""}
              </div>

              <form action={async (fd) => { "use server"; await setPitchStatus(selected.id, String(fd.get("status") ?? "new")); }} style={{ marginBottom: 18 }}>
                <label className="eyebrow" style={{ display: "block", marginBottom: 6 }}>Status</label>
                <select name="status" defaultValue={selected.status} style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)" }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" className="btn sm primary" style={{ marginTop: 8 }}>Save status</button>
              </form>

              <h3 className="eyebrow">What they are bringing</h3>
              <p style={{ margin: "6px 0 16px 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{selected.problem}</p>
              <h3 className="eyebrow">What they want from the room</h3>
              <p style={{ margin: "6px 0 16px 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{selected.affected}</p>
              <h3 className="eyebrow">What the group should know first</h3>
              <p style={{ margin: "6px 0 16px 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{selected.firstBuild || "Nothing else yet."}</p>

              <form action={async (fd) => { "use server"; await setPitchNotes(selected.id, String(fd.get("notes") ?? "")); }}>
                <label className="eyebrow" style={{ display: "block", marginBottom: 6 }}>Private notes</label>
                <textarea
                  name="notes"
                  defaultValue={selected.notes ?? ""}
                  rows={5}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", padding: 10, fontSize: 13, fontFamily: "var(--sans)", resize: "vertical" }}
                />
                <button type="submit" className="btn sm primary" style={{ marginTop: 8 }}>Save notes</button>
              </form>

              <div className="small" style={{ color: "var(--ink-3)", marginTop: 18 }}>
                Submitted {selected.createdAt.toLocaleString("en-US")}
              </div>
            </aside>
          )}
        </div>
      )}
    </>
  );
}
