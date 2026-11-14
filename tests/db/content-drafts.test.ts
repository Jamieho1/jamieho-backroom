import { beforeAll, afterAll, describe, it, expect } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, as, addUser } from "./harness";
import { SECTION_KEYS } from "@/lib/sections";
const ownerUser = { id: "00000000-0000-4000-8000-0000000000d1", email: "draft-owner@example.test" };
const memberUser = { id: "00000000-0000-4000-8000-0000000000d2", email: "draft-member@example.test" };
const owner = { role: "authenticated" as const, sub: ownerUser.id };
const member = { role: "authenticated" as const, sub: memberUser.id };
const anon = { role: "anon" as const };
const operation = (fields: unknown = { title: "Reviewed title" }, over: Record<string, unknown> = {}) => ({ op: "update", table: "site_sections", key: "hero", fields, ...over });
let db: PGlite;
let seeded: string;
beforeAll(async () => {
  db = await freshDb();
  await db.query("insert into private.settings(key,value) values ('owner_email',$1)", [ownerUser.email]);
  await addUser(db, ownerUser); await addUser(db, memberUser);
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({sub: ownerUser.id})]);
  seeded = (await db.query<{id:string}>("insert into public.content_changes(summary,operations) values ('Seeded draft',$1) returning id", [JSON.stringify([operation()])])).rows[0].id;
  await db.query("select set_config('request.jwt.claims','{}',false)");
}, 30000);
afterAll(async () => { await db?.close(); });

describe("content change access", () => {
  for (const [name, who] of [["anonymous", anon], ["non-owner", member]] as const) {
    it(`${name} cannot read drafts`, async () => {
      if (who.role === 'anon') await expect(as(db, who, q => q('select * from public.content_changes'))).rejects.toThrow(/permission denied/);
      else expect(await as(db, who, q => q('select * from public.content_changes'))).toEqual([]);
    });
    it(`${name} cannot insert drafts`, async () => {
      await expect(as(db, who, q => q("insert into public.content_changes(summary,operations) values ('Forbidden','[]')"))).rejects.toThrow(/permission denied|row-level security/);
    });
    for (const [label, sql] of [
      ['update',"update public.content_changes set summary='Forbidden' where id=$1 returning id"],
      ['approve',"update public.content_changes set status='approved' where id=$1 returning id"],
      ['discard',"update public.content_changes set status='discarded' where id=$1 returning id"],
      ['delete',"delete from public.content_changes where id=$1 returning id"],
    ]) it(`${name} cannot ${label} a draft`, async () => {
      if (who.role === 'anon') await expect(as(db, who, q => q(sql, [seeded]))).rejects.toThrow(/permission denied/);
      else expect(await as(db, who, q => q(sql, [seeded]))).toEqual([]);
    });
  }
  it("owner can select/insert/update/delete draft sets", async () => {
    await as(db, owner, async q => {
      expect(await q('select id from public.content_changes')).toHaveLength(1);
      const [set] = await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Owner draft',$1) returning id", [JSON.stringify([operation()])]);
      expect(await q("update public.content_changes set summary='Revised summary' where id=$1 returning id", [set.id])).toHaveLength(1);
      expect(await q('delete from public.content_changes where id=$1 returning id', [set.id])).toHaveLength(1);
    });
  });
  it("private approval function has no API execute grants, and is security definer with a fixed search path", async () => {
    const result = await db.query<{granted:boolean;prosecdef:boolean;proconfig:string[]}>(`select has_function_privilege('authenticated','private.apply_content_change()','EXECUTE') as granted, prosecdef,proconfig from pg_proc where oid='private.apply_content_change()'::regprocedure`);
    expect(result.rows[0].granted).toBe(false); expect(result.rows[0].prosecdef).toBe(true); expect(result.rows[0].proconfig).toEqual(['search_path=""']);
    await expect(as(db, owner, q => q('select private.apply_content_change()'))).rejects.toThrow(/permission denied/);
  });
});

