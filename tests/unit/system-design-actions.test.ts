import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),from:vi.fn(),calls:[] as {table:string;op:string;arg?:unknown;filters:unknown[]}[],results:{} as Record<string,{data:unknown;error:unknown}>}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {loadSdProgress,saveSdProgress,loadQuizAttempts,saveQuizAttempt} from '@/app/actions/system-design';
const QID='00000000-0000-4000-8000-000000000c01';
const quiz=[0,1].map(i=>({q:'Q'+i,options:['a','b','c','d'],answer:i,explanation:''}));
/** A chainable fake of the PostgREST builder; every awaited chain resolves to results[table+':'+terminal op]. */
function builder(table:string){
 const call={table,op:'select',filters:[] as unknown[]} as (typeof m.calls)[number];m.calls.push(call);
 const chain:Record<string,unknown>={};
 const result=()=>m.results[table+':'+call.op]??{data:[],error:null};
 for(const name of ['select','eq','order','limit','single','maybeSingle'])chain[name]=(...args:unknown[])=>{if(name==='eq')call.filters.push(args);return chain;};
 chain.insert=(arg:unknown)=>{call.op='insert';call.arg=arg;return chain;};chain.upsert=(arg:unknown,opts:unknown)=>{call.op='upsert';call.arg={arg,opts};return chain;};
 chain.then=(res:(v:unknown)=>unknown,rej:(e:unknown)=>unknown)=>Promise.resolve(result()).then(res,rej);
 return chain;
}
beforeEach(()=>{vi.clearAllMocks();m.calls.length=0;m.results={};m.viewer.mockResolvedValue({role:'member',id:'member-id'});m.server.mockResolvedValue({from:(t:string)=>builder(t)});});
it('visitors cannot read or write progress or attempts and never reach the database',async()=>{
 m.viewer.mockResolvedValue({role:'anonymous'});
 expect((await loadSdProgress()).ok).toBe(false);expect((await saveSdProgress(QID,'done',true)).ok).toBe(false);expect((await loadQuizAttempts(QID)).ok).toBe(false);expect((await saveQuizAttempt(QID,[0,1])).ok).toBe(false);
 expect(m.calls).toEqual([]);
});
it('reads flags and done ticks for the signed-in account only',async()=>{
 m.results['system_design_progress:select']={data:[{question_id:'a',flagged:true,done:false},{question_id:'b',flagged:false,done:true}],error:null};
 expect(await loadSdProgress()).toEqual({ok:true,flagged:['a'],done:['b']});expect(m.calls[0].filters).toContainEqual(['user_id','member-id']);
 m.results['system_design_progress:select']={data:null,error:{message:'x'}};expect((await loadSdProgress()).ok).toBe(false);
});
it('upserts only the changed column with a server-derived user id and validates input',async()=>{
 m.results['system_design_progress:upsert']={data:[{question_id:QID}],error:null};
 expect(await saveSdProgress(QID,'flagged',true)).toEqual({ok:true});
 const sent=(m.calls[0].arg as {arg:Record<string,unknown>;opts:unknown});expect(sent.arg).toMatchObject({user_id:'member-id',question_id:QID,flagged:true});expect('done' in sent.arg).toBe(false);expect(sent.opts).toEqual({onConflict:'user_id,question_id'});
 m.calls.length=0;for(const bad of [['nope','done',true],[QID,'user_id',true],[QID,'done','yes']] as const)expect((await saveSdProgress(...(bad as unknown as [string,'done',boolean]))).ok).toBe(false);expect(m.calls).toEqual([]);
 m.results['system_design_progress:upsert']={data:[],error:null};expect((await saveSdProgress(QID,'done',true)).ok).toBe(false);
});
it('lists the account\'s attempts for one question, newest first',async()=>{
 m.results['system_design_quiz_attempts:select']={data:[{id:'x',score:1,total:2,created_at:'2026-11-23T10:00:00Z',answers:[0,0]}],error:null};
 expect(await loadQuizAttempts(QID)).toEqual({ok:true,attempts:[{id:'x',score:1,total:2,created_at:'2026-11-23T10:00:00Z'}]});
 expect(m.calls[0].filters).toEqual(expect.arrayContaining([['user_id','member-id'],['question_id',QID]]));expect((await loadQuizAttempts('bad')).ok).toBe(false);
});
it('recomputes the score on the server from the stored quiz and refuses mismatched or malformed attempts',async()=>{
 m.results['system_design_questions:select']={data:{quiz},error:null};
 m.results['system_design_quiz_attempts:insert']={data:{id:'new',score:1,total:2,created_at:'2026-11-23T10:00:00Z'},error:null};
 const r=await saveQuizAttempt(QID,[0,null]);expect(r).toEqual({ok:true,attempt:{id:'new',score:1,total:2,created_at:'2026-11-23T10:00:00Z'}});
 const insert=m.calls.find(c=>c.op==='insert')!;expect(insert.arg).toEqual({user_id:'member-id',question_id:QID,score:1,total:2,answers:[0,null]});
 m.calls.length=0;for(const picks of [[0],[0,1,0],[0,9],['a']] as unknown[][])expect((await saveQuizAttempt(QID,picks as never)).ok).toBe(false);expect(m.calls.some(c=>c.op==='insert')).toBe(false);
 m.results['system_design_questions:select']={data:null,error:null};expect((await saveQuizAttempt(QID,[0,1])).ok).toBe(false);
});
it('reports database failures without throwing',async()=>{
 m.results['system_design_questions:select']={data:{quiz},error:null};m.results['system_design_quiz_attempts:insert']={data:null,error:{message:'x'}};
 expect((await saveQuizAttempt(QID,[0,1])).ok).toBe(false);m.server.mockRejectedValue(new Error('offline'));expect((await loadQuizAttempts(QID)).ok).toBe(false);expect((await loadSdProgress()).ok).toBe(false);
});
