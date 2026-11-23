'use client';
import {useEffect,useMemo,useState} from 'react';
import {Markdown} from '@/components/markdown';
import {ProjectDiagram} from '@/components/projects/project-diagram';
import {plainHeading,splitSolution,tocFromMarkdown,type TableSchema,type TableSchemaResult,type TocItem} from '@/lib/interview/system-design';
export const headingDomId=(id:string)=>`sd-${id}`;
interface HastNode{type:string;tagName?:string;value?:string;properties?:Record<string,unknown>;children?:HastNode[]}
/** Gives each `##` heading the id the "On this page" list links to; matches by text so setext headings cannot shift ids. */
function rehypeHeadingIds(items:TocItem[]){
 return ()=>(tree:HastNode)=>{
  const used=new Set<string>();const text=(n:HastNode):string=>n.type==='text'?n.value??'':(n.children??[]).map(text).join('');
  const walk=(n:HastNode)=>{if(n.type==='element'&&n.tagName==='h2'){const t=plainHeading(text(n));const item=items.find(i=>!used.has(i.id)&&i.text===t);if(item){used.add(item.id);n.properties={...n.properties,id:headingDomId(item.id)};}}for(const c of n.children??[])walk(c);};
  walk(tree);
 };
}
export function TableSchemaCard({schema}:{schema:TableSchema}){
 return <figure className="iv-sd-schema" data-table-schema={schema.table}><figcaption><span>TABLE</span><b>{schema.table}</b></figcaption>
  <table><thead><tr><th scope="col">Column</th><th scope="col">Type</th><th scope="col">Key</th></tr></thead><tbody>{schema.columns.map(c=><tr key={c.name}><th scope="row">{c.name}{c.note?<small>{c.note}</small>:null}</th><td>{c.type}</td><td>{c.pk?<span className="iv-sd-pk" title="Primary key">PK</span>:null}</td></tr>)}</tbody></table>
  {schema.note?<p>{schema.note}</p>:null}</figure>;
}
const SchemaOrError=({result}:{result:TableSchemaResult})=>result.ok?<TableSchemaCard schema={result.schema}/>:<p className="iv-sd-block-error" role="note">{result.message}</p>;
export function SolutionView({markdown,toc}:{markdown:string;toc:TocItem[]}){
 const blocks=useMemo(()=>splitSolution(markdown),[markdown]);
 if(!markdown.trim())return <p className="iv-sd-empty">The solution for this question has not been written yet.</p>;
 let offset=0;
 return <div className="iv-sd-solution">{blocks.map((b,i)=>{
  if(b.kind==='table-schema')return <SchemaOrError key={i} result={b.result}/>;
  if(b.kind==='diagram')return b.diagram?<div className="iv-sd-diagram" key={i}><ProjectDiagram diagram={b.diagram}/></div>:<p className="iv-sd-block-error" role="note" key={i}>{b.message}</p>;
  const count=tocFromMarkdown(b.text).length;const slice=toc.slice(offset,offset+count);offset+=count;
  return <Markdown key={i} text={b.text} rehypePlugins={slice.length?[rehypeHeadingIds(slice)]:undefined}/>;
 })}</div>;
}
/** The nearest ancestor that actually scrolls (the workspace pane in the shell), else the window. */
export function scrollParentOf(el:HTMLElement|null):HTMLElement|Window{
 for(let n=el?.parentElement;n;n=n.parentElement){const o=getComputedStyle(n).overflowY;if(o==='auto'||o==='scroll')return n;}
 return window;
}
export function useActiveHeading(items:TocItem[]){
 const [active,setActive]=useState(items[0]?.id??'');const key=items.map(i=>i.id).join('|');
 useEffect(()=>{
  const ids=key?key.split('|'):[];if(!ids.length)return;
  const parent=scrollParentOf(document.getElementById(headingDomId(ids[0])));let frame=0;
  const compute=()=>{const base=parent===window?0:(parent as HTMLElement).getBoundingClientRect().top;let current=ids[0];for(const id of ids){const el=document.getElementById(headingDomId(id));if(el&&el.getBoundingClientRect().top-base<=150)current=id;}setActive(current);};
  const on=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(compute);};
  compute();parent.addEventListener('scroll',on,{passive:true});window.addEventListener('resize',on);
  return()=>{cancelAnimationFrame(frame);parent.removeEventListener('scroll',on);window.removeEventListener('resize',on);};
 },[key]);
 return [active,setActive] as const;
}
export function goToHeading(id:string,smooth:boolean){
 const el=document.getElementById(headingDomId(id));if(!el)return;
 el.scrollIntoView({block:'start',behavior:smooth?'smooth':'auto'});
 try{history.replaceState(null,'','#'+headingDomId(id));}catch{/* The hash is only a convenience. */}
}
export function backToTop(anchor:HTMLElement|null,smooth:boolean){
 const parent=scrollParentOf(anchor);const behavior=smooth?'smooth':'auto';
 if(parent===window)window.scrollTo({top:0,behavior});else (parent as HTMLElement).scrollTo({top:0,behavior});
}
export const prefersReducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
