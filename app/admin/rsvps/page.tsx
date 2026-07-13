import { prisma } from "@/lib/prisma";
import { setRsvpReviewed } from "./actions";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function RsvpsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter;

  const where = filter === "unreviewed" ? { reviewed: false } : {};
  const rsvps = await prisma.rsvp.findMany({
    where,
    orderBy: [{ meetingDate: "desc" }, { createdAt: "desc" }],
  });

  const grouped = new Map<string, typeof rsvps>();
  for (const r of rsvps) {
    const key = r.meetingDate.toISOString().slice(0, 10);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  return (
    <>
      <div className="topbar">
        <h1>RSVPs</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <a href={filter === "unreviewed" ? "/admin/rsvps" : "/admin/rsvps?filter=unreviewed"} className="btn sm">
            {filter === "unreviewed" ? "Show all" : "Unreviewed only"}
          </a>
          <a href="/api/admin/rsvps.csv" className="btn sm" download>Export CSV</a>
        </div>
      </div>

      {grouped.size === 0 ? (
        <p className="small" style={{ color: "var(--ink-3)" }}>
          No RSVPs yet. The form is live on <code>/join</code>.
        </p>
      ) : (
        Array.from(grouped.entries()).map(([dateIso, rows]) => (
          <section key={dateIso} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontFamily: "var(--mono)", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05, marginBottom: 12 }}>
              {fmtDate(rows[0]!.meetingDate)} · {rows.length} {rows.length === 1 ? "RSVP" : "RSVPs"}
            </h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Motivations</th>
                  <th>Note</th>
                  <th>Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.role ?? "—"}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.motivations.length === 0
                        ? "—"
                        : r.motivations.map((m) => <span key={m} className="chip" style={{ fontSize: 11, marginRight: 4 }}>{m}</span>)}
                    </td>
                    <td style={{ maxWidth: 320, fontSize: 13, color: "var(--ink-2)" }}>{r.note ?? "—"}</td>
                    <td>
                      <ReviewedToggle id={r.id} reviewed={r.reviewed} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}
    </>
  );
}

function ReviewedToggle({ id, reviewed }: { id: string; reviewed: boolean }) {
  return (
    <form action={async () => { "use server"; await setRsvpReviewed(id, !reviewed); }}>
      <button type="submit" className="small" style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: reviewed ? "var(--signal, #2ecc71)" : "var(--ink-2)" }}>
        {reviewed ? "✓ Reviewed" : "Mark reviewed"}
      </button>
    </form>
  );
}
