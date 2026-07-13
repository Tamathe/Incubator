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
  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  const header = ["id", "email", "status", "source", "createdAt", "unsubscribedAt"].join(",");
  const lines = rows.map((r) =>
    [
      r.id,
      r.email,
      r.status,
      r.source,
      r.createdAt.toISOString(),
      r.unsubscribedAt?.toISOString() ?? "",
    ].map(csvEscape).join(","),
  );
  const body = [header, ...lines].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
