import {
  buildIcsCalendar,
  FRIDAY_CALENDAR_HORIZON,
  fridaySlotsToIcsEvents,
} from "@/lib/calendar";
import { loadFridaySlots } from "@/lib/friday-booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const slots = await loadFridaySlots(
    new Date(),
    FRIDAY_CALENDAR_HORIZON,
  );
  const calendar = buildIcsCalendar(fridaySlotsToIcsEvents(slots));

  return new Response(calendar, {
    headers: {
      "cache-control":
        "public, max-age=300, s-maxage=300, stale-while-revalidate=300",
      "content-disposition":
        'attachment; filename="aiincubator-fridays.ics"',
      "content-type": "text/calendar; charset=utf-8",
    },
  });
}
