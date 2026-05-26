import type { Lead } from "@/content/site";

export default function PersonCard({ person }: { person: Lead }) {
  return (
    <div className="person">
      <div className="avatar">{person.initials}</div>
      <div>
        <div className="name">{person.name}</div>
        <div className="role">{person.role}</div>
      </div>
      <div className="areas">
        {person.areas.map((a) => (
          <span className="chip" key={a}>
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}
