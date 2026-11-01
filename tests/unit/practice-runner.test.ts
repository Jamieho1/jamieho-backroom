// @vitest-environment jsdom
import { afterEach,beforeEach,expect,it,vi } from "vitest";
import { PythonRunner,selectTests } from "@/lib/practice/runner";
import { problemByNumber } from "@/lib/practice/catalog";
class FakeWorker extends EventTarget {
 static workers:FakeWorker[]=[];
 terminated=false; postMessage=vi.fn();
 constructor(){super();FakeWorker.workers.push(this);}
 terminate(){this.terminated=true;}
 message(data:unknown){this.dispatchEvent(new MessageEvent('message',{data}));}
}
beforeEach(()=>{FakeWorker.workers=[];vi.stubGlobal('Worker',FakeWorker);});
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
const problem=problemByNumber(217)!;
it('Run selects visible examples; Submit selects every case',()=>{
 expect(selectTests(problem.tests,'run').every(t=>t.visible)).toBe(true);
 expect(selectTests(problem.tests,'submit')).toHaveLength(problem.tests.length);
});
it('uses a fresh worker for each run, and returns pass/fail results',async()=>{
 const runner=new PythonRunner();const ready=runner.warmUp();const w=FakeWorker.workers[0];w.message({type:'ready'});await ready;
 const running=runner.run(problem,'code','submit');await Promise.resolve();
 expect(w.postMessage).toHaveBeenCalledWith(expect.objectContaining({code:'code',type:'run'}));
 w.message({type:'done',out:{results:[{id:'one',status:'pass'},{id:'two',status:'fail'}]}});
 expect(await running).toMatchObject({status:'ok',passed:1,total:2});expect(w.terminated).toBe(true);
 const next=runner.warmUp();expect(FakeWorker.workers).toHaveLength(2);FakeWorker.workers[1].message({type:'ready'});await next;runner.dispose();
});
it('terminates an infinite run at the deadline',async()=>{
 vi.useFakeTimers();const runner=new PythonRunner();const ready=runner.warmUp();const w=FakeWorker.workers[0];w.message({type:'ready'});await ready;
 const running=runner.run(problem,'while True: pass','run',100);await Promise.resolve();await vi.advanceTimersByTimeAsync(101);
 expect(await running).toEqual({status:'timeout',afterMs:100});expect(w.terminated).toBe(true);runner.dispose();
});
it('rejects a runtime that cannot load and cleans up on dispose',async()=>{
 const runner=new PythonRunner();const ready=runner.warmUp();FakeWorker.workers[0].message({type:'crash',error:'offline'});
 await expect(ready).rejects.toThrow('offline');runner.dispose();expect(FakeWorker.workers[0].terminated).toBe(true);
});
it('surfaces compile errors and worker crashes',async()=>{
 for(const message of [{type:'done',out:{compile_error:'SyntaxError'}},{type:'crash',error:'worker failed'}]){
  const runner=new PythonRunner();const ready=runner.warmUp();const w=FakeWorker.workers.at(-1)!;w.message({type:'ready'});await ready;
  const running=runner.run(problem,'code','run');await Promise.resolve();w.message(message);
  expect((await running).status).toBe(message.type==='done'?'compile_error':'crash');runner.dispose();
 }
});
