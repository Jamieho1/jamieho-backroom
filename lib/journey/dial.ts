import type {ExperienceRow} from "@/lib/experience";
import type {Project} from "@/lib/portfolio-core";
import {sortProjects} from "@/lib/portfolio-core";
import {clamp01,smoothstep} from "./timeline";
export interface DialData {experiences:ExperienceRow[]; projects:Project[]}
export function dialData(experiences:ExperienceRow[],projects:Project[]):DialData {
 return {experiences:experiences.filter(x=>x.public&&x.show_on_journey).map(x=>({...x,experience_bullets:(x.experience_bullets??[]).filter(b=>b.public&&b.text.trim()).sort((a,b)=>a.sort-b.sort).slice(0,3)})),projects:sortProjects(projects.filter(p=>p.public&&p.featured))};
}
export const dialCount=(data:DialData)=>1+data.experiences.length+data.projects.length;
/** Half a step of reading at either end; transitions and screenshot scrub share this single reversible clock. */
export const dialTime=(local:number,count:number)=>Math.max(0,Math.min(Math.max(0,count-1),clamp01(local)*Math.max(1,count)-.5));
export const dialLocal=(step:number,count:number,offset=0)=>(Math.max(0,Math.min(count-1,step))+.5+offset)/Math.max(1,count);
export function dialAnchorStep(id:string,data:DialData){return id==='experience'?Math.min(1,dialCount(data)-1):id==='work'||id==='projects'?Math.min(1+data.experiences.length,dialCount(data)-1):0;}
export function dialAnchorLocal(id:string,data:DialData){return dialLocal(dialAnchorStep(id,data),dialCount(data));}
export const presentEntry=(dates:string)=>/\bpresent\s*$/i.test(dates.trim());
export function coordinates(entry?:Pick<ExperienceRow,'org'|'location'>){const text=entry?entry.org+' '+entry.location:'';return /imperial/i.test(text)?'51.4988° N · 0.1749° W':/hong kong|koln/i.test(text)?'22.3193° N · 114.1694° E':'51.5072° N · 0.1276° W';}
export function capabilityLinks(tags:string[]){const text=tags.join(' ').toLowerCase();return [(/ai|agent|geo/.test(text)?'01 AI engineering':null),(/typescript|react|next|full.?stack/.test(text)?'04 Full-stack':null),(/nlp|machine learning|pytorch/.test(text)?'05 Machine learning':null)].filter((x):x is string=>!!x);}

/** Keep screenshot travel through the final reading hold while text/dial stay at the final stop. */
export const dialShotProgress=(local:number,step:number,count:number)=>smoothstep(-.25,.25,clamp01(local)*Math.max(1,count)-.5-step);
