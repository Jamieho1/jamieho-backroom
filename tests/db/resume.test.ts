import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const owner={id:'00000000-0000-4000-8000-000000000121',email:'resume-owner@example.test'},a={id:'00000000-0000-4000-8000-000000000122',email:'resume-a@example.test'},b={id:'00000000-0000-4000-8000-000000000123',email:'resume-b@example.test'};
const who=(id:string)=>({role:'authenticated' as const,sub:id});let db:PGlite;
const entry={id:'00000000-0000-4000-8000-000000000124',kind:'role',title:'Synthetic role',org:'Example org',dates:'2025',location:'Remote',summary:'Synthetic summary',sort:0,bullets:[{id:'00000000-0000-4000-8000-000000000125',text:'Synthetic bullet',sort:0}]};const doc={entries:[entry]};
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[owner.email]);for(const u of [owner,a,b]){await addUser(db,u);await db.query('insert into public.user_resumes(user_id,content) values ($1,$2)',[u.id,JSON.stringify(doc)]);}},30000);
afterAll(async()=>{await db?.close();});
it('template starts empty and public, never populated from the live CV',async()=>{for(const user of [{role:'anon' as const},who(a.id),who(owner.id)])expect(await as(db,user,q=>q('select content from public.resume_templates'))).toEqual([{content:{entries:[]}}]);});
for(const u of [owner,a,b])it(`${u.email} has only own resume CRUD, with no owner bypass`,async()=>{
 const other=u.id===a.id?b: a;
 await as(db,who(u.id),async q=>{expect(await q('select user_id from public.user_resumes')).toEqual([{user_id:u.id}]);expect(await q('update public.user_resumes set revision=2 where user_id=$1 returning user_id',[other.id])).toEqual([]);expect(await q('delete from public.user_resumes where user_id=$1 returning user_id',[other.id])).toEqual([]);expect(await q('update public.user_resumes set content=$1 returning user_id',[JSON.stringify({entries:[]})])).toEqual([{user_id:u.id}]);await q('delete from public.user_resumes');expect(await q('insert into public.user_resumes(content) values ($1) returning user_id',[JSON.stringify(doc)])).toEqual([{user_id:u.id}]);});
 await expect(as(db,who(u.id),q=>q('update public.user_resumes set user_id=$1',[other.id]))).rejects.toThrow(/row-level security/);
 await expect(as(db,who(u.id),q=>q('insert into public.user_resumes(user_id,content) values ($1,$2)',[other.id,JSON.stringify(doc)]))).rejects.toThrow(/row-level security/);
});
it('anon cannot access private resumes or write templates',async()=>{for(const sql of ['select * from public.user_resumes',"insert into public.user_resumes(content) values ('{\"entries\":[]}')",'update public.user_resumes set revision=2','delete from public.user_resumes',"update public.resume_templates set title='No'",'delete from public.resume_templates'])await expect(as(db,{role:'anon'},q=>q(sql))).rejects.toThrow(/permission denied/);});
it('only the owner can insert/update/delete the shared guide',async()=>{
 await as(db,who(a.id),async q=>{expect(await q("update public.resume_templates set title='No' returning key")).toEqual([]);expect(await q('delete from public.resume_templates returning key')).toEqual([]);});
 await expect(as(db,who(a.id),q=>q("insert into public.resume_templates(key) values('default')"))).rejects.toThrow(/row-level security/);
 await as(db,who(owner.id),async q=>{await q('update public.resume_templates set content=$1',[JSON.stringify(doc)]);expect(await q('delete from public.resume_templates returning key')).toEqual([{key:'default'}]);await q("insert into public.resume_templates(key) values ('default')");});
});
const invalid=[{entries:[{...entry,title:''}]},{entries:[{...entry,title:'x'.repeat(161)}]},{entries:[{...entry,kind:'no'}]},{entries:[{...entry,user_id:a.id}]},{entries:[{...entry,sort:1.5}]},{entries:[{...entry,bullets:[{...entry.bullets[0],text:'x'.repeat(1001)}]}]},{entries:[{...entry,bullets:[entry.bullets[0],entry.bullets[0]]}]},{entries:[entry,entry]},{entries:[],user_id:a.id},null];
for(let i=0;i<invalid.length;i++)it(`database validates private and template document case ${i}`,async()=>{
 for(const [table,user] of [['user_resumes',a],['resume_templates',owner]] as const)await expect(as(db,who(user.id),q=>q(`update public.${table} set content=$1`,[JSON.stringify(invalid[i])]))).rejects.toThrow();
});
it('template drafts apply atomically and retain their previous document; failures roll back',async()=>{
 const operation={table:'resume_templates',op:'update',key:'default',fields:{title:'Synthetic approved guide',content:doc}};
 await as(db,who(owner.id),async q=>{const [set]=await q<{id:string}>('insert into public.content_changes(summary,operations) values ($1,$2) returning id',['Synthetic template',JSON.stringify([operation])]);const [applied]=await q<{previous:{values:{content:unknown}}[]}>("update public.content_changes set status='approved' where id=$1 returning previous",[set.id]);expect(applied.previous[0].values.content).toEqual({entries:[]});expect(await q('select title from public.resume_templates')).toEqual([{title:'Synthetic approved guide'}]);});
 const bad=[{...operation,fields:{user_id:a.id}},{...operation,op:'delete'},{...operation,key:'other'},{...operation,fields:{content:invalid[0]}}];
 for(const second of bad)await expect(as(db,who(owner.id),async q=>{const [set]=await q<{id:string}>('insert into public.content_changes(summary,operations) values ($1,$2) returning id',['Synthetic failed template',JSON.stringify([operation,second])]);await q("update public.content_changes set status='approved' where id=$1",[set.id]);})).rejects.toThrow();
 expect((await db.query('select title,content from public.resume_templates')).rows).toEqual([{title:'Resume guide',content:{entries:[]}}]);
});
it('deleting an account cascades only that private resume',async()=>{await db.query('delete from auth.users where id=$1',[b.id]);expect((await db.query('select user_id from public.user_resumes order by user_id')).rows).toEqual([{user_id:owner.id},{user_id:a.id}]);});

it('respects editor UTF-16 limits and rejects nested identities in approved drafts',async()=>{
 await as(db,who(owner.id),async q=>{await q('update public.resume_templates set content=$1',[JSON.stringify({entries:[{...entry,title:'😀'.repeat(80)}]})]);});
 await expect(as(db,who(owner.id),q=>q('update public.resume_templates set content=$1',[JSON.stringify({entries:[{...entry,title:'😀'.repeat(81)}]})]))).rejects.toThrow(/limit/);
});
