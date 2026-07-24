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
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

function EmptySlot({ slot }: { slot: FridaySlot }) {
  const labels = {
    available: { chip: "Open to proposals", title: null, className: "kind-open" },
    reserved: {
      chip: "Reserved",
      title: "Incubator-led session",
      className: "kind-reserved",
    },
    held: { chip: "Held", title: "Proposal under review", className: "kind-held" },
    booked: { chip: "Scheduled", title: "Details coming soon", className: "kind-booked" },
    unavailable: {
      chip: "No meeting",
      title: null,
      className: "kind-unavailable",
    },
  } as const;
  const label = labels[slot.state];

  return (
    <div className="upcoming-row">
      <div className="row-head">
        <span className={`chip kind ${label.className}`}>{label.chip}</span>
        {label.title && <span className="row-title">{label.title}</span>}
      </div>
    </div>
  );
}

export default async function UpcomingSessions() {
  const slots = await loadFridaySlots(new Date(), HORIZON);

  return (
    <section className="section container" id="schedule">
      <div className="section-head">
        <h2 className="h1" style={{ maxWidth: "20ch" }}>
          Coming up.
        </h2>
      </div>

      <div className="upcoming">
        {slots.map((slot) => {
          const iso = slot.date;
          const meetings = meetingsForDate(iso);
          const isCancelledDay =
            meetings.length > 0 && meetings.every((m) => m.kind === "cancelled");
          const dateLabel = fmtDate(iso);

          return (
            <div
              key={iso}
              className={`upcoming-day${isCancelledDay ? " is-cancelled" : ""}`}
            >
              <div className="upcoming-date">
                <span>{dateLabel}</span>
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
