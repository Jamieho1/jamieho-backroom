import type { Item } from "@/lib/experience";

/** The public CV: what visitors see on the landing page. */
export function ExperienceList({ items }: { items: Item[] }) {
  return (
    <ol className="xp">
      {items.map((it) => (
        <li key={it.id ?? it.title} className="xp-item">
          <div className="xp-head">
            <h3>
              {it.title}
              {it.org ? <span className="xp-org"> · {it.org}</span> : null}
            </h3>
            {it.dates || it.location ? <span className="muted small">{[it.dates, it.location].filter(Boolean).join(" · ")}</span> : null}
          </div>
          {it.summary ? <p className="xp-summary">{it.summary}</p> : null}
          {it.bullets.length ? (
            <ul>
              {it.bullets.map((b) => (
                <li key={b.id ?? b.text}>{b.text}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
