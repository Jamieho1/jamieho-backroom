/**
 * Result comparison for SQL practice. Columns must match in count, order and name (case-insensitive); values are
 * normalised first (numbers to 4 decimals, timestamps to ISO, NULL distinct from the text "NULL"); rows are compared
 * as a multiset unless the question asks for an order.
 */
import type {SqlCell,SqlGrid} from './sql-types';

export type ResultCell=SqlCell|bigint|Date|undefined;
export const NUMBER_DECIMALS=4;
const TIMESTAMP=/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}(:?\d{2})?)?$/;

/** Canonical text for a cell; two cells are equal when these strings are equal. */
export function normaliseCell(value:ResultCell):string{
 if(value===null||value===undefined)return 'null';
 if(typeof value==='boolean')return `b:${value}`;
 if(typeof value==='bigint')return `n:${value.toString()}`;
 if(typeof value==='number'){
  if(!Number.isFinite(value))return `n:${value}`;
  const fixed=Number(value.toFixed(NUMBER_DECIMALS));return `n:${Object.is(fixed,-0)?0:fixed}`;
 }
 if(value instanceof Date)return Number.isNaN(value.getTime())?'s:Invalid Date':`s:${value.toISOString()}`;
 if(TIMESTAMP.test(value)){
  const withZone=/(Z|[+-]\d{2}(:?\d{2})?)$/.test(value)?value:value+'Z';
  const parsed=new Date(withZone.replace(' ','T'));
  if(!Number.isNaN(parsed.getTime()))return `s:${parsed.toISOString()}`;
 }
 return `s:${value}`;
}
const rowKey=(row:readonly ResultCell[])=>JSON.stringify(row.map(normaliseCell));

export interface RowMark{cells:SqlCell[];ok:boolean}
export interface Comparison{
 pass:boolean;
 columnsOk:boolean;
 /** Why a failing result failed, in plain words. */
 summary:string;
 expected:{columns:string[];rows:RowMark[]};
 actual:{columns:string[];rows:RowMark[]};
}
const plain=(cell:ResultCell):SqlCell=>cell===undefined?null:typeof cell==='bigint'?cell.toString():cell instanceof Date?cell.toISOString():cell;

export function compareResults(expected:SqlGrid,actual:{columns:readonly string[];rows:readonly (readonly ResultCell[])[]},ordered:boolean):Comparison{
 const names=(list:readonly string[])=>list.map(n=>n.toLowerCase());
 const columnsOk=expected.columns.length===actual.columns.length&&names(expected.columns).every((n,i)=>n===names(actual.columns)[i]);
 const expectedMarks:RowMark[]=expected.rows.map(r=>({cells:r.map(plain),ok:false}));
 const actualMarks:RowMark[]=actual.rows.map(r=>({cells:r.map(plain),ok:false}));
 if(columnsOk){
  if(ordered){
   const limit=Math.min(expected.rows.length,actual.rows.length);
   for(let i=0;i<limit;i++)if(rowKey(expected.rows[i])===rowKey(actual.rows[i])){expectedMarks[i].ok=true;actualMarks[i].ok=true;}
  }else{
   const pool=new Map<string,number[]>();
   expected.rows.forEach((r,i)=>{const key=rowKey(r);pool.set(key,[...(pool.get(key)??[]),i]);});
   actual.rows.forEach((r,i)=>{const hit=pool.get(rowKey(r));const index=hit?.shift();if(index!==undefined){expectedMarks[index].ok=true;actualMarks[i].ok=true;}});
  }
 }
 const rowsOk=columnsOk&&expectedMarks.every(m=>m.ok)&&actualMarks.every(m=>m.ok)&&expected.rows.length===actual.rows.length;
 const pass=columnsOk&&rowsOk;
 let summary='Your result matches the expected result.';
 if(!columnsOk)summary=expected.columns.length!==actual.columns.length?`Expected ${expected.columns.length} column${expected.columns.length===1?'':'s'} but your query returned ${actual.columns.length}.`:'The column names or their order differ from the expected result.';
 else if(!pass){
  const missing=expectedMarks.filter(m=>!m.ok).length,extra=actualMarks.filter(m=>!m.ok).length;
  summary=ordered&&missing===extra&&missing>0&&expected.rows.length===actual.rows.length?'The rows are not the same or not in the required order.':`${missing} expected row${missing===1?' is':'s are'} missing and ${extra} returned row${extra===1?' is':'s are'} unexpected.`;
 }
 return {pass,columnsOk,summary,expected:{columns:[...expected.columns],rows:expectedMarks},actual:{columns:[...actual.columns],rows:actualMarks}};
}
