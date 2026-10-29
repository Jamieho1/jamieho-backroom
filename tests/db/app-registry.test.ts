import { describe, it, expect, beforeAll } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";

const OWNER = { id: "00000000-0000-4000-8000-0000000000a1", email: "owner@example.com" };
const MEMBER = { id: "00000000-0000-4000-8000-0000000000a2", email: "visitor@example.com" };
const GUEST = { id: "00000000-0000-4000-8000-0000000000a3", email: "Recruiter@Example.com" };
const owner = { role: "authenticated" as const, sub: OWNER.id, email: OWNER.email };
const member = { role: "authenticated" as const, sub: MEMBER.id, email: MEMBER.email };
const guest = { role: "authenticated" as const, sub: GUEST.id, email: GUEST.email };
const anon = { role: "anon" as const };

let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings (key, value) values ('owner_email', $1)", [OWNER.email]);
  for (const u of [OWNER, MEMBER, GUEST]) await addUser(db, u);
  await db.query("insert into public.invites (email) values ('recruiter@example.com')");
  // A stand-in for an app's private data (e.g. Behavioral stories), guarded the way every real data table will be.
  await db.exec(`
    create table public.demo_stories (id int primary key, app text not null, title text not null);
    alter table public.demo_stories enable row level security;
    create policy "follow app visibility" on public.demo_stories for select to anon, authenticated using (rls.can_view_app(app));
    insert into public.demo_stories values (1, 'behavioral', 'Poison-pill incident'), (2, 'notes', 'Two pointers'), (3, 'practice', 'Arena');
  `);
});

describe("seed rows", () => {
  it("registers Notes, Practice, Behavioral (Invite-only) and a locked owner-only Settings", async () => {
    const r = await db.query<{ id: string; visibility: string; locked: boolean }>("select id, visibility, locked from public.apps order by sort");
    expect(r.rows).toEqual([
      { id: "notes", visibility: "signed_in", locked: false },
      { id: "practice", visibility: "signed_in", locked: false },
      { id: "behavioral", visibility: "invite_only", locked: false },
      { id: "settings", visibility: "owner_only", locked: true },
    ]);
  });
});

describe("the registry", () => {
  it("anyone, even anonymous, can read it (the Projects page shows every card)", async () => {
    expect(await as(db, anon, (q) => q("select id from public.apps"))).toHaveLength(4);
  });
  it("only the owner changes it", async () => {
    await expect(as(db, anon, (q) => q("update public.apps set visibility = 'public' where id = 'behavioral'"))).rejects.toThrow(/permission denied/);
    const changed = await as(db, member, (q) => q("update public.apps set visibility = 'public' where id = 'behavioral' returning id"));
    expect(changed).toEqual([]);
    await expect(as(db, member, (q) => q("insert into public.apps (id, name, url) values ('x', 'X', '/x')"))).rejects.toThrow(/row-level security/);
    const ok = await as(db, owner, (q) => q<{ visibility: string }>("update public.apps set visibility = 'public' where id = 'notes' returning visibility"));
    expect(ok).toEqual([{ visibility: "public" }]);
  });
  it("Settings' visibility is fixed, even for the owner, and it can't be deleted", async () => {
    await expect(as(db, owner, (q) => q("update public.apps set visibility = 'public' where id = 'settings'"))).rejects.toThrow(/fixed/);
    expect(await as(db, owner, (q) => q("delete from public.apps where id = 'settings' returning id"))).toEqual([]);
  });
});

describe("invites", () => {
  it("only the owner can see or change the invite list", async () => {
    await expect(as(db, anon, (q) => q("select * from public.invites"))).rejects.toThrow(/permission denied/);
    expect(await as(db, member, (q) => q("select * from public.invites"))).toEqual([]);
    expect(await as(db, guest, (q) => q("select * from public.invites"))).toEqual([]);
    await expect(as(db, member, (q) => q("insert into public.invites (email) values ('me@example.com')"))).rejects.toThrow(/row-level security/);
    await as(db, owner, async (q) => {
      await q("insert into public.invites (email) values ('new@example.com')");
      expect(await q("select email from public.invites order by email")).toHaveLength(2);
    });
  });
  it("emails are stored lower-case and must look like emails", async () => {
    await expect(as(db, owner, (q) => q("insert into public.invites (email) values ('Mixed@Example.com')"))).rejects.toThrow(/check/);
    await expect(as(db, owner, (q) => q("insert into public.invites (email) values ('not-an-email')"))).rejects.toThrow(/check/);
  });
});

