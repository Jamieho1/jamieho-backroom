import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),calls:[] as {table:string;op:string;arg?:unknown;filters:unknown[]}[],results:{} as Record<string,{data:unknown;error:unknown}>}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {listSdAttempts,loadSdAttempt,saveSdAttempt,deleteSdAttempt} from '@/app/actions/system-design-history';
const QID='00000000-0000-4000-8000-000000000f01',AID='00000000-0000-4000-8000-000000000f02';
function builder(table:string){
 const call={table,op:'select',filters:[] as unknown[]} as (typeof m.calls)[number];m.calls.push(call);const chain:Record<string,unknown>={};
 for(const name of ['select','eq','in','order','limit','range','maybeSingle'])chain[name]=(...a:unknown[])=>{if(name==='eq'||name==='in')call.filters.push(a);if(name==='range')call.op='select-range';return chain;};
 chain.insert=(arg:unknown)=>{call.op='insert';call.arg=arg;return chain;};chain.delete=()=>{call.op='delete';return chain;};
 chain.then=(res:(v:unknown)=>unknown,rej:(e:unknown)=>unknown)=>Promise.resolve(m.results[table+':'+call.op]??{data:[],error:null}).then(res,rej);
 return chain;
}
beforeEach(()=>{vi.clearAllMocks();m.calls.length=0;m.results={};m.viewer.mockResolvedValue({role:'member',id:'member-id'});m.server.mockResolvedValue({from:(t:string)=>builder(t)});});
const row={id:AID,created_at:'2026-11-23T10:00:00.000Z',seconds:60,covered:1,total:2};
const payload={scene:{v:1,elements:[{id:'a',type:'rectangle',link:'https://x.test'},{id:'i',type:'image'}]},answers:{entities:'text'},checks:{entities:[0]},seconds:60,covered:1,total:2};
it('visitors never reach the database',async()=>{
 m.viewer.mockResolvedValue({role:'anonymous'});
 expect((await listSdAttempts(QID)).ok).toBe(false);expect((await loadSdAttempt(QID,AID)).ok).toBe(false);expect((await saveSdAttempt(QID,payload)).ok).toBe(false);expect((await deleteSdAttempt(QID,AID)).ok).toBe(false);expect(m.calls).toEqual([]);
});
it('lists only the signed-in account rows for a question, without canvases',async()=>{
 m.results['system_design_attempts:select']={data:[row,{...row,id:'bad',created_at:'nope'}],error:null};
 expect(await listSdAttempts(QID)).toEqual({ok:true,items:[row]});
 expect(m.calls[0].filters).toEqual([['user_id','member-id'],['question_id',QID]]);
 m.results['system_design_attempts:select']={data:null,error:{message:'x'}};expect((await listSdAttempts(QID)).ok).toBe(false);expect((await listSdAttempts('nope')).ok).toBe(false);
});
it('opens one attempt with a sanitized canvas',async()=>{
 m.results['system_design_attempts:select']={data:{...row,answers:{entities:'a'},checks:{entities:[0]},scene:{elements:[{id:'a',type:'rectangle'},{id:'e',type:'embeddable'}]}},error:null};
 const r=await loadSdAttempt(QID,AID);expect(r.ok&&r.attempt.scene).toEqual({v:1,elements:[{id:'a',type:'rectangle',link:null}]});
 expect(m.calls[0].filters).toEqual([['user_id','member-id'],['question_id',QID],['id',AID]]);
 m.results['system_design_attempts:select']={data:null,error:null};expect((await loadSdAttempt(QID,AID)).ok).toBe(false);expect((await loadSdAttempt(QID,'x')).ok).toBe(false);
});
it('saves a validated snapshot under the server-derived user id and prunes beyond twenty',async()=>{
 m.results['system_design_attempts:insert']={data:[row],error:null};m.results['system_design_attempts:select-range']={data:[{id:'old1'},{id:'old2'}],error:null};
 expect(await saveSdAttempt(QID,payload)).toEqual({ok:true,item:row});
 const ins=m.calls.find(c=>c.op==='insert')!;expect(ins.arg).toMatchObject({user_id:'member-id',question_id:QID,scene:{v:1,elements:[{id:'a',type:'rectangle',link:null}]},answers:{entities:'text'},covered:1,total:2});
 const del=m.calls.find(c=>c.op==='delete')!;expect(del.filters).toContainEqual(['id',['old1','old2']]);expect(del.filters).toContainEqual(['user_id','member-id']);
 m.results['system_design_attempts:insert']={data:null,error:{message:'rls'}};expect((await saveSdAttempt(QID,payload)).ok).toBe(false);
});
it('rejects bad input before touching the database',async()=>{
 m.calls.length=0;
 for(const bad of [null,'x',{...payload,covered:9},{...payload,seconds:-1},{...payload,answers:{'Bad Key':'x'}},{...payload,scene:'x'},{...payload,scene:{elements:[{id:'b',type:'text',text:'x'.repeat(1_000_000)}]}}])expect((await saveSdAttempt(QID,bad)).ok).toBe(false);
 expect((await saveSdAttempt('nope',payload)).ok).toBe(false);expect(m.calls).toEqual([]);
});
it('deletes only the signed-in account row',async()=>{
 expect(await deleteSdAttempt(QID,AID)).toEqual({ok:true});expect(m.calls[0].filters).toEqual([['user_id','member-id'],['question_id',QID],['id',AID]]);
 m.results['system_design_attempts:delete']={data:null,error:{message:'x'}};expect((await deleteSdAttempt(QID,AID)).ok).toBe(false);
});
