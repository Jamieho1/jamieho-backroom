import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";

const OWNER = { id: "00000000-0000-4000-8000-0000000000d1", email: "owner@example.com" };
const MEMBER = { id: "00000000-0000-4000-8000-0000000000d2", email: "member@example.com" };
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
beforeEach(async () => {
  await db.query("delete from public.app_opens");
});

describe("app_opens", () => {
  it("a member records opening an app they can open, once per day", async () => {
    await as(db, member, async (q) => {
      await q("insert into public.app_opens (app_id) values ('notes')");
      await expect(q("insert into public.app_opens (app_id) values ('notes')")).rejects.toThrow(/duplicate key/);
    });
  });
  it("can't record apps they can't open, or for someone else, or backdated", async () => {
    await expect(as(db, member, (q) => q("insert into public.app_opens (app_id) values ('behavioral')"))).rejects.toThrow(/row-level security/);
    await expect(as(db, member, (q) => q("insert into public.app_opens (app_id) values ('settings')"))).rejects.toThrow(/row-level security/);
    await expect(as(db, member, (q) => q(`insert into public.app_opens (user_id, app_id) values ('${OWNER.id}', 'notes')`))).rejects.toThrow(/permission denied/);
    await expect(as(db, member, (q) => q("insert into public.app_opens (app_id, day) values ('notes', '2020-01-01')"))).rejects.toThrow(/permission denied/);
  });
  it("an invited member can record the invite-only app", async () => {
    await db.query("insert into public.invites (email) values ($1)", [MEMBER.email]);
    await as(db, { ...member, email: MEMBER.email }, (q) => q("insert into public.app_opens (app_id) values ('behavioral')"));
    await db.query("delete from public.invites");
  });
  it("visitors can't record anything", async () => {
    await expect(as(db, anon, (q) => q("insert into public.app_opens (app_id) values ('notes')"))).rejects.toThrow(/permission denied/);
  });
  it("only the owner reads them", async () => {
    await as(db, member, (q) => q("insert into public.app_opens (app_id) values ('notes')"));
    await db.query(`insert into public.app_opens (user_id, app_id) values ('${MEMBER.id}', 'practice')`);
    expect(await as(db, member, (q) => q("select * from public.app_opens"))).toEqual([]);
    expect(await as(db, owner, (q) => q("select app_id from public.app_opens"))).toEqual([{ app_id: "practice" }]);
    await expect(as(db, anon, (q) => q("select * from public.app_opens"))).rejects.toThrow(/permission denied/);
  });
});
