import { beforeAll, afterAll, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";
let db: PGlite;
const member = { id: "00000000-0000-4000-8000-0000000000e1", email: "member@example.com" };
const owner = { id: "00000000-0000-4000-8000-0000000000e2", email: "owner@example.com" };
beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings (key, value) values ('owner_email', $1)", [owner.email]);
  await addUser(db, member);
  await addUser(db, owner);
});
afterAll(async () => { await db.close(); });
it("anonymous callers cannot list desktop apps", async () => {
  await expect(as(db, { role: "anon" }, q => q("select id from public.desktop_apps order by sort, id"))).rejects.toThrow(/permission denied/);
});
it("members see signed-in apps; invitations grant and revoke Behavioral immediately", async () => {
  const ids = () => as(db, { role: "authenticated", sub: member.id }, q => q("select id from public.desktop_apps order by sort, id"));
  expect(await ids()).toEqual([{ id: "notes" }, { id: "practice" }]);
  await db.query("insert into public.invites (email) values ($1)", [member.email]);
  expect(await ids()).toEqual([{ id: "notes" }, { id: "practice" }, { id: "behavioral" }]);
  await db.query("delete from public.invites");
  expect(await ids()).toEqual([{ id: "notes" }, { id: "practice" }]);
});
it("the owner sees Settings and invite-only apps", async () => {
  expect(await as(db, { role: "authenticated", sub: owner.id }, q => q("select id from public.desktop_apps order by sort, id"))).toEqual([{ id: "notes" }, { id: "practice" }, { id: "behavioral" }, { id: "settings" }]);
});
it("visibility changes affect the launcher without a deployment", async () => {
  await as(db, { role: "authenticated", sub: member.id }, async q => {
    expect(await q("select id from public.desktop_apps where id = 'notes'")).toEqual([{ id: "notes" }]);
  });
  await as(db, { role: "authenticated", sub: owner.id }, async q => {
    await q("update public.apps set visibility = 'owner_only' where id = 'notes'");
    // Switch callers within this rollback-only transaction to check the changed row as a member.
    await q("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: member.id, role: "authenticated" })]);
    expect(await q("select id from public.desktop_apps where id = 'notes'")).toEqual([]);
  });
});
it("the launcher view cannot be used to edit registry rows, even by the owner", async () => {
  for (const sub of [member.id, owner.id]) {
    await expect(as(db, { role: "authenticated", sub }, q => q("update public.desktop_apps set name = 'Changed' where id = 'notes'"))).rejects.toThrow(/permission denied/);
    await expect(as(db, { role: "authenticated", sub }, q => q("delete from public.desktop_apps where id = 'notes'"))).rejects.toThrow(/permission denied/);
    await expect(as(db, { role: "authenticated", sub }, q => q("insert into public.desktop_apps (id, name, url) values ('new', 'New', '/new')"))).rejects.toThrow(/permission denied/);
  }
});
