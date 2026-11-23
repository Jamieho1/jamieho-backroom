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
 const running=runner.run({...problem,tests:problem.tests.slice(0,2)},'code','submit');await Promise.resolve();
 expect(w.postMessage).toHaveBeenCalledWith(expect.objectContaining({code:'code',type:'run'}));
 w.message({type:'done',out:{results:[{status:'pass'}]}});w.message({type:'done',out:{results:[{status:'fail'}]}});
 expect(await running).toMatchObject({status:'ok',passed:1,total:2});expect(w.terminated).toBe(true);
 const next=runner.warmUp();expect(FakeWorker.workers).toHaveLength(2);FakeWorker.workers[1].message({type:'ready'});await next;runner.dispose();
});
it('terminates an infinite run at the deadline',async()=>{
 vi.useFakeTimers();const runner=new PythonRunner();const ready=runner.warmUp();const w=FakeWorker.workers[0];w.message({type:'ready'});await ready;
 const running=runner.run(problem,'while True: pass','run',100);await Promise.resolve();await vi.advanceTimersByTimeAsync(101);
 expect(await running).toMatchObject({status:'timeout',afterMs:100,results:[{status:'too_slow',error:'Time limit exceeded'}]});expect(w.terminated).toBe(true);runner.dispose();
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

it('gives each case a new deadline and ignores custom cases on Submit',async()=>{
 vi.useFakeTimers();const runner=new PythonRunner();const ready=runner.warmUp();const w=FakeWorker.workers[0];w.message({type:'ready'});await ready;
 const running=runner.run({...problem,tests:problem.tests.slice(0,2)},'code','submit',100,[{id:'custom',input:'[]',expected:'',visible:true}]);await Promise.resolve();
 await vi.advanceTimersByTimeAsync(90);w.message({type:'done',out:{results:[{status:'pass'}]},stdout:'one'});await vi.advanceTimersByTimeAsync(90);expect(w.terminated).toBe(false);await vi.advanceTimersByTimeAsync(11);
 expect(await running).toMatchObject({status:'timeout',results:[{status:'pass',stdout:'one'},{status:'too_slow'}]});expect(w.postMessage.mock.calls[0][0].tests[0].id).not.toBe('custom');runner.dispose();
});
it('Run sends editable class sequences and records snapshot inputs/stdout/browser timing',async()=>{
 const runner=new PythonRunner();const ready=runner.warmUp();const w=FakeWorker.workers[0];w.message({type:'ready'});await ready;
 const p=problemByNumber(146)!;const test={...p.tests[0],id:'custom-example'};const running=runner.run(p,'code','run',5000,[test]);await Promise.resolve();
 expect(w.postMessage).toHaveBeenCalledWith(expect.objectContaining({extra:expect.objectContaining({className:'LRUCache'}),tests:[expect.objectContaining({id:'custom-example',operations:test.operations})]}));
 w.message({type:'done',out:{results:[{status:'pass',got:'[null]'}]},stdout:'printed'});expect(await running).toMatchObject({status:'ok',total:1,results:[{input:expect.stringContaining('operations'),stdout:'printed',ms:expect.any(Number)}],ms:expect.any(Number)});runner.dispose();
});
