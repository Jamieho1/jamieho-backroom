import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
let db:PGlite;
const owner={id:'00000000-0000-4000-8000-000000000091',email:'owner@example.com'},member={id:'00000000-0000-4000-8000-000000000092',email:'member@example.com'};
const who=(id:string)=>({role:'authenticated' as const,sub:id});
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[owner.email]);for(const u of [owner,member])await addUser(db,u);await db.query("insert into public.guides(slug,title,published) values ('published-guide','Published guide',true),('draft-guide','Draft guide',false)");});
afterAll(async()=>{await db.close();});
it('everyone reads published guides only, including direct slug reads, with no sign-in or app gate',async()=>{
 for(const role of [{role:'anon' as const},who(member.id)])await as(db,role,async q=>{expect(await q('select slug from public.guides')).toEqual([{slug:'published-guide'}]);expect(await q("select body from public.guides where slug='draft-guide'")).toEqual([]);});
});
it('the owner reads drafts and manages guides; members and visitors cannot write',async()=>{
 await as(db,who(owner.id),async q=>{
  expect(await q('select slug from public.guides order by slug')).toEqual([{slug:'draft-guide'},{slug:'published-guide'}]);
  expect(await q("insert into public.guides(slug,title,notion_url) values ('new-guide','New guide','https://example.com/toolkit') returning published")).toEqual([{published:false}]);
  expect(await q("update public.guides set published=true where slug='new-guide' returning published")).toEqual([{published:true}]);
  expect(await q("delete from public.guides where slug='new-guide' returning slug")).toHaveLength(1);
 });
 await expect(as(db,who(member.id),q=>q("insert into public.guides(slug,title) values ('fake','Fake')"))).rejects.toThrow(/row-level security/);
 expect(await as(db,who(member.id),q=>q("update public.guides set published=true returning id"))).toEqual([]);
 expect(await as(db,who(member.id),q=>q('delete from public.guides returning id'))).toEqual([]);
 await expect(as(db,{role:'anon'},q=>q("insert into public.guides(slug,title) values ('fake','Fake')"))).rejects.toThrow(/permission denied/);
});
it('rejects duplicate or reserved slugs and non-HTTPS links',async()=>{
 for(const sql of ["insert into public.guides(slug,title) values ('draft-guide','Duplicate')","insert into public.guides(slug,title) values ('manage','Reserved')","insert into public.guides(slug,title,notion_url) values ('unsafe','Unsafe','javascript:alert(1)')","insert into public.guides(slug,title,doc_url) values ('bad-doc','Bad','http://example.com/doc')","insert into public.guides(slug,title,cover_url) values ('bad-cover','Bad','http://example.com/a.png')"])await expect(as(db,who(owner.id),q=>q(sql))).rejects.toThrow();
});
