import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
let db:PGlite;
const a='00000000-0000-4000-8000-000000000091',b='00000000-0000-4000-8000-000000000092',owner='00000000-0000-4000-8000-000000000093';
let post:string,draft:string;
const who=(id:string)=>({role:'authenticated' as const,sub:id});
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email','pin-owner@example.com')");for(const [id,email] of [[a,'a@example.com'],[b,'b@example.com'],[owner,'pin-owner@example.com']])await addUser(db,{id,email});
 post=(await db.query<{id:string}>("insert into public.articles(slug,title,published) values ('pin-public','Public',true) returning id")).rows[0].id;
 draft=(await db.query<{id:string}>("insert into public.articles(slug,title,published) values ('pin-draft','Draft',false) returning id")).rows[0].id;
 await db.query('insert into public.article_pins(user_id,article_id) values ($1,$3),($2,$3)',[a,b,post]);});
afterAll(async()=>{await db.close();});
it('anonymous callers cannot read or write personal pins',async()=>{
 for(const sql of ['select * from public.article_pins',`insert into public.article_pins(user_id,article_id) values ('${a}','${post}')`,`delete from public.article_pins`])await expect(as(db,{role:'anon'},q=>q(sql))).rejects.toThrow(/permission denied/);
});
it('each reader sees only their own rows, including when the site owner reads',async()=>{
 for(const user of [a,b])expect(await as(db,who(user),q=>q('select user_id from public.article_pins'))).toEqual([{user_id:user}]);
 expect(await as(db,who(owner),q=>q('select * from public.article_pins'))).toEqual([]);
});
it('readers can insert only their own accessible published pins, never forge another identity',async()=>{
 await as(db,who(owner),async q=>{expect(await q('insert into public.article_pins(article_id) values ($1) returning user_id',[post])).toEqual([{user_id:owner}]);});
 await expect(as(db,who(a),q=>q('insert into public.article_pins(user_id,article_id) values ($1,$2)',[owner,post]))).rejects.toThrow(/row-level security/);
 await expect(as(db,who(a),q=>q('insert into public.article_pins(article_id) values ($1)',[draft]))).rejects.toThrow(/row-level security/);
 await db.query("update public.apps set locked=false where id='articles'");await db.query("update public.apps set visibility='owner_only' where id='articles'");
 await expect(as(db,who(a),q=>q('insert into public.article_pins(article_id) values ($1)',[post]))).rejects.toThrow(/row-level security/);
 await db.query("update public.apps set visibility='public',locked=true where id='articles'");
});
it('identities cannot be updated; readers can remove only their own pins',async()=>{
 await expect(as(db,who(a),q=>q('update public.article_pins set user_id=$1',[b]))).rejects.toThrow(/permission denied/);
 expect(await as(db,who(a),q=>q('delete from public.article_pins where user_id=$1 returning article_id',[b]))).toEqual([]);
 expect(await as(db,who(a),q=>q('delete from public.article_pins returning article_id'))).toEqual([{article_id:post}]);
});
it('duplicate pins are harmless and article/account deletion cascades',async()=>{
 await as(db,who(a),async q=>{await q('insert into public.article_pins(article_id) values ($1) on conflict do nothing',[post]);expect(await q('select article_id from public.article_pins')).toHaveLength(1);});
 await db.query('delete from auth.users where id=$1',[b]);expect((await db.query('select * from public.article_pins where user_id=$1',[b])).rows).toEqual([]);
 await db.query('delete from public.articles where id=$1',[post]);expect((await db.query('select * from public.article_pins')).rows).toEqual([]);
});
