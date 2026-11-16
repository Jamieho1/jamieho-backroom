import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
import {MEDIA_PUBLIC_BASE,JOURNEY_ICONS} from '@/lib/home-content-schema';
import {photoPath} from '@/lib/content-drafts/photo-slots';
const user={id:'00000000-0000-4000-8000-000000001101',email:'home-owner@example.test'},member={id:'00000000-0000-4000-8000-000000001102',email:'home-member@example.test'};
const owner={role:'authenticated' as const,sub:user.id},key='00000000-0000-4000-8000-000000001103',hidden='00000000-0000-4000-8000-000000001104',set='00000000-0000-4000-8000-000000001105';
let db:PGlite;
beforeAll(async()=>{db=await freshDb({storage:true});await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);await addUser(db,member);await db.query("insert into public.about_photos(id,path,alt,public) values ($1,'public.png','Public fixture',true),($2,'hidden.png','Hidden fixture',false)",[key,hidden]);await db.query("insert into public.experience_items(id,title,public) values ($1,'Synthetic role',true)",[key]);},30000);
afterAll(()=>db?.close());
type Q=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
const seed=(q:Q,operations:unknown[],slots:unknown[]=[])=>q("insert into public.content_changes(id,summary,operations,photo_slots) values ($1,'Synthetic home proposal',$2,$3)",[set,JSON.stringify(operations),JSON.stringify(slots)]);
const approve=(q:Q)=>q<{previous:{table:string;values:Record<string,unknown>|null}[]}>("update public.content_changes set status='approved' where id=$1 returning previous",[set]);
it('anonymous and member reads return public photos only and cannot write; owner has full CRUD',async()=>{
 for(const who of [{role:'anon' as const},{role:'authenticated' as const,sub:member.id}]){
  expect(await as(db,who,q=>q('select id from public.about_photos'))).toEqual([{id:key}]);
  await expect(as(db,who,q=>q("insert into public.about_photos(path,alt) values ('x.png','Fixture')"))).rejects.toThrow();
  for(const sql of ["update public.about_photos set caption='Changed' returning id","delete from public.about_photos returning id"]){if(who.role==='anon')await expect(as(db,who,q=>q(sql))).rejects.toThrow();else expect(await as(db,who,q=>q(sql))).toEqual([]);}
  await expect(as(db,who,q=>q("insert into public.experience_items(title,show_on_journey,journey_icon) values ('Fixture',true,'code')"))).rejects.toThrow();
  if(who.role==='authenticated'){expect(await as(db,who,q=>q("update public.experience_items set show_on_journey=true returning id"))).toEqual([]);expect(await as(db,who,q=>q("update public.site_sections set body='Fixture' where key='story' returning key"))).toEqual([]);}
 }
 await as(db,owner,async q=>{expect(await q('select id from public.about_photos')).toHaveLength(2);await q("insert into public.about_photos(id,path,alt) values ($1,'new.png','Fixture')",[set]);expect(await q("update public.about_photos set caption='Edited' where id=$1 returning caption",[set])).toEqual([{caption:'Edited'}]);expect(await q('delete from public.about_photos where id=$1 returning id',[set])).toEqual([{id:set}]);});
});
it('one centre includes hidden photos; icons, paths and story keys are constrained',async()=>{
 await expect(as(db,owner,async q=>{await q('update public.about_photos set centre=true where id=$1',[key]);await q('update public.about_photos set centre=true where id=$1',[hidden]);})).rejects.toThrow(/unique/);
 await expect(as(db,owner,q=>q("update public.experience_items set journey_icon='invalid'"))).rejects.toThrow(/check/);
 for(const icon of JOURNEY_ICONS)await as(db,owner,q=>q('update public.experience_items set journey_icon=$1,show_on_journey=true',[icon]));
 expect((await db.query("select title,body from public.site_sections where key='story'")).rows).toEqual([{title:'My story',body:''}]);
 for(const path of ['../x.png','https://example.test/x.png','x.svg'])await expect(as(db,owner,q=>q('update public.about_photos set path=$1',[path]))).rejects.toThrow(/check/);
});
it('drafts atomically edit new fields/story and insert/update/delete photos, preserving deleted rows in history',async()=>{
 await as(db,owner,async q=>{
  await seed(q,[{op:'update',table:'experience_items',key,fields:{show_on_journey:true,journey_icon:'code'}},{op:'update',table:'site_sections',key:'story',fields:{body:'Synthetic story'}},{op:'insert',table:'about_photos',key:set,fields:{path:'new.png',alt:'New fixture',public:true}},{op:'update',table:'about_photos',key,fields:{caption:'Changed'}},{op:'delete',table:'about_photos',key:hidden,fields:{}}]);
  const [result]=await approve(q);expect(result.previous).toHaveLength(5);expect(result.previous[4].values?.path).toBe('hidden.png');expect(await q('select show_on_journey,journey_icon from public.experience_items where id=$1',[key])).toEqual([{show_on_journey:true,journey_icon:'code'}]);expect(await q('select body from public.site_sections where key=\'story\'')).toEqual([{body:'Synthetic story'}]);expect(await q('select id from public.about_photos where id=$1',[hidden])).toEqual([]);
 });
});
for(const bad of [{table:'about_photos',op:'update',key,fields:{unknown:true}},{table:'about_photos',op:'update',key,fields:{alt:'x'.repeat(241)}},{table:'about_photos',op:'delete',key,fields:{public:false}},{table:'about_photos',op:'insert',key:set,fields:{path:'x.png'}},{table:'experience_items',op:'update',key,fields:{journey_icon:'invalid'}},{table:'experience_items',op:'update',key,fields:{show_on_journey:'yes'}}])it('invalid second operation rolls back first and status/history',async()=>{
 await as(db,owner,async q=>{await seed(q,[{op:'update',table:'site_sections',key:'story',fields:{body:'Must roll back'}},bad]);await q('savepoint approve');await expect(approve(q)).rejects.toThrow();await q('rollback to savepoint approve');expect(await q("select body from public.site_sections where key='story'")).toEqual([{body:''}]);expect(await q('select status,previous from public.content_changes where id=$1',[set])).toEqual([{status:'draft',previous:null}]);});
});
const slot={slot:'about',expected_filename:'photo.png',bucket:'home-media',target:{table:'about_photos',key:set,field:'path'},caption:'Synthetic caption',alt:'Synthetic alt',sort:4,public:true,path:null as string|null};
it('home-media slot blocks pending approval then creates a photo and previews canonical URLs consistently',async()=>{
 const path=photoPath(set,slot);
 await db.query("insert into storage.objects(bucket_id,name,owner_id,metadata) values ('home-media',$1,$2,$3)",[path,user.id,JSON.stringify({mimetype:'image/png',size:100})]);
 await expect(as(db,owner,async q=>{await seed(q,[],[slot]);await approve(q);})).rejects.toThrow(/Upload every/);
 await as(db,owner,async q=>{await seed(q,[],[{...slot,path}]);const [result]=await approve(q);expect(result.previous).toEqual([{op:'insert',table:'about_photos',key:set,values:null}]);expect(await q('select path,caption,alt,sort,public,centre from public.about_photos where id=$1',[set])).toEqual([{path,caption:slot.caption,alt:slot.alt,sort:4,public:true,centre:false}]);});
 for(const bucket of ['home-media','project-media'])expect((await db.query<{url:string}>('select private.draft_media_url($1,$2) as url',[bucket,path])).rows[0].url).toBe(MEDIA_PUBLIC_BASE+bucket+'/'+path);
 for(const changes of [{alt:''},{sort:0.5},{unknown:true},{path:'elsewhere.png'},{target:{...slot.target,field:'caption'}}])await expect(as(db,owner,async q=>{await seed(q,[],[{...slot,path,...changes}]);await approve(q);})).rejects.toThrow();
});
for(const [name,metadata,objectOwner] of [['wrong mime',{mimetype:'image/svg+xml',size:10},user.id],['oversize',{mimetype:'image/png',size:5242881},user.id],['another user',{mimetype:'image/png',size:10},member.id]] as const)it(`home slot refuses ${name}`,async()=>{
 const value={...slot,slot:'invalid',path:`drafts/${set}/invalid/photo.png`};await db.query("insert into storage.objects(bucket_id,name,owner_id,metadata) values ('home-media',$1,$2,$3)",[value.path,objectOwner,JSON.stringify(metadata)]);
 try{await expect(as(db,owner,async q=>{await seed(q,[],[value]);await approve(q);})).rejects.toThrow(/Photo must/);}finally{await db.query('delete from storage.objects where name=$1',[value.path]);}
});
it('home-media upload policies remain owner only and all new helpers have no API execute',async()=>{
 for(const who of [{role:'anon' as const},{role:'authenticated' as const,sub:member.id}])await expect(as(db,who,q=>q("insert into storage.objects(bucket_id,name,owner_id,metadata) values ('home-media','synthetic.png',$1,'{}')",[who.sub??'']))).rejects.toThrow();
 await as(db,owner,q=>q("insert into storage.objects(bucket_id,name,owner_id,metadata) values ('home-media','synthetic.png',$1,'{}')",[user.id]));
 for(const fn of ['private.apply_about_photo_draft(jsonb)','private.draft_media_url(text,text)'])expect((await db.query<{allowed:boolean}>("select has_function_privilege('anon',$1,'EXECUTE') or has_function_privilege('authenticated',$1,'EXECUTE') or has_function_privilege('service_role',$1,'EXECUTE') as allowed",[fn])).rows[0].allowed).toBe(false);
});
