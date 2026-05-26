import { content } from "@/content/site";

export default function PartnersStrip() {
  const partners = content.partners;
  if (partners.length === 0) return null;

  return (
    <section className="partners-strip container" aria-label="Partners">
      <div className="section-label">
        <span className="idx">·</span> <span>With</span>
      </div>
      <div className="partners-row">
        {partners.map((p) => (
          <div className="partner-item" key={p.id}>
            <div className="partner-name">{p.name}</div>
            <div className="partner-role mono">{p.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
