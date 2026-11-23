import {z} from 'zod';
import {ClassSequence,type ArenaProblem,type ArenaTest} from './types';
export const EditableCase=z.object({id:z.string().regex(/^(visible:[A-Za-z0-9_-]{1,60}|custom:[0-9a-f-]{36})$/i),inputs:z.array(z.string().max(10000)).min(1).max(20)}).strict();
export const PracticeCases=z.array(EditableCase).max(20).refine(rows=>new Set(rows.map(r=>r.id)).size===rows.length,{message:'Case IDs must be unique.'}).refine(rows=>JSON.stringify(rows).length<=100000,{message:'Keep test cases under 100,000 characters.'});
export type EditableCase=z.infer<typeof EditableCase>;
/** Split a positional-argument expression without evaluating Python on the server or in JS. */
export function splitArguments(input:string){
 const inner=input.trim().replace(/^\[/,'').replace(/\]$/,'');const values:string[]=[];let start=0,depth=0,quote='',escape=false;
 for(let i=0;i<inner.length;i++){const c=inner[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}if(c==='"'||c==="'"){quote=c;continue;}if('[({'.includes(c))depth++;else if('])}'.includes(c))depth--;else if(c===','&&depth===0){values.push(inner.slice(start,i).trim());start=i+1;}}
 if(inner.slice(start).trim())values.push(inner.slice(start).trim());return values;
}
export function inputLabels(p:ArenaProblem){if(p.kind==='class_design')return ['operations','arguments'];const escaped=p.method.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const signature=p.signature.match(new RegExp('def '+escaped+'\\(([^)]*)\\)'))?.[1]??'';return splitArguments('['+signature+']').filter(x=>x!=='self').map(x=>x.split(':')[0].split('=')[0].trim());}
export function visibleCases(p:ArenaProblem):EditableCase[]{return p.tests.filter(t=>t.visible).map(t=>({id:'visible:'+t.id,inputs:t.operations?[JSON.stringify(t.operations),JSON.stringify(t.arguments)]:splitArguments(t.input)}));}
export function mergedCases(p:ArenaProblem,stored:EditableCase[]){const base=visibleCases(p);return [...base.map(c=>stored.find(s=>s.id===c.id&&s.inputs.length===c.inputs.length)??c),...stored.filter(c=>c.id.startsWith('custom:')&&c.inputs.length===(base[0]?.inputs.length??inputLabels(p).length))].slice(0,20);}
export function casesToTests(p:ArenaProblem,cases:EditableCase[]):ArenaTest[]{
 const parsed=PracticeCases.parse(cases);const base=visibleCases(p);
 return parsed.map(c=>{const match=base.find(b=>JSON.stringify(b.inputs.map(x=>x.trim()))===JSON.stringify(c.inputs.map(x=>x.trim())));const expected=match?p.tests.find(t=>'visible:'+t.id===match.id)?.expected??'':'';
  if(p.tests.some(t=>t.operations)){const sequence=ClassSequence.parse({operations:JSON.parse(c.inputs[0]),arguments:JSON.parse(c.inputs[1])});if(sequence.operations[0]!==p.method)throw Error('The first operation must be '+p.method+'.');return {id:c.id,input:JSON.stringify([sequence.operations,sequence.arguments]),...sequence,expected,visible:true};}
  if(c.inputs.length!==inputLabels(p).length)throw Error('Provide each named input.');return {id:c.id,input:'['+c.inputs.join(', ')+']',expected,visible:true};
 });
}
