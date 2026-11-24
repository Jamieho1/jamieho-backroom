import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
import {SQL_LIST} from '@/lib/practice/sql-catalog';
import {PRACTICE_ANCHORS} from '@/lib/notes/neetcode150';
const user={id:'00000000-0000-4000-8000-000000000b01',email:'sql-notes-owner@example.test'};
const owner={role:'authenticated' as const,sub:user.id};
const cid='00000000-0000-4000-8000-000000000b02',eid='00000000-0000-4000-8000-000000000b03';
type Q=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
let db:PGlite;
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);
 await db.query("insert into public.companies(id,slug,name,public) values ($1,'sql-company','SQL Company',true)",[cid]);
 await db.query("insert into public.interview_experiences(id,company_id,slug,title,role) values ($1,$2,'sql-story','SQL story','Engineer')",[eid,cid]);});
afterAll(async()=>{await db?.close();});
const approve=async(q:Q,ops:unknown[])=>{const [set]=await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Synthetic SQL notes draft',$1) returning id",[JSON.stringify(ops)]);return q("update public.content_changes set status='approved' where id=$1 returning status",[set.id]);};
const noteOp=(key:string,fields:unknown)=>({table:'notes',op:'update',key,fields});
it('seeds the three SQL notes empty, in shelf order, without touching other notes',async()=>{
 const rows=await db.query<{id:string;title:string;body:string;free:string;sort:number}>("select id,title,body,free,sort from public.notes where id like 'sql-%' order by sort");
 expect(rows.rows).toEqual([{id:'sql-basics',title:'SQL basics',body:'',free:'',sort:9001},{id:'sql-tackling',title:'Tackling SQL questions',body:'',free:'',sort:9002},{id:'sql-postgres-mysql',title:'Postgres vs MySQL',body:'',free:'',sort:9003}]);
});
it('a notes Content Draft fills each SQL note (body, free) and keeps title, sort and visual',async()=>{
 await as(db,owner,async q=>{
  expect((await approve(q,[noteOp('sql-basics',{body:'## SELECT\n\n[[question:1757]] [[note:sql-tackling]]',free:'my notes'}),noteOp('sql-tackling',{body:'Method'}),noteOp('sql-postgres-mysql',{body:'COALESCE vs IFNULL'})]))[0].status).toBe('approved');
  expect(await q('select id,title,body,free,sort from public.notes where id like $1 order by sort',['sql-%'])).toEqual([
   {id:'sql-basics',title:'SQL basics',body:'## SELECT\n\n[[question:1757]] [[note:sql-tackling]]',free:'my notes',sort:9001},{id:'sql-tackling',title:'Tackling SQL questions',body:'Method',free:'',sort:9002},{id:'sql-postgres-mysql',title:'Postgres vs MySQL',body:'COALESCE vs IFNULL',free:'',sort:9003}]);
 });
 await expect(as(db,owner,q=>approve(q,[noteOp('sql-missing',{body:'x'})]))).rejects.toThrow(/no longer exists/);
 await expect(as(db,owner,q=>approve(q,[noteOp('SQL Basics',{body:'x'})]))).rejects.toThrow(/Invalid note key/);
});
it('valid_draft_problem accepts all 50 SQL numbers and still every DSA number; others stay refused',async()=>{
 const check=async(n:number)=>(await db.query<{ok:boolean}>('select private.valid_draft_problem($1) as ok',[n])).rows[0].ok;
 for(const p of SQL_LIST)expect(await check(p.lc),String(p.lc)).toBe(true);
 for(const p of PRACTICE_ANCHORS)expect(await check(p.lc),String(p.lc)).toBe(true);
 for(const n of [0,2,99999,1756,621000])expect(await check(n)).toBe(n===2);
});
it('interview experiences approve SQL question prep links alongside SQL note links; unknown questions are refused',async()=>{
 await as(db,owner,async q=>{
  await approve(q,[{table:'interview_experiences',op:'update',key:eid,fields:{prep_links:[{kind:'note',ref:'sql-basics'},{kind:'question',ref:'1757'},{kind:'question',ref:'217'},{kind:'note',ref:'sql-postgres-mysql'}]}}]);
  expect((await q<{prep_links:{ref:string}[]}>('select prep_links from public.interview_experiences where id=$1',[eid]))[0].prep_links.map(l=>l.ref)).toEqual(['sql-basics','1757','217','sql-postgres-mysql']);
 });
 await expect(as(db,owner,q=>approve(q,[{table:'interview_experiences',op:'update',key:eid,fields:{prep_links:[{kind:'question',ref:'99999'}]}}]))).rejects.toThrow(/existing practice question/);
});
