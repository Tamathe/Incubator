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
  className?: string;
  label?: string;
}

export default function AddToCalendarButton({
  meeting,
  indexOnDate,
  className = "btn ghost sm",
  label = "Add to calendar",
}: Props) {
  function handleClick() {
    const event = meetingToIcsEvent(meeting, indexOnDate);
    const ics = buildIcsEvent(event);
    downloadIcs(
      `aiincubator-${meeting.date}-${meeting.kind}-${indexOnDate}.ics`,
      ics
    );
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label} <span className="arrow">→</span>
    </button>
  );
}
