import { beforeEach,expect,it,vi } from 'vitest';
const mocks=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),from:vi.fn(),note:vi.fn(),code:vi.fn(),attempts:vi.fn(),upsert:vi.fn(),save:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:mocks.viewer}));
vi.mock('@/lib/supabase/server',()=>({supabaseServer:mocks.server}));
import { loadPracticeData,savePracticeCode,savePracticeAttempt,saveQuestionNotes } from '@/app/actions/practice';
const attempt={id:'00000000-0000-4000-8000-000000000001',problem:217,code:'Snapshot',mode:'submit' as const,status:'ok' as const,passed:2,total:2,error:''};
beforeEach(()=>{
 vi.clearAllMocks();mocks.viewer.mockResolvedValue({role:'owner',id:'owner-id'});
 mocks.note.mockResolvedValue({data:{body:'Shared note'},error:null});mocks.code.mockResolvedValue({data:{code:'Private code'},error:null});mocks.attempts.mockResolvedValue({data:[{id:attempt.id}],error:null});
 mocks.save.mockResolvedValue({data:[{problem:217,id:attempt.id,created_at:'2026-11-01T00:00:00Z'}],error:null});mocks.upsert.mockReturnValue({select:mocks.save});
 mocks.from.mockImplementation((table:string)=>({
  upsert:mocks.upsert,
  select:()=>{const q={eq:()=>q,maybeSingle:table==='question_notes'?mocks.note:mocks.code,order:()=>({limit:mocks.attempts})};return q;},
 }));mocks.server.mockResolvedValue({from:mocks.from});
});
it('members load only their own saved data as well as permitted shared notes',async()=>{
 mocks.viewer.mockResolvedValue({role:'member',id:'member-id'});
 expect((await loadPracticeData(217)).ok).toBe(true);
 expect(mocks.from.mock.calls.map(c=>c[0])).toEqual(['question_notes','practice_code','practice_attempts']);
});
it('the owner loads saved code and attempt summaries',async()=>{
 const out=await loadPracticeData(217);expect(out.ok).toBe(true);
 if(out.ok){expect(out.data.code).toBe('Private code');expect(out.data.attempts).toHaveLength(1);}
});
it('visitors cannot save code, attempts or question notes',async()=>{
 for(const role of ['anonymous']){
  mocks.viewer.mockResolvedValue({role});
  expect((await savePracticeCode(217,'code')).ok).toBe(false);
  expect((await savePracticeAttempt(attempt)).ok).toBe(false);
  expect((await saveQuestionNotes(217,'note')).ok).toBe(false);
 }
 expect(mocks.upsert).not.toHaveBeenCalled();
});
it('attempt retries use the stable ID and never overwrite separately saved code',async()=>{
 await savePracticeAttempt(attempt);await savePracticeAttempt(attempt);
 expect(mocks.from.mock.calls.map(c=>c[0])).toEqual(['practice_attempts','practice_attempts']);
 expect(mocks.upsert).toHaveBeenNthCalledWith(2,{...attempt,user_id:'owner-id'},{onConflict:'user_id,id'});
});
it('validates inputs and returns a safe failure when data is unavailable',async()=>{
 expect((await savePracticeCode(99999,'x')).ok).toBe(false);
 expect((await savePracticeCode(217,'x'.repeat(100001))).ok).toBe(false);
 expect((await savePracticeAttempt({...attempt,passed:4,total:2})).ok).toBe(false);
 expect((await saveQuestionNotes(217,'x'.repeat(200001))).ok).toBe(false);
 expect(mocks.upsert).not.toHaveBeenCalled();
 mocks.save.mockRejectedValue(new Error('offline'));
 expect((await savePracticeCode(217,'x')).ok).toBe(false);
 mocks.note.mockRejectedValue(new Error('offline'));
 expect((await loadPracticeData(217)).ok).toBe(false);
});

it('signed-in member saves only own code/attempts, while shared notes stay owner-only',async()=>{
 mocks.viewer.mockResolvedValue({role:'member',id:'member-id'});
 expect((await savePracticeCode(217,'My code')).ok).toBe(true);expect((await savePracticeAttempt(attempt)).ok).toBe(true);
 expect(mocks.upsert.mock.calls.every(([row])=>row.user_id==='member-id')).toBe(true);
 expect((await saveQuestionNotes(217,'No')).ok).toBe(false);
});
