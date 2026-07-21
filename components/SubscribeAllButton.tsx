"use client";

import {
  buildIcsCalendar,
  downloadIcs,
  meetingToIcsEvent,
  meetingsForDate,
  openFridayToIcsEvent,
  scheduledFridayToIcsEvent,
  type IcsEvent,
} from "@/lib/calendar";
import type { FridaySlot } from "@/lib/friday-booking";

const BUNDLE_HORIZON = 12;

export default function SubscribeAllButton({ slots }: { slots: FridaySlot[] }) {
  function handleClick() {
    const events: IcsEvent[] = [];
    for (const slot of slots.slice(0, BUNDLE_HORIZON)) {
      const iso = slot.date;
      const meetings = meetingsForDate(iso);
      if (meetings.length > 0) {
        meetings.forEach((m, i) => {
          if (m.kind !== "cancelled") events.push(meetingToIcsEvent(m, i));
        });
      } else if (slot.state === "available") {
        events.push(openFridayToIcsEvent(new Date(`${iso}T12:00:00`)));
      } else if (slot.state === "reserved") {
        events.push(
          scheduledFridayToIcsEvent(
            iso,
            "AI Incubator — reserved Friday",
            "The first Friday of the month is reserved for the Incubator's own session.",
          ),
        );
      } else if (slot.state === "booked") {
        events.push(
          scheduledFridayToIcsEvent(
            iso,
            "AI Incubator — Friday session",
            "This Friday has a confirmed session. Details will be published after review.",
          ),
        );
      }
    }
    const ics = buildIcsCalendar(events);
    downloadIcs("aiincubator-fridays.ics", ics);
  }

  return (
    <button type="button" className="btn" onClick={handleClick}>
      Subscribe to all (.ics) <span className="arrow">→</span>
    </button>
  );
}
