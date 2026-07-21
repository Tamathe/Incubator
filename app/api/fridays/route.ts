import { NextResponse } from "next/server";
import { loadFridaySlots } from "@/lib/friday-booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const slots = await loadFridaySlots();
  return NextResponse.json(
    { slots },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
