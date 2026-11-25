import { beforeEach, describe, it, expect, vi } from "vitest";

/** PL2/PL4: content_changes is shared with PassLoop. A tiny in-memory Supabase honours .eq(), so a passloop draft must stay invisible. */
type Row = Record<string, unknown>;
const m = vi.hoisted(() => ({ viewer: vi.fn(), server: vi.fn(), revalidate: vi.fn(), draftMode: vi.fn(), cookies: vi.fn(), updates: [] as unknown[], tables: {} as Record<string, Row[]> }));
vi.mock("@/lib/viewer", () => ({ getViewer: m.viewer }));
vi.mock("@/lib/supabase/server", () => ({ supabaseServer: m.server }));
vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("next/navigation", () => ({ notFound: () => { throw Error("404"); } }));
vi.mock("next/headers", () => ({ draftMode: m.draftMode, cookies: m.cookies }));
import { loadContentReview } from "@/lib/content-drafts/review";
import { loadOwnerPreview } from "@/lib/content-drafts/preview";
import { approveContentChange, discardContentChange } from "@/app/actions/content-drafts";
import { getContentDraftCount } from "@/app/actions/content-draft-count";
import { CONTENT_SITE } from "@/lib/content-drafts/site";

function query(table: string) {
  const filters: [string, unknown][] = [];
  let patch: Row | null = null; let head = false; let countMode = false;
  const rows = () => (m.tables[table] ?? []).filter(row => filters.every(([k, v]) => row[k] === v));
  const settle = () => {
    if (patch) { const hit = rows(); for (const row of hit) Object.assign(row, patch); m.updates.push({ table, patch, filters: [...filters] }); return { data: hit.map(r => ({ id: r.id, previous: [] })), error: null }; }
    const data = rows(); return countMode && head ? { data: null, count: data.length, error: null } : { data, error: null };
  };
  const q: Record<string, unknown> = {
    select: (_c?: string, opts?: { count?: string; head?: boolean }) => { countMode = !!opts?.count; head = !!opts?.head; return q; },
    update: (p: Row) => { patch = p; return q; },
    eq: (k: string, v: unknown) => { filters.push([k, v]); return q; },
    filter: () => q, order: () => q,
    maybeSingle: async () => { const r = settle(); return { data: (r.data as Row[] | null)?.[0] ?? null, error: null }; },
    then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(settle()).then(res, rej),
  };
  return q;
}
const ids = { personal: "00000000-0000-4000-8000-0000000000a1", passloop: "00000000-0000-4000-8000-0000000000a2" };
const hero = [{ op: "update", table: "site_sections", key: "hero", fields: { title: "Proposed" } }];
// The operations are valid personal-site operations on purpose: only the site tag differs.
const draft = (id: string, site: string): Row => ({ id, site, summary: `Draft ${site}`, status: "draft", operations: hero, photo_slots: [], created_at: "2026-11-24" });
beforeEach(() => {
  vi.resetAllMocks(); m.updates.length = 0;
  m.tables = { content_changes: [draft(ids.personal, "personal"), draft(ids.passloop, "passloop")], site_sections: [{ key: "hero", title: "Live", body: "" }], experience_items: [], experience_bullets: [], projects: [], articles: [], guides: [] };
  m.viewer.mockResolvedValue({ role: "owner", id: "owner" });
  m.server.mockResolvedValue({ from: (t: string) => query(t) });
});

describe("a PassLoop draft is invisible to the personal site", () => {
  it("this site is the personal one", () => expect(CONTENT_SITE).toBe("personal"));
  it("the review list shows only personal drafts", async () => {
    const { drafts } = await loadContentReview();
    expect(drafts.map(d => d.id)).toEqual([ids.personal]);
  });
  it("the draft counter counts only personal drafts", async () => {
    expect(await getContentDraftCount()).toBe(1);
    m.tables.content_changes = [draft(ids.passloop, "passloop")];
    expect(await getContentDraftCount()).toBe(0);
  });
  it("preview opens a personal draft and refuses a PassLoop one", async () => {
    expect(await loadOwnerPreview(ids.personal)).toMatchObject({ id: ids.personal });
    expect(await loadOwnerPreview(ids.passloop)).toBeNull();
  });
  it("approve and discard cannot touch a PassLoop draft, even by its exact id", async () => {
    expect(await approveContentChange(ids.passloop)).toMatchObject({ ok: false, message: expect.stringContaining("missing or already reviewed") });
    expect(await discardContentChange(ids.passloop)).toMatchObject({ ok: false, message: expect.stringContaining("missing or already reviewed") });
    expect(m.tables.content_changes.find(r => r.id === ids.passloop)?.status).toBe("draft");
    expect(m.revalidate).not.toHaveBeenCalled();
    expect((await approveContentChange(ids.personal)).ok).toBe(true);
    expect(m.tables.content_changes.find(r => r.id === ids.personal)?.status).toBe("approved");
    expect(m.updates.every(u => (u as { filters: [string, unknown][] }).filters.some(([k, v]) => k === "site" && v === "personal"))).toBe(true);
    expect(await discardContentChange(ids.passloop)).toMatchObject({ ok: false });
  });
});
