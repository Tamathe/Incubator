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
    available: { chip: "Open", title: "Topic open", className: "kind-open" },
    reserved: {
      chip: "Reserved",
      title: "Reserved for the Incubator",
      className: "kind-reserved",
    },
    held: { chip: "Held", title: "Date on hold", className: "kind-held" },
    booked: { chip: "Booked", title: "Friday booked", className: "kind-booked" },
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
          The first Friday of each month stays open for the Incubator&apos;s own session.
        </div>
      )}
      {slot.state === "available" && (
        <div className="row-meta">
          <a className="row-open-cta" href="/join#pitch">
            Book a Friday <span aria-hidden="true">-&gt;</span>
          </a>
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
        <span className="idx">02</span> <span>Upcoming Fridays</span>
      </div>
      <div className="section-head">
        <h2 className="h1" style={{ maxWidth: "20ch" }}>
          What&apos;s on the calendar.
        </h2>
        <span className="small">
          Fridays · 12:00 pm · {content.session.venue}
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
        <SubscribeAllButton />
      </div>
    </section>
  );
}
