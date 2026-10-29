import { describe, it, expect, beforeAll } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";

const OWNER = { id: "00000000-0000-4000-8000-0000000000c1", email: "owner@example.com" };
const MEMBER = { id: "00000000-0000-4000-8000-0000000000c2", email: "visitor@example.com" };
const GUEST = { id: "00000000-0000-4000-8000-0000000000c3", email: "invited@example.com" };
const owner = { role: "authenticated" as const, sub: OWNER.id };
const member = { role: "authenticated" as const, sub: MEMBER.id };
const guest = { role: "authenticated" as const, sub: GUEST.id };
const anon = { role: "anon" as const };
const ROLE = "00000000-0000-4000-8000-00000000e001";
const HIDDEN_ROLE = "00000000-0000-4000-8000-00000000e002";

let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings (key, value) values ('owner_email', $1)", [OWNER.email]);
  for (const u of [OWNER, MEMBER, GUEST]) await addUser(db, u);
  await db.query("insert into public.invites (email) values ($1)", [GUEST.email]);
  // Setup as the table owner (tests below check what each role can see and do).
  await db.query("insert into public.experience_items (id, title, org, public) values ($1, 'Software Engineer', 'Acme', true)", [ROLE]);
  await db.query("insert into public.experience_items (id, title, org) values ($1, 'Secret project', 'Acme')", [HIDDEN_ROLE]);
  await db.query("insert into public.experience_bullets (item_id, text, public) values ($1, 'Public bullet', true), ($1, 'Hidden bullet', false)", [ROLE]);
  await db.query("insert into public.experience_bullets (item_id, text, public) values ($1, 'Ticked, but its role is hidden', true)", [HIDDEN_ROLE]);
});

const bullets = (who: Parameters<typeof as>[1]) => as(db, who, (q) => q<{ text: string }>("select text from public.experience_bullets order by text")).then((r) => r.map((x) => x.text));
const items = (who: Parameters<typeof as>[1]) => as(db, who, (q) => q<{ title: string }>("select title from public.experience_items order by title")).then((r) => r.map((x) => x.title));

describe("defaults", () => {
  it("new items and bullets start hidden", async () => {
    const r = await db.query<{ public: boolean }>("insert into public.experience_items (title) values ('x') returning public");
    expect(r.rows[0].public).toBe(false);
    const b = await db.query<{ public: boolean }>("insert into public.experience_bullets (item_id, text) values ($1, 'y') returning public", [ROLE]);
    expect(b.rows[0].public).toBe(false);
    await db.query("delete from public.experience_items where title = 'x'");
    await db.query("delete from public.experience_bullets where text = 'y'");
  });
});

describe("who sees what", () => {
  it("anonymous visitors see only public bullets of public roles", async () => {
    expect(await items(anon)).toEqual(["Software Engineer"]);
    expect(await bullets(anon)).toEqual(["Public bullet"]);
  });
  it("a plain signed-in member sees the same as the public", async () => {
    expect(await items(member)).toEqual(["Software Engineer"]);
    expect(await bullets(member)).toEqual(["Public bullet"]);
  });
  it("someone invited to Behavioral sees the whole CV", async () => {
    expect(await items(guest)).toEqual(["Secret project", "Software Engineer"]);
    expect(await bullets(guest)).toEqual(["Hidden bullet", "Public bullet", "Ticked, but its role is hidden"]);
  });
  it("the owner sees everything", async () => {
    expect(await bullets(owner)).toHaveLength(3);
  });
});

describe("writes", () => {
  it("only the owner can add, edit, reorder or delete", async () => {
    await expect(as(db, anon, (q) => q("update public.experience_bullets set text = 'x'"))).rejects.toThrow(/permission denied/);
    expect(await as(db, member, (q) => q("update public.experience_bullets set text = 'x' returning id"))).toEqual([]);
    expect(await as(db, guest, (q) => q("update public.experience_items set public = true returning id"))).toEqual([]);
    await expect(as(db, guest, (q) => q("insert into public.experience_items (title) values ('fake')"))).rejects.toThrow(/row-level security/);
    await as(db, owner, async (q) => {
      expect(await q("update public.experience_bullets set public = true where text = 'Hidden bullet' returning id")).toHaveLength(1);
      expect(await q("update public.experience_bullets set sort = 1 where text = 'Public bullet' returning id")).toHaveLength(1);
      expect(await q("delete from public.experience_items where id = $1 returning id", [HIDDEN_ROLE])).toHaveLength(1);
      expect(await q("select count(*)::int as n from public.experience_bullets where item_id = $1", [HIDDEN_ROLE])).toEqual([{ n: 0 }]); // cascade
    });
  });
});
