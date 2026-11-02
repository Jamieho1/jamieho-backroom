import { Visual, visualIssues, type Visual as VisualData } from "./notes/visual";

export interface NoteRow {
  id: string;
  title: string;
  body: string;
  free: string;
  visual: unknown;
  sort: number;
  updated_at: string;
}

export interface NoteEdit { body: string; free: string }
export const NOTE_TEXT_LIMIT = 200000;
export function validateNoteEdit(id: unknown, value: unknown): string | null {
  if (typeof id !== "string" || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) return "Choose a valid note.";
  if (!value || typeof value !== "object") return "Enter the note text.";
  const edit = value as Record<string, unknown>;
  if (typeof edit.body !== "string" || typeof edit.free !== "string") return "Enter the note text.";
  if (edit.body.length > NOTE_TEXT_LIMIT || edit.free.length > NOTE_TEXT_LIMIT) return "Keep each text field under 200,000 characters.";
  return null;
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

/** Notes are split into two shelves (2026-11-02): coding topics and system-design notes (ids starting `sd-`). */
export const NOTE_TRACKS = [
  { id: "coding", label: "Coding", nav: "Coding topics" },
  { id: "system-design", label: "System design", nav: "System design topics" },
] as const;
export type NoteTrack = (typeof NOTE_TRACKS)[number]["id"];
export const noteTrack = (id: string): NoteTrack => (id.startsWith("sd-") ? "system-design" : "coding");
/** Sidebar label: drop a "System design: " prefix, since the shelf already says so. */
export const shelfTitle = (title: string) => title.replace(/^system design:\s*/i, "");
