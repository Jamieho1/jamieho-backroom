import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
let db:PGlite;
const owner={id:'00000000-0000-4000-8000-000000000081',email:'owner@example.com'},member={id:'00000000-0000-4000-8000-000000000082',email:'member@example.com'};
const who=(id:string)=>({role:'authenticated' as const,sub:id});
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[owner.email]);for(const u of [owner,member])await addUser(db,u);await db.query("insert into public.articles(slug,title,published) values ('published-example','Published example',true),('draft-example','Draft example',false)");});
afterAll(async()=>{await db.close();});
it('anonymous and signed-in visitors read published articles only, including direct slug reads',async()=>{
 for(const role of [{role:'anon' as const},who(member.id)])await as(db,role,async q=>{expect(await q('select slug from public.articles')).toEqual([{slug:'published-example'}]);expect(await q("select body from public.articles where slug='draft-example'")).toEqual([]);});
});
it('articles use app-access reads even for published rows',async()=>{
 await db.query("update public.apps set locked=false where id='articles'");await db.query("update public.apps set visibility='owner_only' where id='articles'");expect(await as(db,{role:'anon'},q=>q('select slug from public.articles'))).toEqual([]);await db.query("update public.apps set visibility='public',locked=true where id='articles'");
});
it('only the owner can create/update/publish/unpublish/delete; drafts start private',async()=>{
 await as(db,who(owner.id),async q=>{
  expect(await q('select slug from public.articles order by slug')).toEqual([{slug:'draft-example'},{slug:'published-example'}]);
  expect(await q("insert into public.articles(slug,title) values ('new-example','New example') returning published")).toEqual([{published:false}]);
  expect(await q("update public.articles set published=true,body='Reference text' where slug='new-example' returning published")).toEqual([{published:true}]);
  expect(await q("update public.articles set published=false where slug='new-example' returning published")).toEqual([{published:false}]);expect(await q("delete from public.articles where slug='new-example' returning slug")).toHaveLength(1);
 });
 await expect(as(db,who(member.id),q=>q("insert into public.articles(slug,title) values ('fake','Fake')"))).rejects.toThrow(/row-level security/);
 expect(await as(db,who(member.id),q=>q("update public.articles set published=true returning id"))).toEqual([]);expect(await as(db,who(member.id),q=>q('delete from public.articles returning id'))).toEqual([]);
 await expect(as(db,{role:'anon'},q=>q("insert into public.articles(slug,title) values ('fake','Fake')"))).rejects.toThrow(/permission denied/);
});
it('duplicate/reserved slugs, unsafe source links and invalid platform are rejected',async()=>{
 for(const sql of ["insert into public.articles(slug,title) values ('draft-example','Duplicate')","insert into public.articles(slug,title) values ('manage','Reserved')","insert into public.articles(slug,title,source_url) values ('unsafe','Unsafe','javascript:alert(1)')","insert into public.articles(slug,title,platform) values ('invalid','Invalid','unknown')"])await expect(as(db,who(owner.id),q=>q(sql))).rejects.toThrow();
});
it('registry keeps public Articles visible and prevents owner changing its system visibility',async()=>{
 expect(await as(db,{role:'anon'},q=>q("select visibility,locked from public.apps where id='articles'"))).toEqual([{visibility:'public',locked:true}]);await expect(as(db,who(owner.id),q=>q("update public.apps set visibility='owner_only' where id='articles'"))).rejects.toThrow(/fixed/);
});
