import Link from "next/link";
import { content } from "@/content/site";
import {
  KIND_LABEL,
  meetingsForDate,
} from "@/lib/calendar";
import {
  bookingDateFromIso,
  loadFridaySlots,
  type FridaySlot,
} from "@/lib/friday-booking";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import SubscribeAllButton from "@/components/SubscribeAllButton";

const HORIZON = 16;

function fmtDate(iso: string) {
  const date = bookingDateFromIso(iso);
  const weekday = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
  });
  const md = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
  return { weekday, md };
}

function EmptySlot({ slot }: { slot: FridaySlot }) {
  const labels = {
    available: { chip: "Open", title: "Open Friday", className: "kind-open" },
    reserved: {
      chip: "Incubator",
      title: "Incubator-led session",
      className: "kind-reserved",
    },
    held: { chip: "Held", title: "Proposal under review", className: "kind-held" },
    booked: { chip: "Scheduled", title: "Friday scheduled", className: "kind-booked" },
    unavailable: {
      chip: "No meeting",
      title: "No meeting this Friday",
      className: "kind-unavailable",
    },
  } as const;
  const label = labels[slot.state];

  return (
    <div className="upcoming-row">
      <div className="row-head">
        <span className={`chip kind ${label.className}`}>{label.chip}</span>
        <span className="row-title">{label.title}</span>
      </div>
      {slot.state === "reserved" && (
        <div className="row-blurb">
          The first Friday of each month stays open for an Incubator-led session.
        </div>
      )}
      {slot.state === "available" && (
        <div className="row-meta">
          <Link className="row-open-cta" href="/pitch">
            Propose a Friday <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default async function UpcomingSessions() {
  const slots = await loadFridaySlots(new Date(), HORIZON);

  return (
    <section className="section container" id="upcoming">
      <div className="section-label">
        <span>Upcoming Fridays</span>
      </div>
      <div className="section-head">
        <h2 className="h1" style={{ maxWidth: "20ch" }}>
          Upcoming Fridays.
        </h2>
        <span className="small">
          Fridays at noon ET on {content.session.venue}
        </span>
      </div>

      <div className="upcoming">
        {slots.map((slot) => {
          const iso = slot.date;
          const meetings = meetingsForDate(iso);
          const isCancelledDay =
            meetings.length > 0 && meetings.every((m) => m.kind === "cancelled");
          const { weekday, md } = fmtDate(iso);

          return (
            <div
              key={iso}
              className={`upcoming-day${isCancelledDay ? " is-cancelled" : ""}`}
            >
              <div className="upcoming-date">
                <span className="weekday">{weekday}</span>
                <span>{md}</span>
              </div>

              <div className="upcoming-rows">
                {meetings.length === 0 ? (
                  <EmptySlot slot={slot} />
                ) : (
                  meetings.map((m, i) => (
                    <div className="upcoming-row" key={`${iso}-${i}`}>
                      <div className="row-head">
                        <span className={`chip kind kind-${m.kind}`}>
                          {KIND_LABEL[m.kind]}
                        </span>
                        <span className="row-title">{m.title}</span>
                      </div>
                      {m.blurb && <div className="row-blurb">{m.blurb}</div>}
                      <div className="row-meta">
                        <span className="row-presenters">
                          {m.presenters ?? ""}
                        </span>
                        {m.kind !== "cancelled" && (
                          <AddToCalendarButton meeting={m} indexOnDate={i} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="upcoming-actions">
        <SubscribeAllButton slots={slots} />
      </div>
    </section>
  );
}
