import {it,expect,vi} from 'vitest';
import {completedProblems} from '@/lib/practice/progress';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),eq:vi.fn(),range:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {loadPracticeCompletions} from '@/app/actions/practice-progress';
it('completion requires an actual nonempty fully passed submit; failed/runs/partial/zero are not complete',()=>{
 const pass={problem:217,mode:'submit',status:'ok',passed:2,total:2};
 expect(completedProblems([pass,pass,{...pass,problem:1,mode:'run'},{...pass,problem:2,passed:1},{...pass,problem:3,total:0,passed:0},{...pass,problem:4,status:'crash'},{...pass,problem:9999}])).toEqual([217]);
});
it('all signed-in accounts read only their own completions and visitors are refused',async()=>{
 const q={select:()=>q,eq:m.eq,order:()=>q,range:m.range};m.eq.mockImplementation(()=>q);m.server.mockResolvedValue({from:()=>q});m.range.mockResolvedValue({data:[{problem:217,mode:'submit',status:'ok',passed:2,total:2}],error:null});
 for(const role of ['member','owner']){m.viewer.mockResolvedValue({role,id:role+'-id'});expect(await loadPracticeCompletions()).toEqual({ok:true,problems:[217]});expect(m.eq).toHaveBeenCalledWith('user_id',role+'-id');}
 m.viewer.mockResolvedValue({role:'anonymous'});expect((await loadPracticeCompletions()).ok).toBe(false);
});

it('pages history so older passed submissions are not lost at the row limit',async()=>{
 const q={select:()=>q,eq:m.eq,order:()=>q,range:m.range};m.eq.mockImplementation(()=>q);m.server.mockResolvedValue({from:()=>q});m.viewer.mockResolvedValue({role:'member',id:'member-id'});
 m.range.mockReset().mockResolvedValueOnce({data:Array.from({length:500},()=>({problem:217,mode:'submit',status:'ok',passed:1,total:2})),error:null}).mockResolvedValueOnce({data:[{problem:1,mode:'submit',status:'ok',passed:2,total:2}],error:null});
 expect(await loadPracticeCompletions()).toEqual({ok:true,problems:[1]});expect(m.range).toHaveBeenLastCalledWith(500,999);
});
