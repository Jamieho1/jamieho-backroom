import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const user={id:'00000000-0000-4000-8000-000000000a10',email:'prep-owner@example.test'};
const owner={role:'authenticated' as const,sub:user.id};let db:PGlite;
const cid='00000000-0000-4000-8000-000000000a01',eid='00000000-0000-4000-8000-000000000a02';
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);
 await db.query("insert into public.companies(id,slug,name,public) values ($1,'prep-company','Prep Company',true)",[cid]);
 await db.query("insert into public.interview_experiences(id,company_id,slug,title,role,published,published_at,prep_links) values ($1,$2,'prep-story','Prep story','Engineer',true,now(),$3)",[eid,cid,JSON.stringify([{kind:'question',ref:'146'},{kind:'note',ref:'full-stack-locking',label:'Locking'}])]);});
afterAll(async()=>{await db?.close();});
const insertLinks=(links:unknown)=>db.query("insert into public.interview_experiences(company_id,slug,title,role,prep_links) values ($1,$2,'T','R',$3)",[cid,'s-'+Math.random().toString(16).slice(2),JSON.stringify(links)]);
it('adds prep_links with an empty default and public readers see only published rows',async()=>{
 await db.query("insert into public.interview_experiences(company_id,slug,title,role) values ($1,'plain','Plain','R')",[cid]);
 expect((await db.query<{prep_links:unknown}>("select prep_links from public.interview_experiences where slug='plain'")).rows[0].prep_links).toEqual([]);
 await as(db,{role:'anon'},async q=>{const rows=await q<{slug:string;prep_links:unknown[]}>('select slug,prep_links from public.interview_experiences order by slug');expect(rows).toEqual([{slug:'prep-story',prep_links:[{kind:'question',ref:'146'},{kind:'note',ref:'full-stack-locking',label:'Locking'}]}]);});
});
it('shape constraint accepts valid ordered links and refuses malformed ones',async()=>{
 await insertLinks([{kind:'behavioral_theme',ref:'conflict'},{kind:'note',ref:'arrays-hashing',label:'Arrays'},{kind:'question',ref:'217'}]);
 for(const bad of [{},'x',[1],[{kind:'other',ref:'a'}],[{kind:'note'}],[{kind:'note',ref:'Bad Ref'}],[{kind:'note',ref:'a',extra:1}],[{kind:'note',ref:'a',label:''}],[{kind:'note',ref:'a',label:' lead'}],[{kind:'note',ref:'a',label:'x'.repeat(81)}],[{kind:'note',ref:'a',label:5}],[{kind:'note',ref:'a'.repeat(81)}],[{kind:'note',ref:5}],Array.from({length:21},(_,i)=>({kind:'note',ref:'n'+i}))])
  await expect(insertLinks(bad),JSON.stringify(bad).slice(0,60)).rejects.toThrow();
 await insertLinks(Array.from({length:20},(_,i)=>({kind:'note',ref:'n'+i,label:'x'.repeat(80)})));
});
type Q=<R = Record<string, unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
/** `as` rolls back, so approvals and their read-backs share one callback. */
const approveIn=async(q:Q,ops:unknown[])=>{const [set]=await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Synthetic prep draft',$1) returning id",[JSON.stringify(ops)]);await q("update public.content_changes set status='approved' where id=$1",[set.id]);return set.id;};
const approve=(ops:unknown[])=>as(db,owner,q=>approveIn(q,ops));
const op=(fields:unknown,action='update',key=eid)=>({table:'interview_experiences',op:action,key,fields});
it('approval stores links in order, keeps them on unrelated updates and audits the old row',async()=>{
 await as(db,owner,async q=>{
  const first=await approveIn(q,[op({prep_links:[{kind:'behavioral_theme',ref:'leadership'},{kind:'question',ref:'1'},{kind:'note',ref:'sd-anything'}]})]);
  expect((await q<{prep_links:{ref:string}[]}>('select prep_links from public.interview_experiences where id=$1',[eid]))[0].prep_links.map(l=>l.ref)).toEqual(['leadership','1','sd-anything']);
  const previous=(await q<{previous:{values:{prep_links:{ref:string}[]}}[]}>('select previous from public.content_changes where id=$1',[first]))[0].previous;expect(previous[0].values.prep_links.map(l=>l.ref)).toEqual(['146','full-stack-locking']);
  await approveIn(q,[op({title:'Renamed'})]);
  expect((await q('select title,prep_links from public.interview_experiences where id=$1',[eid]))[0]).toMatchObject({title:'Renamed',prep_links:[{ref:'leadership'},{ref:'1'},{ref:'sd-anything'}]});
  const added='00000000-0000-4000-8000-000000000a03';
  await approveIn(q,[op({company_id:cid,slug:'drafted',title:'Drafted',role:'Eng',prep_links:[{kind:'question',ref:'146'}]},'insert',added)]);
  expect((await q('select prep_links from public.interview_experiences where id=$1',[added]))[0].prep_links).toEqual([{kind:'question',ref:'146'}]);
  await approveIn(q,[op({company_id:cid,slug:'no-links',title:'No links',role:'Eng'},'insert','00000000-0000-4000-8000-000000000a04')]);
  expect((await q("select prep_links from public.interview_experiences where slug='no-links'"))[0].prep_links).toEqual([]);
 });
});
for(const [name,links] of [['unknown question',[{kind:'question',ref:'99999999'}]],['unknown theme',[{kind:'behavioral_theme',ref:'not-a-theme'}]],['non-list',{kind:'note',ref:'a'}],['bad shape',[{kind:'note',ref:'A B'}]],['too many',Array.from({length:21},(_,i)=>({kind:'note',ref:'n'+i}))]] as const)
 it(`approval refuses ${name} and rolls the whole set back`,async()=>{
  await expect(approve([op({title:'Must roll back'}),op({prep_links:links})])).rejects.toThrow();
  expect((await db.query<{title:string}>('select title from public.interview_experiences where id=$1',[eid])).rows[0].title).not.toBe('Must roll back');
 });
it('non-owner cannot write prep_links and the approval helper stays hardened',async()=>{
 await expect(as(db,{role:'authenticated',sub:'00000000-0000-4000-8000-000000000a99'},q=>q("update public.interview_experiences set prep_links='[]' returning id"))).resolves.toEqual([]);
 await expect(as(db,{role:'anon'},q=>q("update public.interview_experiences set prep_links='[]'"))).rejects.toThrow();
 const row=(await db.query<{prosecdef:boolean;proconfig:string[];callable:boolean}>("select prosecdef,proconfig,has_function_privilege('anon',oid,'execute') or has_function_privilege('authenticated',oid,'execute') callable from pg_proc where oid='private.apply_company_draft(jsonb)'::regprocedure")).rows[0];
 expect(row).toMatchObject({prosecdef:true,callable:false});expect(row.proconfig).toContain('search_path=""');
});
