import { prisma } from "@/lib/prisma";
import { addSubscriber, setSubscriberStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subs = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="topbar">
        <h1>Subscribers</h1>
        <a href="/api/admin/subscribers.csv" className="btn sm" download>Export CSV</a>
      </div>

      <form action={async (formData) => { "use server"; await addSubscriber(formData); }} style={{ marginBottom: 20, display: "flex", gap: 8 }}>
        <input
          name="email"
          type="email"
          placeholder="add@email.com"
          required
          style={{
            padding: "8px 12px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--ink)",
            fontSize: 14,
            minWidth: 280,
          }}
        />
        <button type="submit" className="btn primary sm">Add subscriber</button>
      </form>

      {subs.length === 0 ? (
        <p className="small" style={{ color: "var(--ink-3)" }}>
          No subscribers yet. Add one above, or wait for signups from the footer / <code>/join</code> form.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Signed up</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subs.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>{row.source ?? "—"}</td>
                <td>
                  <span style={{ color: row.status === "active" ? "var(--signal, #2ecc71)" : "var(--ink-3)" }}>
                    {row.status}
                  </span>
                </td>
                <td>{row.createdAt.toISOString().slice(0, 10)}</td>
                <td>
                  <ToggleStatusForm id={row.id} current={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function ToggleStatusForm({ id, current }: { id: string; current: "active" | "unsubscribed" }) {
  const next = current === "active" ? "unsubscribed" : "active";
  return (
    <form action={async () => { "use server"; await setSubscriberStatus(id, next); }}>
      <button type="submit" className="small" style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "var(--ink-2)" }}>
        {current === "active" ? "Unsubscribe" : "Reactivate"}
      </button>
    </form>
  );
}
