import {describe,it,expect} from 'vitest';
import {SD_FRAME_IDS,SD_FRAME_NAMES,sdStepSchema,sdStepsSchema,resolveStep,timeHint,STEP_LIMITS} from '@/lib/interview/sd-steps';
import {questionSchema} from '@/lib/interview/system-design';
import {buildTemplate} from '@/lib/interview/whiteboard';
import {ATTEMPT_LIMITS,addLocalHistory,attemptSummary,buildHistoryPayload,cleanTicks,draftFromAttempt,emptyDraft,findFrame,focusFrame,historyPayloadSchema,isEmptyDraft,joinDictation,parseHistoryRow,parseLocalHistory,parseStoredDraft,sanitizeDraft,sceneFromApi,scoreChecklist,spokenText,speechRecognitionCtor,toggleTick,type BoardApiLike,type HistoryAttempt} from '@/lib/interview/sd-attempt';

const full={id:'redirect-flow',title:'Redirect flow',category:'Deep dive',question:'How does a redirect work?',instruction:'Revise your design and explain.',minutes:3,frame:'wb-hld',how_to_answer:'## Approach\nWalk the request.',model_answer:'The server looks up the code.',checklist:['Lookup by key','Cache hot keys','Use a redirect status'],clarifying:[{q:'Is it read heavy?',a:'Yes, far more reads than writes.'}]};
const steps=[full,{id:'entities',title:'Core entities',checklist:['A','B']}].map(s=>resolveStep(sdStepSchema.parse(s)));
const now='2026-11-23T10:00:00.000Z';

describe('step model',()=>{
 it('accepts the full shape and id+title only (S1 rows), and fills defaults',()=>{
  expect(sdStepSchema.safeParse(full).success).toBe(true);
  const r=resolveStep(sdStepSchema.parse({id:'a',title:'Alpha'}));
  expect(r).toMatchObject({category:'Alpha',question:'',instruction:'',minutes:null,frame:null,checklist:[],clarifying:[]});
  expect(resolveStep(sdStepSchema.parse(full))).toMatchObject({category:'Deep dive',frame:'wb-hld',howToAnswer:'## Approach\nWalk the request.',modelAnswer:'The server looks up the code.'});
 });
 it('rejects unknown keys, bad frames, bounds, blank items and duplicate ids',()=>{
  for(const bad of [{...full,extra:1},{...full,frame:'wb-nope'},{...full,minutes:0},{...full,minutes:61},{...full,minutes:1.5},{...full,checklist:['  ']},{...full,checklist:Array(13).fill('x')},{...full,clarifying:[{q:'x'}]},{...full,clarifying:[{q:'x',a:'y',z:1}]},{...full,clarifying:Array(11).fill({q:'x',a:'y'})},{...full,model_answer:'x'.repeat(STEP_LIMITS.model+1)},{id:'Bad Id',title:'x'},{id:'a'}])
   expect(sdStepSchema.safeParse(bad).success).toBe(false);
  expect(sdStepsSchema.safeParse([full,full]).success).toBe(false);expect(sdStepsSchema.safeParse(Array(13).fill(0).map((_,i)=>({id:'s'+i,title:'T'}))).success).toBe(false);
 });
 it('is part of the question schema',()=>{
  const q={id:'00000000-0000-4000-8000-000000000a01',slug:'q',title:'Q',icon:'system-design',topic:'',note_ref:'',solution:'',quiz:[],steps:[full],sort:1,public:true};
  expect(questionSchema.safeParse(q).success).toBe(true);expect(questionSchema.safeParse({...q,steps:[{...full,frame:'x'}]}).success).toBe(false);
 });
 it('frame ids and names match the S2 template frames',()=>{
  const t=buildTemplate({title:'T',solution:''});
  expect(t.frames.map(f=>f.id)).toEqual([...SD_FRAME_IDS]);expect(t.frames.map(f=>f.name)).toEqual(SD_FRAME_IDS.map(id=>SD_FRAME_NAMES[id]));
 });
 it('target time hint',()=>{expect(timeHint(2)).toBe('Spend ~2 minutes in a real interview.');expect(timeHint(1)).toBe('Spend ~1 minute in a real interview.');expect(timeHint(null)).toBe('');});
});

