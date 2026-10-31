import { Visual, visualIssues, type Visual as VisualData } from "./notes/visual";

export interface NoteRow {
  id: string;
  title: string;
  body: string;
  visual: unknown;
  sort: number;
  updated_at: string;
}

/** Accepts the artifact's JSON string or already-decoded JSON; rejects invalid pictures safely. */
export function parseVisuals(raw: unknown): { visuals: VisualData[]; invalid: boolean } {
  try {
    if (raw == null || raw === "") return { visuals: [], invalid: false };
    const value: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (value == null || value === "") return { visuals: [], invalid: false };
    const items = Array.isArray(value) ? value : [value];
    const visuals: VisualData[] = [];
    let invalid = false;
    for (const item of items) {
      const parsed = Visual.safeParse(item);
      if (parsed.success && visualIssues(parsed.data).length === 0) visuals.push(parsed.data);
      else invalid = true;
    }
    return { visuals, invalid };
  } catch {
    return { visuals: [], invalid: true };
  }
}
