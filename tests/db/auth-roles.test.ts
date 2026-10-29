import { describe, it, expect, beforeAll } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";

const OWNER = { id: "00000000-0000-4000-8000-000000000001", email: "owner@example.com" };
const MEMBER = { id: "00000000-0000-4000-8000-000000000002", email: "visitor@example.com" };
const UNCONFIRMED = { id: "00000000-0000-4000-8000-000000000003", email: "OWNER@example.com" };

let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
  // The real owner email is seeded the same way in Supabase, outside git.
  await db.query("insert into private.settings (key, value) values ('owner_email', $1)", [OWNER.email]);
  await addUser(db, OWNER);
  await addUser(db, MEMBER);
  await addUser(db, { ...UNCONFIRMED, confirmed: false });
});

const owner = { role: "authenticated" as const, sub: OWNER.id, email: OWNER.email };
const member = { role: "authenticated" as const, sub: MEMBER.id, email: MEMBER.email };
const anon = { role: "anon" as const };

describe("roles are decided by the database", () => {
  it("gives the owner role only to the configured, confirmed email", async () => {
    const rows = await db.query<{ email: string; role: string }>("select email, role from public.profiles order by email");
    expect(rows.rows).toEqual([
      { email: "OWNER@example.com", role: "member" }, // same address, but not confirmed by the provider
      { email: "owner@example.com", role: "owner" },
      { email: "visitor@example.com", role: "member" },
    ]);
  });

  it("a member cannot promote themselves", async () => {
    await expect(as(db, member, (q) => q("update public.profiles set role = 'owner' where id = $1", [MEMBER.id]))).rejects.toThrow(/permission denied/);
    const r = await db.query<{ role: string }>("select role from public.profiles where id = $1", [MEMBER.id]);
    expect(r.rows[0].role).toBe("member");
  });

  it("nobody can insert or delete profiles from the API", async () => {
    await expect(as(db, member, (q) => q("insert into public.profiles (id, email) values ($1, 'x@y.z')", [UNCONFIRMED.id]))).rejects.toThrow(/permission denied/);
    await expect(as(db, owner, (q) => q("delete from public.profiles where id = $1", [MEMBER.id]))).rejects.toThrow(/permission denied/);
  });

  it("private.settings is unreachable from the API", async () => {
    await expect(as(db, owner, (q) => q("select * from private.settings"))).rejects.toThrow(/permission denied/);
    await expect(as(db, anon, (q) => q("select * from private.settings"))).rejects.toThrow(/permission denied/);
  });
});

describe("Supabase's real OAuth order: insert first, confirm the email afterwards", () => {
  it("the owner becomes owner once Google's confirmation lands", async () => {
    const id = "00000000-0000-4000-8000-000000000009";
    await db.query("update private.settings set value = 'late@example.com' where key = 'owner_email'");
    await addUser(db, { id, email: "late@example.com", confirmed: false });
    expect((await db.query<{ role: string }>("select role from public.profiles where id = $1", [id])).rows[0].role).toBe("member");
    await db.query("update auth.users set email_confirmed_at = now() where id = $1", [id]);
    expect((await db.query<{ role: string }>("select role from public.profiles where id = $1", [id])).rows[0].role).toBe("owner");
    // changing the email away from the owner address takes the role away again
    await db.query("update auth.users set email = 'other@example.com' where id = $1", [id]);
    expect((await db.query<{ role: string }>("select role from public.profiles where id = $1", [id])).rows[0].role).toBe("member");
    await db.query("delete from auth.users where id = $1", [id]);
    await db.query("update private.settings set value = $1 where key = 'owner_email'", [OWNER.email]);
  });
  it("a confirmed non-owner stays a member", async () => {
    await db.query("update auth.users set email_confirmed_at = now() where id = $1", [MEMBER.id]);
    expect((await db.query<{ role: string }>("select role from public.profiles where id = $1", [MEMBER.id])).rows[0].role).toBe("member");
  });
});

describe("profiles visibility", () => {
  it("anonymous visitors see no profiles", async () => {
    expect(await as(db, anon, (q) => q("select id from public.profiles"))).toEqual([]);
  });
  it("a member sees only their own profile", async () => {
    const rows = await as(db, member, (q) => q<{ id: string }>("select id from public.profiles"));
    expect(rows.map((r) => r.id)).toEqual([MEMBER.id]);
  });
  it("the owner sees everyone", async () => {
    expect(await as(db, owner, (q) => q("select id from public.profiles"))).toHaveLength(3);
  });
});

describe("sign-in log", () => {
  it("record_signin logs the caller and updates last_seen_at", async () => {
    await as(db, member, async (q) => {
      await q("select public.record_signin()");
      const mine = await q<{ n: number }>("select count(*)::int as n from public.signins");
      expect(mine[0].n).toBe(0); // a member can't even read their own sign-in rows
      const me = await q<{ last_seen_at: string | null }>("select last_seen_at from public.profiles where id = $1", [MEMBER.id]);
      expect(me[0].last_seen_at).not.toBeNull();
    });
  });
  it("only the owner reads the sign-in list", async () => {
    await as(db, owner, async (q) => {
      await q("select public.record_signin()");
      const rows = await q<{ user_id: string }>("select user_id from public.signins");
      expect(rows.map((r) => r.user_id)).toEqual([OWNER.id]);
    });
  });
  it("anonymous callers can't record a sign-in", async () => {
    await expect(as(db, anon, (q) => q("select public.record_signin()"))).rejects.toThrow(/permission denied/);
  });
  it("nobody writes signins directly", async () => {
    await expect(as(db, owner, (q) => q("insert into public.signins (user_id) values ($1)", [OWNER.id]))).rejects.toThrow(/permission denied/);
  });
});

describe("guard rails for every future table", () => {
  it("every table in public has RLS enabled", async () => {
    const r = await db.query<{ relname: string }>(
      "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity",
    );
    expect(r.rows).toEqual([]);
  });
});
