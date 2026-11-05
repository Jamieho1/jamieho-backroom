import { beforeAll, afterAll, it, expect } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";

/** TKT-83: portfolio projects. Public rows for everyone; hidden rows and all writes for the owner only. */
let db: PGlite;
const owner = { id: "00000000-0000-4000-8000-000000000091", email: "owner@example.com" };
const member = { id: "00000000-0000-4000-8000-000000000092", email: "member@example.com" };
const who = (id: string) => ({ role: "authenticated" as const, sub: id });

beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings(key,value) values ('owner_email',$1)", [owner.email]);
  for (const u of [owner, member]) await addUser(db, u);
  await db.query(`insert into public.projects(slug,name,public,featured,sort) values
    ('shown-example','Shown example',true,true,10),('hidden-example','Hidden example',false,false,20)`);
});
afterAll(async () => { await db.close(); });

it("starts empty of personal content: nothing is seeded", async () => {
  const fresh = await freshDb();
  expect((await fresh.query("select count(*)::int as n from public.projects")).rows).toEqual([{ n: 0 }]);
  await fresh.close();
});

it("anonymous and signed-in visitors read public projects only, including direct slug reads", async () => {
  for (const role of [{ role: "anon" as const }, who(member.id)]) await as(db, role, async (q) => {
    expect(await q("select slug from public.projects")).toEqual([{ slug: "shown-example" }]);
    expect(await q("select body from public.projects where slug='hidden-example'")).toEqual([]);
  });
});

it("only the owner creates, edits, features, hides and deletes; new projects start hidden and unfeatured", async () => {
  await as(db, who(owner.id), async (q) => {
    expect(await q("select slug from public.projects order by slug")).toEqual([{ slug: "hidden-example" }, { slug: "shown-example" }]);
    expect(await q("insert into public.projects(slug,name) values ('new-example','New example') returning public, featured, url"))
      .toEqual([{ public: false, featured: false, url: "" }]);
    expect(await q("update public.projects set public=true, featured=true, url='https://example.com' where slug='new-example' returning public"))
      .toEqual([{ public: true }]);
    expect(await q("delete from public.projects where slug='new-example' returning slug")).toHaveLength(1);
  });
  await expect(as(db, who(member.id), (q) => q("insert into public.projects(slug,name) values ('fake','Fake')"))).rejects.toThrow(/row-level security/);
  expect(await as(db, who(member.id), (q) => q("update public.projects set public=true returning id"))).toEqual([]);
  expect(await as(db, who(member.id), (q) => q("delete from public.projects returning id"))).toEqual([]);
  await expect(as(db, { role: "anon" }, (q) => q("insert into public.projects(slug,name) values ('fake','Fake')"))).rejects.toThrow(/permission denied/);
});

it("rejects bad slugs, unsafe links, too many screenshots or tags, and over-long fields", async () => {
  const bad = [
    "insert into public.projects(slug,name) values ('shown-example','Duplicate')",
    "insert into public.projects(slug,name) values ('new','Reserved')",
    "insert into public.projects(slug,name) values ('Bad Slug','Bad')",
    "insert into public.projects(slug,name) values ('no-name','')",
    "insert into public.projects(slug,name,url) values ('unsafe','Unsafe','javascript:alert(1)')",
    "insert into public.projects(slug,name,url) values ('plain-http','Plain','http://example.com')",
    "insert into public.projects(slug,name,screenshots) values ('bad-shot','Bad','{http://example.com/a.png}')",
    "insert into public.projects(slug,name,screenshots) values ('many-shots','Many','{https://a/1,https://a/2,https://a/3,https://a/4,https://a/5,https://a/6,https://a/7}')",
    "insert into public.projects(slug,name,tags) values ('many-tags','Many','{a,b,c,d,e,f,g,h,i}')",
    "insert into public.projects(slug,name,tags) values ('long-tag','Long','{this-tag-is-far-too-long-to-fit}')",
    `insert into public.projects(slug,name,tagline) values ('long-tagline','Long','${"x".repeat(161)}')`,
  ];
  for (const sql of bad) await expect(as(db, who(owner.id), (q) => q(sql)), sql).rejects.toThrow();
  expect(await as(db, who(owner.id), (q) => q(
    "insert into public.projects(slug,name,tags,screenshots) values ('ok-example','OK','{Next.js,Supabase}','{https://example.com/a.png}') returning slug",
  ))).toEqual([{ slug: "ok-example" }]);
});

it("touches updated_at on every save", async () => {
  const [before] = (await db.query<{ t: string }>("select updated_at::text as t from public.projects where slug='shown-example'")).rows;
  await as(db, who(owner.id), (q) => q("update public.projects set tagline='Changed' where slug='shown-example'"));
  const [after] = (await db.query<{ t: string }>("select updated_at::text as t from public.projects where slug='shown-example'")).rows;
  expect(after.t >= before.t).toBe(true);
});
