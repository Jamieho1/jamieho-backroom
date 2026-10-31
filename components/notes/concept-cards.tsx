"use client";
/**
 * A coding note as collapsible concept cards (Jamie 2026-10-26). Closed cards show the concept, its "when" line and a
 * time/space badge. The keyword table and complexity box start open. "Visual ▸" opens the Visuals tab at that concept.
 */
import { useEffect, useMemo, useState } from "react";
import { Markdown, MdInline, type AutoLink } from "./markdown";
import { splitConcepts } from "@/lib/notes/concepts";

export const OPEN_CARD = "ip-open-card";
const START_OPEN = /^(spot the type|how to read|interview method)/i;

export function ConceptCards({ body, links, onVisual, visualConcepts, recall = false }: { body: string; links?: AutoLink[]; onVisual?(concept: string): void; visualConcepts?: Set<string>; recall?: boolean }) {
  const { pre, sections } = useMemo(() => splitConcepts(body), [body]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(sections.filter((s) => START_OPEN.test(s.title)).map((s) => s.id)));
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setOpen((o) => new Set(o).add(id));
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    window.addEventListener(OPEN_CARD, on);
    return () => window.removeEventListener(OPEN_CARD, on);
  }, []);
  const toggle = (id: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allOpen = sections.every((s) => open.has(s.id));
  return (
    <div className="cc-list">
      {pre ? <Markdown text={pre} links={links} recall={recall} /> : null}
      <div className="actions cc-tools">
        <button type="button" className="chip-link" onClick={() => setOpen(allOpen ? new Set() : new Set(sections.map((s) => s.id)))}>
          {allOpen ? "Close all" : "Open all"}
        </button>
        <span className="hint">{sections.filter((s) => s.numbered).length} concepts</span>
      </div>
      {sections.map((s) => {
        const isOpen = open.has(s.id);
        return (
          <section key={s.id} id={s.id} className="cc" data-open={isOpen || undefined} data-numbered={s.numbered || undefined}>
            <div className="cc-head">
              <button type="button" className="cc-toggle" aria-expanded={isOpen} onClick={() => toggle(s.id)}>
                <span className="cc-caret" aria-hidden="true">
                  {isOpen ? "▾" : "▸"}
                </span>
                <span className="cc-title">
                  <MdInline text={s.title} />
                </span>
                {s.badge ? <span className="cc-badge mono">{s.badge}</span> : null}
              </button>
              {onVisual && visualConcepts?.has(s.title) ? (
                <button type="button" className="chip-link cc-vis" onClick={() => onVisual(s.title)} title="Open this concept in the Visuals tab">
                  Visual ▸
                </button>
              ) : null}
            </div>
            {!isOpen && s.when ? (
              <p className="cc-when">
                <MdInline text={s.when} />
              </p>
            ) : null}
            {isOpen ? (
              <div className="cc-body">
                <Markdown key={String(recall)} text={s.body} links={links} recall={recall} />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
