import { test, expect, type Page } from "@playwright/test";
import { problemByNumber } from "../../lib/practice/catalog";

async function workerRequest(page:Page,message:unknown) {
 return page.evaluate(message=>new Promise<any>((resolve,reject)=>{
  const worker=new Worker('/runner/worker.mjs',{type:'module'});
  const timer=setTimeout(()=>{worker.terminate();reject(new Error('Worker did not finish'));},60000);
  worker.onerror=()=>{clearTimeout(timer);worker.terminate();reject(new Error('Worker failed'));};
  worker.onmessage=({data})=>{
   if(data.type==='ready')worker.postMessage(message);
   else if(['done','probe','crash'].includes(data.type)){clearTimeout(timer);worker.terminate();resolve(data);}
  };
 }),message);
}

test('real Pyodide runs algorithm, linked-list and design problems in the browser',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Runtime is identical at both viewport sizes');
 test.setTimeout(120000);
 await page.goto('/privacy');
 for(const lc of [217,206,155]){
  const p=problemByNumber(lc)!;
  const result=await workerRequest(page,{type:'run',code:p.solution,method:p.method,tests:p.tests.map(t=>({...t,kind:'functional'})),extra:{prelude:p.prelude,driver:p.driver}});
  expect(result.type,JSON.stringify(result)).toBe('done');
  expect(result.out.compile_error).toBeNull();
  expect(result.out.results.length).toBe(p.tests.length);
  expect(result.out.results.every((r:any)=>r.status==='pass')).toBe(true);
 }
});

test('browser runner reports compile errors and blocks network APIs',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Runtime is identical at both viewport sizes');
 test.setTimeout(120000);
 await page.goto('/privacy');
 const broken=await workerRequest(page,{type:'run',code:'def invalid syntax!',method:'run',tests:[]});
 expect(broken.out.compile_error).toContain('SyntaxError');
 const probe=await workerRequest(page,{type:'probe'});
 expect(Object.values(probe.probe).every(v=>v==='blocked')).toBe(true);
 const blocked=await workerRequest(page,{type:'run',code:'import js\nclass Solution:\n    def run(self): return 1',method:'run',tests:[]});
 expect(blocked.out.compile_error).toContain('not available');
});

test('worker response carries its own restrictive CSP',async({request})=>{
 const response=await request.get('/runner/worker.mjs');
 expect(response.ok()).toBe(true);
 const csp=response.headers()['content-security-policy'];
 expect(csp).toContain("default-src 'none'");
 expect(csp).toContain("connect-src 'self'");
 expect(csp).toContain("worker-src 'none'");
});
