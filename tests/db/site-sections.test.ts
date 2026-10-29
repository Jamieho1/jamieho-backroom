import { describe, it, expect, beforeAll } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";

const OWNER = { id: "00000000-0000-4000-8000-0000000000b1", email: "owner@example.com" };
const MEMBER = { id: "00000000-0000-4000-8000-0000000000b2", email: "visitor@example.com" };
const owner = { role: "authenticated" as const, sub: OWNER.id };
const member = { role: "authenticated" as const, sub: MEMBER.id };
const anon = { role: "anon" as const };

let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings (key, value) values ('owner_email', $1)", [OWNER.email]);
  await addUser(db, OWNER);
  await addUser(db, MEMBER);
});

describe("site_sections", () => {
  it("is seeded with the four landing sections, placeholders only", async () => {
    const r = await db.query<{ key: string; body: string }>("select key, body from public.site_sections order by sort");
    expect(r.rows.map((x) => x.key)).toEqual(["hero", "about", "writing", "contact"]);
    for (const row of r.rows.slice(1)) expect(row.body).toMatch(/^\*.*\*$/); // italic placeholder text
  });
  it("anyone can read it, without signing in", async () => {
    expect(await as(db, anon, (q) => q("select key from public.site_sections"))).toHaveLength(4);
  });
  it("visitors and members can't change it", async () => {
    await expect(as(db, anon, (q) => q("update public.site_sections set body = 'x'"))).rejects.toThrow(/permission denied/);
    expect(await as(db, member, (q) => q("update public.site_sections set body = 'x' returning key"))).toEqual([]);
    await expect(as(db, member, (q) => q("insert into public.site_sections (key) values ('about')"))).rejects.toThrow(/permission denied/);
    await expect(as(db, owner, (q) => q("delete from public.site_sections where key = 'about'"))).rejects.toThrow(/permission denied/);
  });
  it("the owner edits a section and updated_at moves", async () => {
    await as(db, owner, async (q) => {
      const before = await q<{ updated_at: string }>("select updated_at from public.site_sections where key = 'about'");
      await q("select pg_sleep(0.01)");
      const r = await q<{ body: string; updated_at: string }>("update public.site_sections set body = 'Hello' where key = 'about' returning body, updated_at");
      expect(r[0].body).toBe("Hello");
      expect(new Date(r[0].updated_at) > new Date(before[0].updated_at)).toBe(true);
    });
  });
  it("only known section keys exist", async () => {
    await expect(db.query("insert into public.site_sections (key) values ('cv')")).rejects.toThrow(/check/);
  });
});