describe('checklist scoring',()=>{
 it('counts distinct valid ticks only',()=>{
  expect(scoreChecklist(steps[0],[0,2])).toEqual({covered:2,total:3});expect(scoreChecklist(steps[0],[0,0,1,7,-1,1.5])).toEqual({covered:2,total:3});expect(scoreChecklist({checklist:[]},[0])).toEqual({covered:0,total:0});
  expect(cleanTicks([2,0,2],3)).toEqual([0,2]);expect(toggleTick([0,2],1)).toEqual([0,1,2]);expect(toggleTick([0,1],1)).toEqual([0]);
 });
 it('summarises an attempt across steps',()=>{
  expect(attemptSummary(steps,{step:0,answers:{'redirect-flow':' text ',entities:'  '},checks:{'redirect-flow':[0],entities:[0,1]},seconds:5})).toEqual({covered:3,total:5,answered:1});
 });
});

describe('draft persistence',()=>{
 it('sanitizes stored drafts against the live steps',()=>{
  const raw={step:9,answers:{'redirect-flow':'x'.repeat(ATTEMPT_LIMITS.answer+5),gone:'old',entities:'  '},checks:{'redirect-flow':[1,1,9],gone:[0]},seconds:42.9};
  const d=sanitizeDraft(raw,steps);
  expect(d.step).toBe(1);expect(Array.from(d.answers['redirect-flow']).length).toBe(ATTEMPT_LIMITS.answer);expect(Object.keys(d.answers)).toEqual(['redirect-flow']);expect(d.checks).toEqual({'redirect-flow':[1]});expect(d.seconds).toBe(42);
  expect(sanitizeDraft('x',steps)).toEqual(emptyDraft());expect(parseStoredDraft('{bad',steps)).toEqual(emptyDraft());expect(parseStoredDraft(null,steps)).toEqual(emptyDraft());
  expect(isEmptyDraft(emptyDraft())).toBe(true);expect(isEmptyDraft({...emptyDraft(),seconds:1})).toBe(false);
 });
});

describe('history serialisation',()=>{
 const scene={v:1 as const,elements:[{id:'a',type:'rectangle',link:null}]};
 const draft={step:1,answers:{'redirect-flow':'my answer'},checks:{'redirect-flow':[0,1]},seconds:125};
 it('builds the snapshot with canvas, answers, ticks, timer and the covered/total summary',()=>{
  const p=buildHistoryPayload(steps,draft,scene);
  expect(p).toEqual({scene,answers:{'redirect-flow':'my answer'},checks:{'redirect-flow':[0,1]},seconds:125,covered:2,total:5});
  const {scene:_s,...rest}=p;void _s;expect(historyPayloadSchema.safeParse(rest).success).toBe(true);
  expect(historyPayloadSchema.safeParse({...rest,covered:6}).success).toBe(false);expect(historyPayloadSchema.safeParse({...rest,seconds:-1}).success).toBe(false);expect(historyPayloadSchema.safeParse({...rest,answers:{'Bad Key':'x'}}).success).toBe(false);
 });
 it('parses stored rows, sanitizing the scene, and rejects malformed ones',()=>{
  const row={id:'r1',created_at:now,seconds:125,covered:2,total:5,answers:{'redirect-flow':'a'},checks:{'redirect-flow':[0]},scene:{elements:[{id:'a',type:'embeddable'},{id:'b',type:'line',link:'x'}]}};
  expect(parseHistoryRow(row)).toMatchObject({id:'r1',scene:{v:1,elements:[{id:'b',type:'line',link:null}]}});
  for(const bad of [{...row,created_at:'nope'},{...row,covered:9},{...row,checks:{'redirect-flow':[99]}},null,'x'])expect(parseHistoryRow(bad)).toBeNull();
  expect(parseHistoryRow({...row,scene:'x'})!.scene).toBeNull();
 });
 it('restores a saved attempt into a draft',()=>{
  const a={answers:{'redirect-flow':'a',gone:'b'},checks:{entities:[0,5]},seconds:30};
  expect(draftFromAttempt(a,steps)).toEqual({step:0,answers:{'redirect-flow':'a'},checks:{entities:[0]},seconds:30});
 });
 it('keeps the last three visitor attempts, newest first, and refuses oversize snapshots',()=>{
  const mk=(n:number):HistoryAttempt=>({id:'a'+n,created_at:`2026-11-0${n}T10:00:00.000Z`,seconds:n,covered:0,total:0,answers:{},checks:{},scene});
  let list:HistoryAttempt[]=[];for(const n of [1,2,3,4]){list=addLocalHistory(list,mk(n))!;}
  expect(list.map(a=>a.id)).toEqual(['a4','a3','a2']);
  expect(parseLocalHistory(JSON.stringify(list)).map(a=>a.id)).toEqual(['a4','a3','a2']);expect(parseLocalHistory('{bad')).toEqual([]);expect(parseLocalHistory('{}')).toEqual([]);expect(parseLocalHistory(null)).toEqual([]);
  const big=mk(5);big.scene={v:1,elements:[{id:'t',type:'text',text:'x'.repeat(ATTEMPT_LIMITS.localBytes*ATTEMPT_LIMITS.localHistory)}]};expect(addLocalHistory([],big)).toBeNull();
 });
});

