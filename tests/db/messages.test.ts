import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";

const OWNER = { id: "00000000-0000-4000-8000-0000000000c1", email: "owner@example.com" };
const MEMBER = { id: "00000000-0000-4000-8000-0000000000c2", email: "member@example.com" };
const owner = { role: "authenticated" as const, sub: OWNER.id };
const member = { role: "authenticated" as const, sub: MEMBER.id };
const anon = { role: "anon" as const };
const H = (c: string) => c.repeat(64);
const send = (ip: string | null = H("a")) =>
  `insert into public.messages (name, email, need, budget, ip_hash) values ('Ann', 'ann@example.com', 'A website', '£1k', ${ip ? `'${ip}'` : "null"})`;

let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings (key, value) values ('owner_email', $1)", [OWNER.email]);
  await addUser(db, OWNER);
  await addUser(db, MEMBER);
});
beforeEach(async () => {
  await db.query("delete from public.messages");
});

describe("messages", () => {
  it("anyone can send one, but can't read any back", async () => {
    await as(db, anon, async (q) => {
      await q(send());
      await expect(q("select * from public.messages")).rejects.toThrow(/permission denied/);
    });
  });
  it("members can send, and see none (not even their own)", async () => {
    await as(db, member, async (q) => {
      await q(send());
      expect(await q("select * from public.messages")).toEqual([]);
      expect(await q("update public.messages set read = true returning id")).toEqual([]);
      expect(await q("delete from public.messages returning id")).toEqual([]);
    });
  });
  it("only the owner reads, marks read and deletes", async () => {
    await db.query(send());
    await as(db, owner, async (q) => {
      const rows = await q<{ id: string; read: boolean }>("select id, read from public.messages");
      expect(rows).toHaveLength(1);
      expect(await q("update public.messages set read = true returning read")).toEqual([{ read: true }]);
      expect(await q("delete from public.messages returning id")).toHaveLength(1);
    });
    await expect(as(db, owner, (q) => q("update public.messages set need = 'x'"))).rejects.toThrow(/permission denied/);
  });
  it("senders can't pre-mark a message read or backdate it", async () => {
    await expect(as(db, anon, (q) => q("insert into public.messages (name, email, need, read) values ('a', 'a@b.co', 'x', true)"))).rejects.toThrow(/permission denied/);
    await expect(as(db, anon, (q) => q("insert into public.messages (name, email, need, created_at) values ('a', 'a@b.co', 'x', now() - interval '1 day')"))).rejects.toThrow(/permission denied/);
  });
  it("rejects bad or over-long fields", async () => {
    await expect(as(db, anon, (q) => q("insert into public.messages (name, email, need) values ('a', 'not-an-email', 'x')"))).rejects.toThrow(/check/);
    await expect(as(db, anon, (q) => q(`insert into public.messages (name, email, need) values ('a', 'a@b.co', '${"x".repeat(4001)}')`))).rejects.toThrow(/check/);
    await expect(as(db, anon, (q) => q("insert into public.messages (name, email, need) values (' ', 'a@b.co', 'x')"))).rejects.toThrow(/check/);
  });
  it("allows 5 messages an hour per sender, then refuses", async () => {
    for (let i = 0; i < 5; i++) await db.query(send(H("b")));
    await expect(as(db, anon, (q) => q(send(H("b"))))).rejects.toThrow(/rate_limited/);
    await as(db, anon, (q) => q(send(H("c")))); // someone else is fine
  });
  it("caps everyone at 30 an hour, even direct API calls without a sender hash", async () => {
    await db.query(`insert into public.messages (name, email, need) select 'n', 'n@x.co', 'x' from generate_series(1, 30)`);
    await expect(as(db, anon, (q) => q(send(null)))).rejects.toThrow(/busy/);
  });
  it("forgets sender hashes after an hour", async () => {
    await db.query(send(H("d")));
    await db.query("alter table public.messages disable trigger messages_guard");
    await db.query("update public.messages set created_at = now() - interval '2 hours'");
    await db.query("alter table public.messages enable trigger messages_guard");
    await db.query(send(H("e")));
    const r = await db.query<{ ip_hash: string | null }>("select ip_hash from public.messages order by created_at");
    expect(r.rows.map((x) => x.ip_hash)).toEqual([null, H("e")]);
  });
});
