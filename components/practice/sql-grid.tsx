import type {SqlCell} from '@/lib/practice/sql-types';
export interface GridRow{cells:readonly SqlCell[];ok?:boolean}
const show=(cell:SqlCell)=>cell===null?<em className="sql-null">NULL</em>:typeof cell==='boolean'?String(cell):String(cell);
/** A small result or sample-data grid. `ok:false` rows are highlighted (diff view); rows without `ok` are plain. */
export function SqlGrid({caption,columns,rows,label}:{caption?:string;columns:readonly string[];rows:readonly GridRow[];label?:string}){
 return <figure className="sql-grid" aria-label={label??caption}>{caption?<figcaption>{caption}</figcaption>:null}
  <div className="sql-grid-scroll" tabIndex={0}><table><thead><tr>{columns.map((c,i)=><th scope="col" key={i}>{c}</th>)}</tr></thead>
   <tbody>{rows.length?rows.map((r,i)=><tr key={i} data-mismatch={r.ok===false||undefined}>{r.cells.map((c,j)=><td key={j} data-null={c===null||undefined}>{show(c)}</td>)}</tr>):<tr><td className="sql-grid-empty" colSpan={Math.max(1,columns.length)}>No rows</td></tr>}</tbody></table></div></figure>;
}