describe("transactional approval", () => {
  it("updates all fields, records the previous values and real approver, and cannot approve twice", async () => {
    await as(db, owner, async q => {
      const [before] = await q('select key,title,body from public.site_sections where key=\'hero\'');
      const [set] = await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Update hero',$1) returning id", [JSON.stringify([operation({title:'Approved heading',body:'Approved body'})])]);
      const [saved] = await q<{status:string;previous:unknown;approved_at:string;approved_by:string}>("update public.content_changes set status='approved' where id=$1 returning *",[set.id]);
      expect(saved.status).toBe('approved'); expect(saved.approved_by).toBe(ownerUser.id); expect(saved.approved_at).toBeTruthy();
      expect(saved.previous).toEqual([{table:'site_sections',key:'hero',values:before}]);
      expect(await q("select title,body from public.site_sections where key='hero'")).toEqual([{title:'Approved heading',body:'Approved body'}]);
      await expect(q("update public.content_changes set status='approved' where id=$1",[set.id])).rejects.toThrow(/already been reviewed/);
    });
  });
  it("discard changes only status and leaves live content and audit fields unchanged", async () => {
    await as(db, owner, async q => {
      const before = await q('select * from public.site_sections order by key');
      const [set] = await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Discard me',$1) returning id", [JSON.stringify([operation()])]);
      const [saved] = await q<{status:string;previous:unknown;approved_at:unknown;approved_by:unknown;operations:unknown}>("update public.content_changes set status='discarded' where id=$1 returning *", [set.id]);
      expect(saved).toMatchObject({status:'discarded',previous:null,approved_at:null,approved_by:null,operations:[operation()]});
      expect(await q('select * from public.site_sections order by key')).toEqual(before);
    });
  });
  const invalid = [
    ['unknown table',operation({}, {table:'profiles'}),/Unknown table/],
    ['unknown field',operation({role:'owner'}),/Unknown editable field/],
    ['over-length title',operation({title:'x'.repeat(121)}),/too long/],
    ['over-length body',operation({body:'x'.repeat(20001)}),/too long/],
    ['wrong value type',operation({title:42}),/must be text/],
    ['null field',operation({body:null}),/must be text/],
    ['empty fields',operation({}),/at least one/],
    ['unknown section',operation({title:'X'},{key:'profiles'}),/Unknown section/],
    ['unknown property',operation({title:'X'},{sql:'drop table'}),/Unknown table or operation property/],
    ['insert',operation({title:'X'},{op:'insert'}),/Only update/],
    ['delete',operation({},{op:'delete'}),/Only update/],
    ['missing fields',{op:'update',table:'site_sections',key:'hero'},/must be an object/],
  ] as const;
  for (const [name, invalidOperation, message] of invalid) it(`${name}: refuses the set and rolls back its earlier operation`, async () => {
    await as(db, owner, async q => {
      const before = await q("select title,body,updated_at from public.site_sections where key='hero'");
      const [set] = await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Atomic invalid set',$1) returning id", [JSON.stringify([operation({title:'Must roll back'}),invalidOperation])]);
      await q('savepoint approval');
      await expect(q("update public.content_changes set status='approved' where id=$1", [set.id])).rejects.toThrow(message);
      await q('rollback to savepoint approval');
      expect(await q("select title,body,updated_at from public.site_sections where key='hero'")).toEqual(before);
      expect(await q('select status,previous,approved_at,approved_by from public.content_changes where id=$1',[set.id])).toEqual([{status:'draft',previous:null,approved_at:null,approved_by:null}]);
    });
  });
  it("locks down approval metadata on insertion and prevents swapping payload during approval", async () => {
    await expect(as(db, owner, q => q("insert into public.content_changes(summary,status,operations) values ('Fake history','approved','[]')"))).rejects.toThrow(/must be drafts/);
    await expect(as(db, owner, q => q("update public.content_changes set status='approved', operations='[]' where id=$1",[seeded]))).rejects.toThrow(/Save draft edits/);
    await expect(as(db, owner, q => q("update public.content_changes set approved_by=$1 where id=$2",[memberUser.id,seeded]))).rejects.toThrow(/metadata/);
  });
  it("rejects unsupported photo slots and empty operation sets", async () => {
    await expect(as(db, owner, async q => { await q("update public.content_changes set photo_slots='[{}]' where id=$1",[seeded]); await q("update public.content_changes set status='approved' where id=$1",[seeded]); })).rejects.toThrow(/Photo slots/);
    await expect(as(db, owner, async q => { await q("update public.content_changes set operations='[]' where id=$1",[seeded]); await q("update public.content_changes set status='approved' where id=$1",[seeded]); })).rejects.toThrow(/between 1 and 100/);
  });
  it("preserves intermediate previous values for repeated edits to the same section", async () => {
    await as(db, owner, async q => {
      const [set] = await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Two edits',$1) returning id",[JSON.stringify([operation({title:'First'}),operation({title:'Second'})])]);
      const [saved] = await q<{previous:{values:{title:string}}[]}>("update public.content_changes set status='approved' where id=$1 returning previous",[set.id]);
      expect(saved.previous[1].values.title).toBe('First');
      expect(await q("select title from public.site_sections where key='hero'")).toEqual([{title:'Second'}]);
    });
  });
});


it("the SQL owner guard refuses administrative approval without a signed-in owner", async () => {
  await expect(db.query("update public.content_changes set status='approved' where id=$1",[seeded])).rejects.toThrow(/Only the owner/);
  expect((await db.query<{status:string}>("select status from public.content_changes where id=$1",[seeded])).rows[0].status).toBe('draft');
});
it("an absent second target rolls the first update back, including its timestamp", async () => {
  const removed=(await db.query("delete from public.site_sections where key='about' returning *")).rows[0];
  try {
    await as(db, owner, async q => {
      const before=await q("select title,updated_at from public.site_sections where key='hero'");
      const [set]=await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Missing target',$1) returning id",[JSON.stringify([operation({title:'Rollback'}),operation({title:'Missing'},{key:'about'})])]);
      await q('savepoint missing_target');
      await expect(q("update public.content_changes set status='approved' where id=$1",[set.id])).rejects.toThrow(/no longer exists/);
      await q('rollback to savepoint missing_target');
      expect(await q("select title,updated_at from public.site_sections where key='hero'")).toEqual(before);
      expect(await q('select status,previous from public.content_changes where id=$1',[set.id])).toEqual([{status:'draft',previous:null}]);
    });
  } finally { await db.query('insert into public.site_sections(key,title,body,sort,updated_at) values ($1,$2,$3,$4,$5)',[removed.key,removed.title,removed.body,removed.sort,removed.updated_at]); }
});
it("SQL and TypeScript accept the same section keys and Unicode field boundary", async () => {
  await as(db, owner, async q => {
    const operations=SECTION_KEYS.map(key=>operation({title:'😀'.repeat(120)},{key}));
    const [set]=await q<{id:string}>("insert into public.content_changes(summary,operations) values ('All keys',$1) returning id",[JSON.stringify(operations)]);
    expect(await q("update public.content_changes set status='approved' where id=$1 returning status",[set.id])).toEqual([{status:'approved'}]);
  });
});
