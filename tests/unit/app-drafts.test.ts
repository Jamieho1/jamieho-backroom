import {it,expect,vi} from 'vitest';
import {validateOperations,affectedRoutes,CONTENT_ALLOWLIST} from '@/lib/content-drafts/allowlist';
import {overlayApp,loadAppPreview} from '@/lib/content-drafts/app-overlay';
import type {SupabaseClient} from '@supabase/supabase-js';
const story='00000000-0000-4000-8000-000000000901';
const op=(table='behavioral_stories',action='update',fields:unknown={title:'Draft story'},key:string|number=story)=>({table,op:action,fields,key});
const parse=(operations:unknown)=>{const r=validateOperations(operations);if(!r.ok)throw Error(r.message);return r.operations;};
const PASSLOOP_TABLES=['notes','question_notes','practice_code','practice_stars','resume_templates','interview_behavioral_themes','interview_behavioral_questions','companies','company_questions','interview_experiences','system_design_questions'];
it('PassLoop tables are not draftable on the personal site (PL4)',()=>{
 for(const table of PASSLOOP_TABLES){
  expect(Object.keys(CONTENT_ALLOWLIST)).not.toContain(table);
  expect(validateOperations([op(table,'update',{body:'X'},table==='notes'?'fixture-note':217)]).ok).toBe(false);
 }
 expect(Object.keys(CONTENT_ALLOWLIST)).toEqual(expect.arrayContaining(['behavioral_stories','behavioral_answers','about_photos','projects','articles','guides','site_sections','experience_items','experience_bullets']));
});
it('legacy owner story and answer drafts keep their editor limits',()=>{
 const operations=parse([op('behavioral_stories','insert',{title:' Title '},story),op('behavioral_answers','insert',{primary_story_id:story,outline:'Outline'},'g-intro')]);
 expect(operations[0].fields).toMatchObject({title:'Title'});
 expect(affectedRoutes(operations)).toEqual([]);
 for(const [field,max] of [['title',160],['situation',20000],['skills',1000],['numbers',2000]] as const){
  expect(validateOperations([op('behavioral_stories','update',{title:'Valid',[field]:'x'.repeat(max)})]).ok).toBe(true);
  expect(validateOperations([op('behavioral_stories','update',{title:'Valid',[field]:'x'.repeat(max+1)})]).ok).toBe(false);
  expect(validateOperations([op('behavioral_stories','update',{title:'Valid',[field]:'\0'})]).ok).toBe(false);
 }
 expect(validateOperations([op('behavioral_stories','update',{title:'😀'.repeat(160)})]).ok).toBe(true);
 expect(validateOperations([op('behavioral_stories','insert',{situation:'No title'})]).ok).toBe(false);
 expect(validateOperations([op('behavioral_stories','delete',{})]).ok).toBe(false);
 expect(validateOperations([op('behavioral_stories','update',{},story)]).ok).toBe(false);
 expect(validateOperations([op('behavioral_stories','update',{title:'X'},'not-a-uuid')]).ok).toBe(false);
});
it('story/answer overlays validate complete merged values and reject duplicate references',()=>{
 const stories=overlayApp('behavioral_stories',[],parse([op('behavioral_stories','insert',{title:' Draft story '})]));
 expect(stories[0]).toMatchObject({title:'Draft story',bullet_id:null,action:'',draftChanged:true});
 const answers=overlayApp('behavioral_answers',[],parse([op('behavioral_answers','insert',{primary_story_id:story,outline:'Draft answer'},'g-intro')]));
 expect(answers[0]).toMatchObject({secondary_story_id:null,followups:'',draftChanged:true});
 expect(()=>overlayApp('behavioral_answers',answers,parse([op('behavioral_answers','update',{secondary_story_id:story},'g-intro')]))).toThrow(/duplicate/);
 expect(()=>overlayApp('behavioral_stories',stories,parse([op('behavioral_stories','insert',{title:'X'})]))).toThrow(/already exists/);
 expect(()=>overlayApp('behavioral_stories',[],parse([op('behavioral_stories','update',{title:'X'})]))).toThrow(/no longer exists/);
});
it('loads a legacy table snapshot only when needed',async()=>{
 const from=vi.fn(()=>({select:()=>Promise.resolve({error:null,data:[]})}));const sb={from} as unknown as SupabaseClient;
 expect(await loadAppPreview(sb,parse([{table:'site_sections',op:'update',key:'hero',fields:{title:'X'}}]))).toEqual({});expect(from).not.toHaveBeenCalled();
 const rows=await loadAppPreview(sb,parse([op('behavioral_stories','insert',{title:'New'})]));expect(from.mock.calls.map(c=>(c as unknown[])[0])).toEqual(['behavioral_stories']);expect(rows.behavioral_stories).toHaveLength(1);
});
