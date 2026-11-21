import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const user={id:'00000000-0000-4000-8000-000000001701',email:'journey-owner@example.test'},member={id:'00000000-0000-4000-8000-000000001702',email:'journey-member@example.test'};
const owner={role:'authenticated' as const,sub:user.id},item='00000000-0000-4000-8000-000000001703',added='00000000-0000-4000-8000-000000001704',set='00000000-0000-4000-8000-000000001705';
let db:PGlite;
type Q=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);await addUser(db,member);await db.query("insert into public.experience_items(id,title,public,show_on_journey) values ($1,'Synthetic stop',true,true)",[item]);});
afterAll(()=>db?.close());
const seed=(q:Q,operations:unknown[])=>q("insert into public.content_changes(id,summary,operations) values ($1,'Synthetic journey photo',$2)",[set,JSON.stringify(operations)]);
const approve=(q:Q)=>q<{previous:{values:Record<string,unknown>|null}[]}>("update public.content_changes set status='approved' where id=$1 returning previous",[set]);
it('journey_photo defaults to empty, is publicly readable on public rows and constrained to media paths',async()=>{
 expect(await as(db,{role:'anon'},q=>q('select journey_photo from public.experience_items where id=$1',[item]))).toEqual([{journey_photo:''}]);
 for(const ok of ['journey-koln3d.jpg','a/b_c-d.webp','x.png',''])await as(db,owner,q=>q('update public.experience_items set journey_photo=$1',[ok]));
 for(const bad of ['../x.jpg','https://example.test/x.jpg','x.svg','a b.jpg','/x.jpg',`${'x'.repeat(240)}.jpg`])await expect(as(db,owner,q=>q('update public.experience_items set journey_photo=$1',[bad])),bad).rejects.toThrow(/check/);
});
it('visitors and members cannot change journey_photo; the owner can',async()=>{
 await expect(as(db,{role:'anon'},q=>q("update public.experience_items set journey_photo='x.jpg'"))).rejects.toThrow();
 expect(await as(db,{role:'authenticated',sub:member.id},q=>q("update public.experience_items set journey_photo='x.jpg' returning id"))).toEqual([]);
 expect(await as(db,owner,q=>q("update public.experience_items set journey_photo='x.jpg' returning id"))).toHaveLength(1);
});
it('Content Drafts set, clear and insert journey_photo atomically with the previous row audited',async()=>{
 await as(db,owner,async q=>{
  await seed(q,[{op:'update',table:'experience_items',key:item,fields:{journey_photo:'journey-koln3d.jpg'}},{op:'insert',table:'experience_items',key:added,fields:{title:'Inserted stop',journey_photo:'journey-global-relay.jpg'}}]);
  const [result]=await approve(q);expect(result.previous[0].values).toMatchObject({id:item,journey_photo:''});expect(result.previous[1].values).toBeNull();
  expect(await q('select id,journey_photo from public.experience_items order by id')).toEqual([{id:item,journey_photo:'journey-koln3d.jpg'},{id:added,journey_photo:'journey-global-relay.jpg'}]);
 });
 await as(db,owner,async q=>{await q("update public.experience_items set journey_photo='journey-koln3d.jpg' where id=$1",[item]);await seed(q,[{op:'update',table:'experience_items',key:item,fields:{journey_photo:''}}]);await approve(q);expect(await q('select journey_photo from public.experience_items where id=$1',[item])).toEqual([{journey_photo:''}]);});
 await as(db,owner,async q=>{await seed(q,[{op:'insert',table:'experience_items',key:added,fields:{title:'Defaults'}}]);await approve(q);expect(await q('select journey_photo from public.experience_items where id=$1',[added])).toEqual([{journey_photo:''}]);});
});
for(const bad of ['../x.jpg','https://example.test/x.jpg','x.svg','a b.jpg',`${'x'.repeat(240)}.jpg`,1,null])it(`invalid draft journey_photo ${JSON.stringify(bad)?.slice(0,30)} rolls back the whole set`,async()=>{
 await as(db,owner,async q=>{await seed(q,[{op:'update',table:'experience_items',key:item,fields:{title:'Must roll back'}},{op:'update',table:'experience_items',key:item,fields:{journey_photo:bad}}]);await q('savepoint approve');await expect(approve(q)).rejects.toThrow();await q('rollback to savepoint approve');expect(await q('select title,journey_photo from public.experience_items where id=$1',[item])).toEqual([{title:'Synthetic stop',journey_photo:expect.any(String)}]);expect(await q('select status from public.content_changes where id=$1',[set])).toEqual([{status:'draft'}]);});
});
