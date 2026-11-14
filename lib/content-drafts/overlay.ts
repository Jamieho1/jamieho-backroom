import type { Section, SectionKey } from "@/lib/sections";
import type { ContentOperation } from "./allowlist";

/** Pure, immutable overlay. Callers supply only the owner-validated pending set. Never writes live data. */
export function overlaySections(live: Record<SectionKey, Section>, operations: ContentOperation[]): Record<SectionKey, Section> {
  const sections = { ...live };
  for (const operation of operations) sections[operation.key] = { ...sections[operation.key], ...operation.fields };
  return sections;
}

/** Match the existing journey bindings; do not create chapters for currently undisplayed fields. */
export function draftChapterChanged(chapter: string, sections: readonly SectionKey[]): boolean {
  const bindings: Record<string, readonly SectionKey[]> = {
    sky: ["hero", "contact"], pivot: ["about"], toolkit: ["technology"], creator: ["writing", "contact"], screen: ["contact"],
  };
  return (bindings[chapter] ?? []).some(key => sections.includes(key));
}
