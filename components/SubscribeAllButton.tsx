"use client";

import {
  buildIcsCalendar,
  downloadIcs,
  meetingToIcsEvent,
  meetingsForDate,
  openFridayToIcsEvent,
  toIsoDate,
  upcomingFridays,
  type IcsEvent,
} from "@/lib/calendar";

const BUNDLE_HORIZON = 12;

export default function SubscribeAllButton() {
  function handleClick() {
    const events: IcsEvent[] = [];
    for (const friday of upcomingFridays(BUNDLE_HORIZON)) {
      const iso = toIsoDate(friday);
      const meetings = meetingsForDate(iso);
      if (meetings.length === 0) {
        events.push(openFridayToIcsEvent(friday));
      } else {
        meetings.forEach((m, i) => {
          if (m.kind !== "cancelled") events.push(meetingToIcsEvent(m, i));
        });
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
