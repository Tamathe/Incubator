import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import UpcomingSessions from "@/components/UpcomingSessions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Friday calendar · AI Incubator",
  description:
    "See upcoming AI Incubator Fridays, find an open date, and request a session.",
};

const RHYTHM = [
  {
    label: "Bring the work",
    copy: "Pitch an idea, show a prototype, teach a method, or bring a problem that needs the room.",
  },
  {
    label: "Work it together",
    copy: "The group asks questions, tests the idea, and helps identify the next useful move.",
  },
  {
    label: "Leave with a next step",
    copy: "The session ends with a concrete action, decision, collaborator, or experiment.",
  },
];

export default function SessionsPage() {
  return (
    <>
      <Nav />

      <main>
        <header className="join-hero container">
          <DotGrid />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1 className="h-display" style={{ maxWidth: "18ch" }}>
              Fridays, <em>on the calendar.</em>
            </h1>
            <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
              Pick an open Friday when you submit your idea. We&apos;ll hold the
              date for seven days while we review the proposal, then confirm it
              by email.
            </p>
            <p className="small" style={{ marginTop: 16, maxWidth: "62ch" }}>
              The first Friday of every month is reserved for the Incubator.
            </p>
          </div>
        </header>

        <section className="section container">
          <h2 className="h1" style={{ maxWidth: "22ch" }}>
            What a Friday is for.
          </h2>
          <div className="steps">
            {RHYTHM.map((item) => (
              <div className="step" key={item.label}>
                <h3 className="h3">{item.label}</h3>
                <p>{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <UpcomingSessions />

        <section className="section container">
          <div className="card" style={{ padding: 24 }}>
            <span className="eyebrow">Have something for the room?</span>
            <h2 className="h2" style={{ marginTop: 9 }}>
              Book a Friday.
            </h2>
            <p className="body" style={{ marginTop: 10, maxWidth: "58ch" }}>
              Send the rough version. Choose a preferred date and an alternate;
              we&apos;ll follow up about the fit and format.
            </p>
            <Link className="btn primary" href="/join#pitch" style={{ marginTop: 16 }}>
              Propose a session <span className="arrow">-&gt;</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
