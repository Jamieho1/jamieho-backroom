/**
 * Dedicated Web Worker for SQL practice. PGlite (Postgres compiled to WebAssembly) is imported dynamically in here,
 * so it never reaches the page bundle; its wasm and data files are self-hosted under /pglite (scripts/copy-pglite.mjs).
 * Nothing leaves the browser: the worker only talks to the page that spawned it.
 */
import {runSqlTest,type SqlDbLike} from './sql-engine';

interface Scope{postMessage(message:unknown):void;onmessage:((event:{data:unknown})=>void)|null;location:{origin:string}}
const scope=self as unknown as Scope;
const ASSETS='/pglite';

async function load(path:string){
 const response=await fetch(`${scope.location.origin}${ASSETS}/${path}`);
 if(!response.ok)throw new Error(`Could not load ${path} (${response.status}).`);
 return response;
}
async function start():Promise<SqlDbLike>{
 const [{PGlite},pgliteWasm,initdbWasm,bundle]=await Promise.all([
  import('@electric-sql/pglite'),
  load('pglite.wasm').then(r=>r.arrayBuffer()).then(b=>WebAssembly.compile(b)),
  load('initdb.wasm').then(r=>r.arrayBuffer()).then(b=>WebAssembly.compile(b)),
  load('pglite.data').then(r=>r.blob()),
 ]);
 const db=await PGlite.create({pgliteWasmModule:pgliteWasm,initdbWasmModule:initdbWasm,fsBundle:bundle});
 return db as unknown as SqlDbLike;
}
const database=start();
database.then(()=>scope.postMessage({type:'ready'}),error=>scope.postMessage({type:'crash',error:error instanceof Error?error.message:'PostgreSQL could not be loaded.'}));
// One query at a time; PGlite is single-threaded and the page sends the next test only after a reply.
scope.onmessage=async({data})=>{
 const message=data as {type?:string;id?:number;setup?:string;query?:string;rowCap?:number};
 if(message?.type!=='run'||typeof message.setup!=='string'||typeof message.query!=='string')return;
 try{
  const db=await database;
  const execution=await runSqlTest(db,{setup:message.setup,query:message.query,rowCap:message.rowCap});
  scope.postMessage({type:'result',id:message.id,execution});
 }catch(error){scope.postMessage({type:'crash',error:error instanceof Error?error.message:'The query could not be run.'});}
};