describe("app data follows the app's visibility", () => {
  const titles = (rows: { title: string }[]) => rows.map((r) => r.title).sort();
  const read = (who: Parameters<typeof as>[1]) => as(db, who, (q) => q<{ title: string }>("select title from public.demo_stories"));

  it("an uninvited signed-in user gets zero rows from an Invite-only app", async () => {
    expect(titles(await read(member))).toEqual(["Arena", "Two pointers"]);
  });
  it("an invited email (any letter case) gets them", async () => {
    expect(titles(await read(guest))).toEqual(["Arena", "Poison-pill incident", "Two pointers"]);
  });
  it("anonymous visitors only see Public apps' data", async () => {
    expect(await read(anon)).toEqual([]);
    await db.query("update public.apps set visibility = 'public' where id = 'notes'");
    expect(titles(await read(anon))).toEqual(["Two pointers"]);
    await db.query("update public.apps set visibility = 'signed_in' where id = 'notes'");
  });
  it("the owner sees everything", async () => {
    expect(await read(owner)).toHaveLength(3);
  });
  it("changing visibility takes effect immediately, no deploy", async () => {
    await db.query("update public.apps set visibility = 'signed_in' where id = 'behavioral'");
    expect(titles(await read(member))).toContain("Poison-pill incident");
    await db.query("update public.apps set visibility = 'invite_only' where id = 'behavioral'");
    expect(titles(await read(member))).not.toContain("Poison-pill incident");
  });
  it("an unknown app id shows nothing to non-owners", async () => {
    expect(await as(db, member, (q) => q<{ v: boolean }>("select rls.can_view_app('nope') as v"))).toEqual([{ v: false }]);
  });
});

describe("nothing but record_signin is callable through the API", () => {
  it("the only function in public that API roles can execute is record_signin", async () => {
    const r = await db.query<{ proname: string }>(`
      select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))
      order by 1`);
    expect(r.rows.map((x) => x.proname)).toEqual(["record_signin"]);
  });
});

describe("ops (TKT-59)", () => {
  it("ops_usage is callable by the service role only", async () => {
    const r = await db.query<{ a: boolean; u: boolean; s: boolean }>(`select has_function_privilege('anon', 'public.ops_usage()', 'execute') a,
      has_function_privilege('authenticated', 'public.ops_usage()', 'execute') u, has_function_privilege('service_role', 'public.ops_usage()', 'execute') s`);
    expect(r.rows[0]).toEqual({ a: false, u: false, s: true });
  });
  it("ops_usage reports size and message counts", async () => {
    await db.exec("begin; set local role service_role;");
    try {
      const r = await db.query<{ u: Record<string, number> }>("select public.ops_usage() u");
      expect(Object.keys(r.rows[0].u).sort()).toEqual(["db_bytes", "messages", "messages_month", "messages_today", "users"]);
    } finally {
      await db.exec("rollback");
    }
  });
  it("ops_status: only the owner reads it; nobody but the service role writes it", async () => {
    await db.query("insert into public.ops_status (job, ok) values ('ping', true)");
    expect(await as(db, anon, (q) => q("select 1 from public.ops_status").catch(() => "denied"))).toBe("denied");
    expect(await as(db, member, (q) => q("select job from public.ops_status"))).toEqual([]);
    expect(await as(db, owner, (q) => q("select job from public.ops_status"))).toEqual([{ job: "ping" }]);
    await expect(as(db, owner, (q) => q("insert into public.ops_status (job, ok) values ('export', true)"))).rejects.toThrow(/permission denied/);
    await db.query("delete from public.ops_status");
  });
});
