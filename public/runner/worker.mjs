// Browser-only runner, adapted from Interview Prep. One fresh worker for each run.
import { loadPyodide } from "/pyodide/pyodide.mjs";
const realFetch = self.fetch.bind(self);
let output = "";
const ready = (async () => {
  const py = await loadPyodide({ indexURL: "/pyodide/" });
  const response = await realFetch("/runner/harness.py");
  if (!response.ok) throw new Error("The Python test runner could not be loaded");
  py.runPython(await response.text());
  py.setStdout({ batched: text => { if (output.length < 16000) output += text.slice(0, 16000 - output.length) + "\n"; } });
  py.setStderr({ batched: text => { if (output.length < 16000) output += text.slice(0, 16000 - output.length) + "\n"; } });
  return py;
})();
ready.then(py => self.postMessage({type:"ready", version:py.version}), err => self.postMessage({type:"crash", error:"Python didn't load: " + String(err?.message ?? err).slice(0,400)}));
const NET = ["fetch","XMLHttpRequest","WebSocket","EventSource","importScripts","WebTransport","BroadcastChannel","indexedDB","caches","Worker","SharedWorker"];
function lockDown() {
  for (const name of NET) {
    try { Object.defineProperty(self,name,{configurable:false,get(){throw new Error(name + " is disabled in the practice sandbox");}}); }
    catch { /* already locked */ }
  }
}
self.onmessage = async ({data:message}) => {
  try {
    const py = await ready;
    lockDown();
    if (message.type === "probe") {
      const probe={};
      for(const name of NET){try{probe[name]=typeof self[name];}catch{probe[name]="blocked";}}
      self.postMessage({type:"probe",probe}); return;
    }
    if (message.type !== "run") return;
    output="";
    const fn = py.globals.get("run_tests");
    try {
      const out=JSON.parse(fn(message.code,message.method,JSON.stringify(message.tests),JSON.stringify(message.extra ?? {})));
      self.postMessage({type:"done",out,stdout:output});
    } finally { fn.destroy(); }
  } catch(err) { self.postMessage({type:"crash",error:String(err?.message ?? err).slice(0,500)}); }
};
