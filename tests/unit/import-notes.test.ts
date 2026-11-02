import { describe, expect, it } from "vitest";
// @ts-expect-error plain JS module used by the import script
import { planNotes, validateNote } from "../../scripts/import-notes-plan.mjs";

const row = (o: Record<string, unknown> = {}) => ({ id: "heap", title: "Heap", body: "## Heap", free: "", visual: [], sort: 10, updated_at: "2026-10-28T10:00:00Z", ...o });

describe("notes import", () => {
  it("accepts a good row and names what's wrong with a bad one", () => {
    expect(validateNote(row())).toEqual([]);
    expect(validateNote(row({ id: "n_heap", title: "", sort: 1.5, updated_at: "nope" }))).toHaveLength(4);
    expect(validateNote(row({ body: "x".repeat(200001) }))).toEqual(["body missing or over 200,000 characters"]);
  });
  it("inserts new notes, updates older ones and never overwrites newer website edits", () => {
    const plan = planNotes(
      [row({ id: "heap" }), row({ id: "tries" }), row({ id: "graphs" })],
      [
        { id: "tries", updated_at: "2026-10-01T00:00:00Z" },
        { id: "graphs", updated_at: "2026-11-01T00:00:00Z" },
      ],
    );
    expect(plan.map((p: { action: string }) => p.action)).toEqual(["insert", "update", "skip"]);
  });
});
