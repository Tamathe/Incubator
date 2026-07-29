"use client";

import {
  buildIcsCalendar,
  downloadIcs,
  fridaySlotsToIcsEvents,
} from "@/lib/calendar";
import type { FridaySlot } from "@/lib/friday-booking";

export default function SubscribeAllButton({ slots }: { slots: FridaySlot[] }) {
  function handleClick() {
    const ics = buildIcsCalendar(fridaySlotsToIcsEvents(slots));
    downloadIcs("aiincubator-fridays.ics", ics);
  }

  return (
    <button type="button" className="btn" onClick={handleClick}>
      Subscribe to all (.ics) <span className="arrow">→</span>
    </button>
  );
}
