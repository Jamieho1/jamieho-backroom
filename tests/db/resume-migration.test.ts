import {it,expect} from 'vitest';
import {freshDb} from './harness';
it('creates an empty template without touching populated existing CV rows',async()=>{
 const id='00000000-0000-4000-8000-000000000129';let before:unknown;
 const db=await freshDb({beforeMigration:async(db,file)=>{if(!file.endsWith('_user_resumes.sql'))return;await db.query("insert into public.experience_items(id,title,summary,public) values ($1,'Synthetic legacy CV','Synthetic legacy summary',true)",[id]);await db.query("insert into public.experience_bullets(item_id,text,public) values ($1,'Synthetic legacy bullet',true)",[id]);before=(await db.query("select to_jsonb(i)-array['show_on_journey','journey_icon'] as row from public.experience_items i where id=$1",[id])).rows;}});
 try{expect((await db.query("select to_jsonb(i)-array['show_on_journey','journey_icon'] as row from public.experience_items i where id=$1",[id])).rows).toEqual(before);expect((await db.query('select content from public.resume_templates')).rows).toEqual([{content:{entries:[]}}]);expect((await db.query('select * from public.user_resumes')).rows).toEqual([]);}finally{await db.close();}
},30000);
