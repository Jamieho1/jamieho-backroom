import {it,expect,vi} from 'vitest';
import {validateOperations,affectedRoutes} from '@/lib/content-drafts/allowlist';
import {overlayApp,loadAppPreview,appTargets,practicePreviewData,practiceData} from '@/lib/content-drafts/app-overlay';
import type {SupabaseClient} from '@supabase/supabase-js';
const story='00000000-0000-4000-8000-000000000901';
const op=(table='notes',action='update',fields:unknown={body:'Draft note'},key:string|number='fixture-note')=>({table,op:action,fields,key});
const parse=(operations:unknown)=>{const r=validateOperations(operations);if(!r.ok)throw Error(r.message);return r.operations;};
const note={id:'fixture-note',title:'Live note',body:'Live body',free:'Live free',visual:[],sort:1,updated_at:'2026-01-01'};
it('accepts only editor operations/fields and revalidates app plus specific practice routes',()=>{
 const operations=parse([op(),op('question_notes','insert',{body:'Draft question'},217),op('practice_code','insert',{code:'return 1'},217),op('practice_stars','insert',{},217),op('practice_stars','delete',{},1),op('behavioral_stories','insert',{title:' Title ',bullet_id:null},story),op('behavioral_answers','insert',{outline:'Draft outline'},'g-intro')]);
 expect(operations[5].fields).toMatchObject({title:'Title'});
 expect(affectedRoutes(operations)).toEqual(expect.arrayContaining(['/notes','/practices','/practices/217','/practices/1','/behavioral']));
 expect(appTargets(operations).filter(t=>t.href==='/interview/problems/217')).toHaveLength(1);
});
for(const [table,field,max,key] of [['notes','body',200000,'fixture-note'],['notes','free',200000,'fixture-note'],['question_notes','body',200000,217],['practice_code','code',100000,217],['behavioral_stories','title',160,story],['behavioral_stories','situation',20000,story],['behavioral_stories','task',20000,story],['behavioral_stories','action',20000,story],['behavioral_stories','result',20000,story],['behavioral_stories','skills',1000,story],['behavioral_stories','numbers',2000,story],['behavioral_answers','outline',20000,'g-intro'],['behavioral_answers','followups',10000,'g-intro']] as const){
 it(`${table}.${field} matches its editor limits for update${table==='notes'?'':' and insert'}`,()=>{
  for(const action of table==='notes'?['update']:['insert','update']){
   const fields=table==='behavioral_stories'?{title:'Valid',[field]:'x'.repeat(max)}:{[field]:'x'.repeat(max)};
   expect(validateOperations([op(table,action,fields,key)]).ok).toBe(true);
   expect(validateOperations([op(table,action,{...fields,[field]:'x'.repeat(max+1)},key)]).ok).toBe(false);
   expect(validateOperations([op(table,action,{...fields,[field]:null},key)]).ok).toBe(false);
   expect(validateOperations([op(table,action,{...fields,[field]:'\0'},key)]).ok).toBe(false);
  }
 });
}
it('rejects catalogue changes, identities, invalid keys, unsupported operations and empty content',()=>{
 for(const operation of [op('problems'),op('practice_attempts'),op('notes','insert'),op('notes','delete',{}),op('notes','update',{title:'X'}),op('notes','update',{owner_id:story}),op('notes','update',{},'fixture-note'),op('notes','update',{body:'X'},'INVALID'),op('question_notes','insert',{},217),op('question_notes','update',{body:'X'},9999),op('question_notes','update',{body:'X'},'217'),op('practice_code','insert',{},217),op('practice_code','delete',{},217),op('practice_stars','update',{},217),op('practice_stars','insert',{starred:true},217),op('behavioral_stories','insert',{situation:'X'},story),op('behavioral_stories','update',{title:' '},story),op('behavioral_stories','delete',{},story),op('behavioral_stories','update',{bullet_id:'invalid'},story),op('behavioral_answers','update',{outline:'X'},'unknown'),op('behavioral_answers','delete',{},'g-intro'),op('behavioral_answers','update',{user_id:story},'g-intro')])expect(validateOperations([operation]).ok,JSON.stringify(operation)).toBe(false);
});
it('matches UTF-16 notes/code and codepoint story limits used by pinned editors',()=>{
 expect(validateOperations([op('practice_code','update',{code:'😀'.repeat(50000)},217)]).ok).toBe(true);
 expect(validateOperations([op('practice_code','update',{code:'😀'.repeat(50001)},217)]).ok).toBe(false);
 expect(validateOperations([op('behavioral_stories','update',{title:'😀'.repeat(160)},story)]).ok).toBe(true);
});
it('overlays cloned note fields without changing metadata or live rows',()=>{
 const before=structuredClone(note);const rows=overlayApp('notes',[note],parse([op()]));
 expect(note).toEqual(before);expect(rows[0]).toMatchObject({...note,body:'Draft note',draftChanged:true,updated_at:expect.any(String)});
 expect(()=>overlayApp('notes',[],parse([op()]))).toThrow(/no longer exists/);
});
it('story/answer overlays validate complete merged values and reject duplicate references',()=>{
 const stories=overlayApp('behavioral_stories',[],parse([op('behavioral_stories','insert',{title:' Draft story '},story)]));
 expect(stories[0]).toMatchObject({title:'Draft story',bullet_id:null,action:'',draftChanged:true});
 const answers=overlayApp('behavioral_answers',[],parse([op('behavioral_answers','insert',{primary_story_id:story,outline:'Draft answer'},'g-intro')]));
 expect(answers[0]).toMatchObject({secondary_story_id:null,followups:'',draftChanged:true});
 expect(()=>overlayApp('behavioral_answers',answers,parse([op('behavioral_answers','update',{secondary_story_id:story},'g-intro')]))).toThrow(/duplicate/);
 expect(()=>overlayApp('behavioral_stories',stories,parse([op('behavioral_stories','insert',{title:'X'},story)]))).toThrow(/already exists/);
});
it('practice loads a full snapshot only when needed, including stars and saved code',async()=>{
 const from=vi.fn((table:string)=>({select:async()=>({error:null,data:table==='practice_stars'?[{problem:1,created_at:'2026-01-01'}]:[]})}));const sb={from} as unknown as SupabaseClient;
 expect(await loadAppPreview(sb,parse([{table:'site_sections',op:'update',key:'hero',fields:{title:'X'}}]))).toEqual({});expect(from).not.toHaveBeenCalled();
 const ops=parse([op('question_notes','insert',{body:'Draft notes'},217),op('practice_code','insert',{code:'Draft code'},217),op('practice_stars','delete',{},1),op('practice_stars','insert',{},217)]);
 const rows=await loadAppPreview(sb,ops);expect(from.mock.calls.map(c=>c[0]).sort()).toEqual(['practice_code','practice_stars','question_notes']);
 const preview=practicePreviewData(rows,ops);expect(preview.stars).toEqual([217]);expect(preview.changedStars).toEqual([1,217]);expect(practiceData(preview,217)).toEqual({note:'Draft notes',code:'Draft code',attempts:[]});
});
