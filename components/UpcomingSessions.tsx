import { content, type MeetingSession } from "@/content/site";
import { upcomingFridays, toIsoDate, meetingsForDate } from "@/lib/calendar";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import SubscribeAllButton from "@/components/SubscribeAllButton";

const HORIZON = 8;
const KIND_LABEL: Record<MeetingSession["kind"], string> = {
  pitch: "Pitch",
  demo: "Demo",
  presentation: "Presentation",
  roundtable: "Roundtable",
  cancelled: "Cancelled",
};

function fmtDate(d: Date) {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const md = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { weekday, md };
}

export default function UpcomingSessions() {
  const fridays = upcomingFridays(HORIZON);

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
        {fridays.map((friday) => {
          const iso = toIsoDate(friday);
          const meetings = meetingsForDate(iso);
          const isCancelledDay =
            meetings.length > 0 && meetings.every((m) => m.kind === "cancelled");
          const { weekday, md } = fmtDate(friday);

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
                  <div className="upcoming-row">
                    <div className="row-head">
                      <span className="chip kind kind-open">Open</span>
                      <span className="row-title">Topic open</span>
                    </div>
                    <div className="row-meta">
                      <a className="row-open-cta" href="/pitch">
                        Pitch a topic →
                      </a>
                    </div>
                  </div>
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
