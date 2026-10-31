import { afterAll, beforeAll, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, addUser, as } from "./harness";
let db: PGlite;
const owner = { id: "00000000-0000-4000-8000-0000000000f1", email: "owner@example.com" };
const member = { id: "00000000-0000-4000-8000-0000000000f2", email: "member@example.com" };
const invited = { id: "00000000-0000-4000-8000-0000000000f3", email: "invited@example.com" };
const who = (sub: string) => ({ role: "authenticated" as const, sub });
beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings (key,value) values ('owner_email',$1)", [owner.email]);
  for (const u of [owner, member, invited]) await addUser(db, u);
  await db.query("insert into public.invites (email) values ($1)", [invited.email]);
  await db.query("insert into public.notes (id,title,body) values ('sample','Sample','### 1. A concept')");
});
afterAll(async () => { await db.close(); });
it("signed-in Notes readers see rows; anonymous visitors get none", async () => {
  expect(await as(db, who(member.id), q => q("select id from public.notes"))).toEqual([{ id: "sample" }]);
  expect(await as(db, { role: "anon" }, q => q("select id from public.notes"))).toEqual([]);
});
it("all visibility modes are enforced on the data, not just the launcher", async () => {
  for (const [visibility, anonCount, memberCount, invitedCount] of [
    ["public", 1, 1, 1], ["signed_in", 0, 1, 1], ["invite_only", 0, 0, 1], ["owner_only", 0, 0, 0],
  ] as const) {
    await db.query("update public.apps set visibility=$1 where id='notes'", [visibility]);
    expect((await as(db, { role: "anon" }, q => q("select id from public.notes"))).length).toBe(anonCount);
    expect((await as(db, who(member.id), q => q("select id from public.notes"))).length).toBe(memberCount);
    expect((await as(db, who(invited.id), q => q("select id from public.notes"))).length).toBe(invitedCount);
    expect((await as(db, who(owner.id), q => q("select id from public.notes"))).length).toBe(1);
  }
  await db.query("update public.apps set visibility='signed_in' where id='notes'");
});
it("only the owner inserts, updates and deletes notes", async () => {
  for (const sub of [member.id, invited.id]) {
    await expect(as(db, who(sub), q => q("insert into public.notes (id,title) values ('blocked','Blocked')"))).rejects.toThrow(/row-level security/);
    expect(await as(db, who(sub), q => q("update public.notes set body='Changed' where id='sample' returning id"))).toEqual([]);
    expect(await as(db, who(sub), q => q("delete from public.notes where id='sample' returning id"))).toEqual([]);
  }
  await expect(as(db, { role: "anon" }, q => q("insert into public.notes (id,title) values ('blocked','Blocked')"))).rejects.toThrow(/permission denied/);
  await as(db, who(owner.id), async q => {
    await q("insert into public.notes (id,title) values ('new','New')");
    expect(await q("update public.notes set body='Updated' where id='new' returning body")).toEqual([{ body: "Updated" }]);
    expect(await q("delete from public.notes where id='new' returning id")).toEqual([{ id: "new" }]);
  });
});
it("removing an invitation revokes reads immediately", async () => {
  await db.query("update public.apps set visibility='invite_only' where id='notes'");
  await db.query("delete from public.invites where email=$1", [invited.email]);
  expect(await as(db, who(invited.id), q => q("select id from public.notes"))).toEqual([]);
});