describe('frame focus',()=>{
 const els=[{id:'wb-hld',type:'frame',name:'High-Level Design'},{id:'x1',type:'frame',name:'API Design'},{id:'t',type:'text'},{id:'gone',type:'frame',name:'Core Entities',isDeleted:true}];
 const api=(elements=els):BoardApiLike&{calls:unknown[][]}=>{const calls:unknown[][]=[];return {calls,getSceneElements:()=>elements,getAppState:()=>({scrollX:1,scrollY:2,zoom:{value:0.5}}),scrollToContent:(...a)=>{calls.push(['scroll',...a]);},updateScene:(...a)=>{calls.push(['update',...a]);}};};
 it('finds a frame by id, then by name, ignoring deleted ones',()=>{
  expect(findFrame(els,'wb-hld')?.id).toBe('wb-hld');expect(findFrame(els,'wb-api')?.id).toBe('x1');expect(findFrame(els,'wb-entities')).toBeNull();expect(findFrame(els,'wb-non')).toBeNull();
 });
 it('selects and zooms to the frame, with no animation under reduced motion; false if missing',()=>{
  const a=api();expect(focusFrame(a,'wb-hld',false)).toBe(true);
  expect(a.calls[0]).toEqual(['update',{appState:{selectedElementIds:{'wb-hld':true}}}]);expect(a.calls[1]).toEqual(['scroll',els[0],expect.objectContaining({fitToViewport:true,animate:true})]);
  const b=api();focusFrame(b,'wb-api',true);expect((b.calls[1][2] as {animate:boolean}).animate).toBe(false);
  const c=api();expect(focusFrame(c,'wb-entities',false)).toBe(false);expect(focusFrame(c,null,false)).toBe(false);expect(c.calls).toEqual([]);
 });
 it('reads the scene (live elements plus view) from the API',()=>{expect(sceneFromApi(api())).toEqual({v:1,elements:els.filter(e=>!('isDeleted' in e)),view:{scrollX:1,scrollY:2,zoom:0.5}});});
});

describe('dictation helpers',()=>{
 it('joins results and appends to existing text',()=>{
  const r=(t:string,f=true)=>({isFinal:f,0:{transcript:t}});
  expect(spokenText([r(' hello '),r('world',false)])).toBe('hello world');expect(spokenText([])).toBe('');
  expect(joinDictation('first  ','then more')).toBe('first then more');expect(joinDictation('','x')).toBe('x');expect(joinDictation('keep','')).toBe('keep');
 });
 it('feature-detects SpeechRecognition and webkitSpeechRecognition',()=>{
  class A{}class B{}
  expect(speechRecognitionCtor({})).toBeNull();expect(speechRecognitionCtor(undefined)).toBeNull();expect(speechRecognitionCtor({SpeechRecognition:A})).toBe(A);expect(speechRecognitionCtor({webkitSpeechRecognition:B})).toBe(B);
 });
});
