import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
import {PHOTO_PUBLIC_BASE,photoPath} from '@/lib/content-drafts/photo-slots';
const user={id:'00000000-0000-4000-8000-000000001071',email:'photo-owner@example.test'},member={id:'00000000-0000-4000-8000-000000001072',email:'photo-member@example.test'};
const owner={role:'authenticated' as const,sub:user.id},project='00000000-0000-4000-8000-000000001073',set='00000000-0000-4000-8000-000000001074';
const slot={slot:'screen',expected_filename:'project.png',bucket:'project-media',target:{table:'projects',key:project,field:'screenshots'},caption:'Project screenshot',path:null as string|null};
const operation={op:'update',table:'projects',key:project,fields:{name:'Approved fixture project'}};
let db:PGlite;
beforeAll(async()=>{db=await freshDb({storage:true});await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);await addUser(db,member);await db.query("insert into public.projects(id,slug,name,screenshots,public) values ($1,'fixture-project','Live fixture project',array['https://example.test/live.png'],true)",[project]);},30000);
afterAll(()=>db?.close());
type Q=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
const seed=(q:Q,slots:unknown[],operations:unknown[]=[operation])=>q("insert into public.content_changes(id,summary,operations,photo_slots) values ($1,'Synthetic photo proposal',$2,$3)",[set,JSON.stringify(operations),JSON.stringify(slots)]);
const approve=(q:Q)=>q<{status:string;previous:{values:Record<string,unknown>}[]}>("update public.content_changes set status='approved' where id=$1 returning status,previous",[set]);
it('pending slot blocks approval and rolls back base operations, status and audit',async()=>{
 await as(db,owner,async q=>{await seed(q,[slot]);await q('savepoint approval');await expect(approve(q)).rejects.toThrow(/Upload every/);await q('rollback to savepoint approval');expect(await q('select name from public.projects where id=$1',[project])).toEqual([{name:'Live fixture project'}]);expect(await q('select status,previous from public.content_changes where id=$1',[set])).toEqual([{status:'draft',previous:null}]);});
});
async function object(path=photoPath(set,slot),metadata:unknown={mimetype:'image/png',size:100},ownerId=user.id){await db.query('insert into storage.objects(bucket_id,name,owner_id,metadata) values ($1,$2,$3,$4)',['project-media',path,ownerId,JSON.stringify(metadata)]);}
it('verified slot appends to existing screenshots and audits the prior project in one approval',async()=>{
 await object();const path=photoPath(set,slot);
 await as(db,owner,async q=>{await seed(q,[{...slot,path}]);const [result]=await approve(q);expect(result.status).toBe('approved');expect(result.previous).toHaveLength(2);expect(result.previous[1].values.screenshots).toEqual(['https://example.test/live.png']);expect(await q('select name,screenshots from public.projects where id=$1',[project])).toEqual([{name:'Approved fixture project',screenshots:['https://example.test/live.png',PHOTO_PUBLIC_BASE+path]}]);});
});
it('photo-only sets append without inventing another content edit and discard leaves screenshots untouched',async()=>{
 await as(db,owner,async q=>{await seed(q,[{...slot,path:photoPath(set,slot)}],[]);expect((await approve(q))[0].previous).toHaveLength(1);});
 await as(db,owner,async q=>{await seed(q,[slot],[]);await q("update public.content_changes set status='discarded' where id=$1",[set]);expect(await q('select screenshots from public.projects where id=$1',[project])).toEqual([{screenshots:['https://example.test/live.png']}]);});
});
const bad:unknown[][]=[[{...slot,path:'elsewhere/project.png'}],[{...slot,path:photoPath(set,slot),target:{...slot.target,field:'body'}}],[{...slot,path:photoPath(set,slot),bucket:'article-images'}],[{...slot,path:photoPath(set,slot),expected_filename:'../project.png'}],[{...slot,path:photoPath(set,slot),caption:''}],[{...slot,path:photoPath(set,slot),unknown:true}],[{...slot,path:photoPath(set,slot)},{...slot,path:photoPath(set,slot)}],[{...slot,slot:'missing',path:`drafts/${set}/missing/project.png`}]];
for(const [i,slots] of bad.entries())it(`refuses malformed or unverified photo proposal ${i+1} atomically`,async()=>{
 await as(db,owner,async q=>{await seed(q,slots);await q('savepoint approval');await expect(approve(q)).rejects.toThrow();await q('rollback to savepoint approval');expect(await q('select name from public.projects where id=$1',[project])).toEqual([{name:'Live fixture project'}]);});
});
for(const [name,metadata] of [['type',{mimetype:'image/svg+xml',size:20}],['size',{mimetype:'image/png',size:5242881}],['missing size',{mimetype:'image/png'}]] as const)it(`refuses object metadata ${name}`,async()=>{
 const named={...slot,slot:'invalid',path:`drafts/${set}/invalid/project.png`};await object(named.path,metadata);
 try{await expect(as(db,owner,async q=>{await seed(q,[named]);await approve(q);})).rejects.toThrow(/Photo must/);}finally{await db.query('delete from storage.objects where name=$1',[named.path]);}
});
it('refuses uploads not owned by the approver and a seventh screenshot',async()=>{
 const other={...slot,slot:'other',path:`drafts/${set}/other/project.png`};await object(other.path,{mimetype:'image/png',size:20},member.id);
 await expect(as(db,owner,async q=>{await seed(q,[other]);await approve(q);})).rejects.toThrow(/Photo must/);
 await expect(as(db,owner,async q=>{await q("update public.projects set screenshots=array['https://example.test/1.png','https://example.test/2.png','https://example.test/3.png','https://example.test/4.png','https://example.test/5.png','https://example.test/6.png'] where id=$1",[project]);await seed(q,[{...slot,path:photoPath(set,slot)}]);await approve(q);})).rejects.toThrow();
});
it('new projects accept photo slots and a missing second upload rolls back the first append',async()=>{
 await as(db,owner,async q=>{await q('delete from public.projects where id=$1',[project]);await seed(q,[{...slot,path:photoPath(set,slot)}],[{op:'insert',table:'projects',key:project,fields:{slug:'inserted-project',name:'Inserted project',public:true}}]);await approve(q);expect(await q('select screenshots from public.projects where id=$1',[project])).toEqual([{screenshots:[PHOTO_PUBLIC_BASE+photoPath(set,slot)]}]);});
 await as(db,owner,async q=>{await seed(q,[{...slot,path:photoPath(set,slot)},{...slot,slot:'absent',path:`drafts/${set}/absent/project.png`}]);await q('savepoint approval');await expect(approve(q)).rejects.toThrow(/Photo must/);await q('rollback to savepoint approval');expect(await q('select screenshots from public.projects where id=$1',[project])).toEqual([{screenshots:['https://example.test/live.png']}]);expect(await q('select status,previous from public.content_changes where id=$1',[set])).toEqual([{status:'draft',previous:null}]);});
});
it('members/visitors cannot read or attach slots and private helper is not API callable',async()=>{
 await db.query("insert into public.content_changes(id,summary,operations,photo_slots) values ($1,'Synthetic photo proposal',$2,$3)",[set,JSON.stringify([operation]),JSON.stringify([slot])]);
 for(const who of [{role:'anon' as const},{role:'authenticated' as const,sub:member.id}]){
  if(who.role==='anon')await expect(as(db,who,q=>q('select * from public.content_changes'))).rejects.toThrow();
  else {expect(await as(db,who,q=>q('select * from public.content_changes'))).toEqual([]);expect(await as(db,who,q=>q("update public.content_changes set photo_slots='[]' where id=$1 returning id",[set]))).toEqual([]);expect(await as(db,who,approve)).toEqual([]);}
 }
 const result=await db.query<{prosecdef:boolean;proconfig:string[];allowed:boolean}>("select prosecdef,proconfig,has_function_privilege('anon',oid,'EXECUTE') or has_function_privilege('authenticated',oid,'EXECUTE') or has_function_privilege('service_role',oid,'EXECUTE') as allowed from pg_proc where oid='private.apply_draft_photos(uuid,jsonb)'::regprocedure");expect(result.rows[0]).toEqual({prosecdef:true,proconfig:['search_path=""'],allowed:false});
});

it('existing project-media RLS allows owner uploads but blocks visitors and members',async()=>{
 for(const who of [{role:'anon' as const},{role:'authenticated' as const,sub:member.id}])await expect(as(db,who,q=>q("insert into storage.objects(bucket_id,name,owner_id,metadata) values ('project-media','synthetic.png',$1,'{}')",[who.sub??'']))).rejects.toThrow(/row-level security/);
 await as(db,owner,async q=>{await q("insert into storage.objects(bucket_id,name,owner_id,metadata) values ('project-media','synthetic-owner.png',$1,'{}')",[user.id]);expect(await q("select name from storage.objects where name='synthetic-owner.png'")).toHaveLength(1);});
});
