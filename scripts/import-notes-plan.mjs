/** Pure parts of the notes import (TKT-63), so they can be tested without a database. */
const ID = /^[a-z0-9][a-z0-9-]{0,79}$/;

/** What's wrong with one row, as messages (empty = fine). Mirrors the public.notes checks. */
export function validateNote(r) {
  const out = [];
  if (typeof r.id !== "string" || !ID.test(r.id)) out.push("bad id");
  if (typeof r.title !== "string" || r.title.length < 1 || r.title.length > 160) out.push("title must be 1-160 characters");
  if (typeof r.body !== "string" || r.body.length > 200000) out.push("body missing or over 200,000 characters");
  if (typeof r.free !== "string" || r.free.length > 200000) out.push("free notes missing or too long");
  if (!Array.isArray(r.visual) && (typeof r.visual !== "object" || r.visual === null)) out.push("visual must be an array or object");
  if (!Number.isInteger(r.sort)) out.push("sort must be a whole number");
  if (Number.isNaN(Date.parse(r.updated_at))) out.push("updated_at must be a date");
  return out;
}

/** insert new notes, update ones the copy is newer than, skip ones edited on the website since. */
export function planNotes(rows, existing) {
  const at = new Map(existing.map((e) => [e.id, Date.parse(e.updated_at)]));
  return rows.map((row) => {
    if (!at.has(row.id)) return { action: "insert", row, why: "new" };
    if (at.get(row.id) > Date.parse(row.updated_at)) return { action: "skip", row, why: "edited on the website after the copy: kept" };
    return { action: "update", row, why: "website copy is older" };
  });
}
