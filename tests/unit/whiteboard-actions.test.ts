import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),calls:[] as {table:string;op:string;arg?:unknown;filters:unknown[]}[],results:{} as Record<string,{data:unknown;error:unknown}>}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {loadSdWhiteboard,saveSdWhiteboard,resetSdWhiteboard} from '@/app/actions/system-design-whiteboard';
import {WB_LIMITS} from '@/lib/interview/whiteboard';
const QID='00000000-0000-4000-8000-000000000f01';
function builder(table:string){
 const call={table,op:'select',filters:[] as unknown[]} as (typeof m.calls)[number];m.calls.push(call);const chain:Record<string,unknown>={};
 for(const name of ['select','eq','maybeSingle'])chain[name]=(...a:unknown[])=>{if(name==='eq')call.filters.push(a);return chain;};
 chain.upsert=(arg:unknown,opts:unknown)=>{call.op='upsert';call.arg={arg,opts};return chain;};chain.delete=()=>{call.op='delete';return chain;};
 chain.then=(res:(v:unknown)=>unknown,rej:(e:unknown)=>unknown)=>Promise.resolve(m.results[table+':'+call.op]??{data:[],error:null}).then(res,rej);
 return chain;
}
beforeEach(()=>{vi.clearAllMocks();m.calls.length=0;m.results={};m.viewer.mockResolvedValue({role:'member',id:'member-id'});m.server.mockResolvedValue({from:(t:string)=>builder(t)});});
const scene={v:1,elements:[{id:'a',type:'rectangle',link:'https://example.test'},{id:'i',type:'image'}]};
it('visitors never reach the database',async()=>{
 m.viewer.mockResolvedValue({role:'anonymous'});
 expect((await loadSdWhiteboard(QID)).ok).toBe(false);expect((await saveSdWhiteboard(QID,scene)).ok).toBe(false);expect((await resetSdWhiteboard(QID)).ok).toBe(false);expect(m.calls).toEqual([]);
});
it('loads only the signed-in account row and sanitizes what it returns',async()=>{
 m.results['system_design_whiteboards:select']={data:{scene:{elements:[{id:'a',type:'rectangle'},{id:'e',type:'embeddable'}]}},error:null};
 expect(await loadSdWhiteboard(QID)).toEqual({ok:true,scene:{v:1,elements:[{id:'a',type:'rectangle',link:null}]}});
 expect(m.calls[0].filters).toEqual([['user_id','member-id'],['question_id',QID]]);
 m.results['system_design_whiteboards:select']={data:null,error:null};expect(await loadSdWhiteboard(QID)).toEqual({ok:true,scene:null});
 m.results['system_design_whiteboards:select']={data:null,error:{message:'x'}};expect((await loadSdWhiteboard(QID)).ok).toBe(false);
 expect((await loadSdWhiteboard('nope')).ok).toBe(false);
});
it('saves a sanitized scene under the server-derived user id',async()=>{
 m.results['system_design_whiteboards:upsert']={data:[{question_id:QID}],error:null};
 expect(await saveSdWhiteboard(QID,scene)).toEqual({ok:true});
 const call=m.calls.find(c=>c.op==='upsert')!;const {arg,opts}=call.arg as {arg:Record<string,unknown>;opts:unknown};
 expect(arg).toMatchObject({user_id:'member-id',question_id:QID,scene:{v:1,elements:[{id:'a',type:'rectangle',link:null}]}});expect(opts).toEqual({onConflict:'user_id,question_id'});
 m.results['system_design_whiteboards:upsert']={data:null,error:{message:'rls'}};expect((await saveSdWhiteboard(QID,scene)).ok).toBe(false);
});
it('rejects invalid ids, non-scenes and oversized boards before touching the database',async()=>{
 m.calls.length=0;
 expect((await saveSdWhiteboard('nope',scene)).ok).toBe(false);expect((await saveSdWhiteboard(QID,'x')).ok).toBe(false);expect((await saveSdWhiteboard(QID,{elements:[{id:'b',type:'text',text:'x'.repeat(WB_LIMITS.bytes+1)}]})).ok).toBe(false);
 expect((await saveSdWhiteboard(QID,{elements:[{id:'b',type:'text',text:'x'.repeat(WB_LIMITS.bytes*2)}]})).ok).toBe(false);
 expect(m.calls).toEqual([]);
});
it('reset deletes only the caller\'s row',async()=>{
 expect(await resetSdWhiteboard(QID)).toEqual({ok:true});const c=m.calls.find(x=>x.op==='delete')!;expect(c.filters).toEqual([['user_id','member-id'],['question_id',QID]]);
 m.results['system_design_whiteboards:delete']={data:null,error:{message:'x'}};expect((await resetSdWhiteboard(QID)).ok).toBe(false);expect((await resetSdWhiteboard('bad')).ok).toBe(false);
});
