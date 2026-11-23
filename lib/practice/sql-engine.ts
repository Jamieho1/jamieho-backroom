/**
 * Runs one SQL test on a PGlite-shaped database. Shared by the browser worker and the Node tests, so a seeded
 * solution is checked by the same code path a learner uses. Postgres' `statement_timeout` is not honoured by
 * PGlite (there are no signals in WebAssembly), so the 2 s limit is enforced by the caller terminating the worker.
 */
import {guardQuery} from './sql-guard';
import type {ResultCell} from './sql-compare';
import type {SqlCell} from './sql-types';

export const ROW_CAP=1000;
export const STATEMENT_TIMEOUT_MS=2000;
const SCHEMA='sandbox';

export interface SqlDbLike{
 exec(sql:string):Promise<unknown>;
 query(sql:string,params?:unknown[],options?:{rowMode?:'array'|'object'}):Promise<{rows:unknown[];fields:{name:string;dataTypeID:number}[]}>;
}
export type SqlExecution=
 |{ok:true;columns:string[];rows:SqlCell[][]}
 |{ok:false;kind:'rejected'|'error'|'setup'|'cap';message:string;code?:string;position?:string};

const INTEGER_TYPES=new Set([20,21,23,26]);
const FLOAT_TYPES=new Set([700,701,1700]);
const pad=(n:number,w=2)=>String(n).padStart(w,'0');
/** Values reach the comparer as JSON-friendly cells: numbers, text, booleans, ISO dates and NULL. */
export function toCell(value:unknown,typeId:number):SqlCell{
 if(value===null||value===undefined)return null;
 if(typeof value==='bigint')return Number.isSafeInteger(Number(value))?Number(value):value.toString();
 if(typeof value==='number'||typeof value==='boolean')return value;
 if(typeof value==='string'){
  if(INTEGER_TYPES.has(typeId)||FLOAT_TYPES.has(typeId)){const n=Number(value);return Number.isFinite(n)?n:value;}
  return value;
 }
 if(value instanceof Date){
  if(Number.isNaN(value.getTime()))return 'Invalid Date';
  if(typeId===1082)return `${value.getUTCFullYear()}-${pad(value.getUTCMonth()+1)}-${pad(value.getUTCDate())}`;
  return value.toISOString();
 }
 try{return JSON.stringify(value);}catch{return String(value);}
}
interface PgError{message?:string;code?:string;position?:string}
const pgError=(e:unknown):PgError=>e&&typeof e==='object'?e as PgError:{message:String(e)};

export async function runSqlTest(db:SqlDbLike,input:{setup:string;query:string;rowCap?:number}):Promise<SqlExecution>{
 const guard=guardQuery(input.query);
 if(!guard.ok)return {ok:false,kind:'rejected',message:guard.message};
 try{
  await db.exec(`ROLLBACK;DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE;CREATE SCHEMA ${SCHEMA};SET search_path TO ${SCHEMA},pg_catalog;${input.setup}`);
 }catch(e){return {ok:false,kind:'setup',message:`Test setup failed: ${pgError(e).message??'unknown error'}`};}
 const cap=input.rowCap??ROW_CAP;
 try{
  await db.exec('BEGIN READ ONLY');
  const result=await db.query(guard.sql,[],{rowMode:'array'});
  const rows=result.rows as unknown[][];
  if(rows.length>cap)return {ok:false,kind:'cap',message:`The query returned more than ${cap.toLocaleString('en-GB')} rows. Filter or aggregate so it returns fewer rows.`};
  return {ok:true,columns:result.fields.map(f=>f.name),rows:rows.map(r=>r.map((v,i)=>toCell(v,result.fields[i]?.dataTypeID??0)))};
 }catch(e){
  const err=pgError(e);
  return {ok:false,kind:'error',message:err.message??'The query failed.',code:err.code,position:err.position};
 }finally{
  try{await db.exec('ROLLBACK');}catch{/* The next test starts with its own ROLLBACK. */}
 }
}
export type {ResultCell};
