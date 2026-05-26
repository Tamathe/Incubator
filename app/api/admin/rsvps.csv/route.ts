import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  await requireAdmin();
  const rows = await prisma.rsvp.findMany({ orderBy: [{ meetingDate: "desc" }, { createdAt: "desc" }] });

  const header = ["id", "name", "email", "role", "motivations", "note", "joinListserv", "meetingDate", "reviewed", "createdAt"].join(",");
  const lines = rows.map((r) =>
    [
      r.id,
      r.name,
      r.email,
      r.role,
      r.motivations.join("; "),
      r.note,
      r.joinListserv ? "true" : "false",
      r.meetingDate.toISOString(),
      r.reviewed ? "true" : "false",
      r.createdAt.toISOString(),
    ].map((v) => csvEscape(typeof v === "string" ? v : String(v))).join(","),
  );
  const body = [header, ...lines].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="rsvps.csv"',
    },
  });
}
