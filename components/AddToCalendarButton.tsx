"use client";

import type { MeetingSession } from "@/content/site";
import {
  buildIcsEvent,
  downloadIcs,
  meetingToIcsEvent,
} from "@/lib/calendar";

interface Props {
  meeting: MeetingSession;
  indexOnDate: number;
}

export default function AddToCalendarButton({ meeting, indexOnDate }: Props) {
  function handleClick() {
    const event = meetingToIcsEvent(meeting, indexOnDate);
    const ics = buildIcsEvent(event);
    downloadIcs(
      `aiincubator-${meeting.date}-${meeting.kind}-${indexOnDate}.ics`,
      ics
    );
  }

  return (
    <button type="button" className="btn ghost sm" onClick={handleClick}>
      Add to calendar <span className="arrow">→</span>
    </button>
  );
}
