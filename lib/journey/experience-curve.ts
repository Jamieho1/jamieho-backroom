import type { ExperienceRow } from "@/lib/experience";
import type { JOURNEY_ICONS } from "@/lib/home-content-schema";
import { clamp01 } from "./timeline";

export type JourneyIconName = (typeof JOURNEY_ICONS)[number];
export interface ExperienceStop {
  id: string; title: string; org: string; dates: string; icon: JourneyIconName;
  bullets: { text: string; draftChanged?: boolean }[];
  present: boolean; project?: boolean; draftChanged?: boolean;
}
export const isPresent = (dates: string): boolean => /\bpresent\s*$/i.test(dates);
/** Input is the public loader's chronological order. Never mutate its preview snapshot. */
export function experienceStops(rows: readonly ExperienceRow[]): ExperienceStop[] {
  return [...rows.filter(row => row.public && row.show_on_journey).slice(-5).map(row => ({
    id: row.id, title: row.title, org: row.org, dates: row.dates,
    icon: row.journey_icon ?? "briefcase", present: isPresent(row.dates), draftChanged: row.draftChanged,
    bullets: [...(row.experience_bullets ?? [])].filter(b => b.public && b.text.trim())
      .sort((a,b) => a.sort-b.sort || a.id.localeCompare(b.id)).slice(0,3)
      .map(b => ({text:b.text, draftChanged:b.draftChanged})),
  })), {id:"journey-projects", title:"Projects", org:"", dates:"", icon:"rocket", bullets:[], present:false, project:true}];
}
export interface CurvePoint { x:number; y:number; progress:number }
/** Smooth through every stop; horizontal tangents on desktop, vertical tangents on phones. */
export function curvePath(points: readonly CurvePoint[], vertical=false): string {
  if (!points.length) return "";
  return `M ${points[0].x} ${points[0].y}` + points.slice(1).map((p,i) => {
    const a=points[i];
    return vertical ? ` C ${a.x} ${(a.y+p.y)/2} ${p.x} ${(a.y+p.y)/2} ${p.x} ${p.y}`
      : ` C ${(a.x+p.x)/2} ${a.y} ${(a.x+p.x)/2} ${p.y} ${p.x} ${p.y}`;
  }).join("");
}
/** At most six stops including Projects; sparse data stays sparse rather than inventing CV entries. */
export function experienceLayout(count:number, vertical=false, width=1000, rowHeights:readonly number[]=[]){
  const n=Math.min(6,Math.max(1,Math.floor(Number.isFinite(count)?count:1)));
  const w=Number.isFinite(width)&&width>0?width:1000;
  let y=42;
  const points:CurvePoint[]=Array.from({length:n},(_,i)=>{
    const p={x:vertical?w/2+(i%2?-28:28):n===1?w/2:70+i*(w-140)/(n-1),
      y:vertical?y:174+(i%2?42:-42),progress:n===1?0:i/(n-1)};
    y+=Math.max(140,rowHeights[i]??360);return p;
  });
  return {width:w,height:vertical?y-42:300,points,path:curvePath(points,vertical)};
}
const TRAVEL_START=.2, TRAVEL_LENGTH=.72;
/** Inverse of the scroll-driven stop positions, shared by click and keyboard activation. */
export function experienceStopLocal(index:number,count:number){
 return TRAVEL_START+TRAVEL_LENGTH*clamp01(index/Math.max(1,count-1));
}
/** Read each stop in turn; the drawn line reaches its circle before the card changes. */
export function experienceState(local:number,count:number){
  const raw=clamp01((local-TRAVEL_START)/TRAVEL_LENGTH),intervals=Math.max(0,count-1),nearest=Math.round(raw*intervals);
  // Native scrolling is pixel-quantised: snap sub-pixel arrivals symmetrically in both directions.
  const progress=intervals&&Math.abs(raw*intervals-nearest)<.002?nearest/intervals:raw;
  return {progress,current:Math.min(intervals,Math.floor(progress*intervals+1e-6))};
}

/** Same cubic guide as the drawn line. Native SVG arc lengths refine travel in the live view. */
export function experiencePoint(points:readonly CurvePoint[],progress:number):{x:number;y:number}{
 if(!points.length)return {x:0,y:0};
 if(points.length===1)return {x:points[0].x,y:points[0].y};
 const scaled=clamp01(progress)*(points.length-1),i=Math.min(points.length-2,Math.floor(scaled)),t=scaled-i;
 const a=points[i],b=points[i+1],m=(a.x+b.x)/2,u=1-t;
 return {x:u*u*u*a.x+3*u*u*t*m+3*u*t*t*m+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*b.y};
}
export const EXPERIENCE_ART={background:"experience-bg.webp",mascot:"experience-mascot.webp",phone:"experience-phone.webp"} as const;
export const MASCOT_LIFT=44;
