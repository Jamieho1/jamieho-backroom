import {Children,cloneElement,isValidElement,type ReactElement,type ReactNode} from "react";
import type { JOURNEY_ICONS } from "@/lib/home-content-schema";
type JourneyIconName = typeof JOURNEY_ICONS[number];
const SHAPES=new Set(["path","circle","rect","line"]);
/** Every drawable shape is normalised to pathLength 1 so one dash pattern draws any icon. */
function normalised(node:ReactNode):ReactNode{
 return Children.map(node,child=>{
  if(!isValidElement(child))return child;
  const el=child as ReactElement<{children?:ReactNode;pathLength?:number}>;
  if(typeof el.type==="string"&&SHAPES.has(el.type))return cloneElement(el,{pathLength:1});
  return el.props.children===undefined?el:cloneElement(el,undefined,normalised(el.props.children));
 });
}
/** Original built-in icons. Most use one 24px grid and one rounded stroke; neural-network keeps its supplied 96px grid. */
const ICONS:Record<JourneyIconName,{box?:number;stroke?:number;body:ReactNode}>={
 "graduation-cap":{body:<><path d="m2 8 10-5 10 5-10 5Z"/><path d="M6 10v7q6 5 12 0v-7M22 8v9"/></>},
 microscope:{body:<><path d="m10 3 5 3-4 7-5-3ZM11 13l-2 4M5 21h15M15 9a6 6 0 0 1 2 11M4 17h8"/><path d="m9 2 2 1M5 10l2 1"/></>},
 "neural-network":{box:96,stroke:3,body:<>
  <g className="edges"><path d="M19.92 25.11L43.08 20.89"/><path d="M19.16 28.77L43.84 45.23"/><path d="M17.75 30.17L45.25 71.83"/><path d="M18.81 44.77L44.19 23.23"/><path d="M20.00 48.00L43.00 48.00"/><path d="M18.81 51.23L44.19 72.77"/><path d="M17.75 65.83L45.25 24.17"/><path d="M19.16 67.23L43.84 50.77"/><path d="M19.92 70.89L43.08 75.11"/><path d="M52.60 21.95L76.40 32.05"/><path d="M51.09 23.93L77.91 58.07"/><path d="M52.60 46.05L76.40 35.95"/><path d="M52.60 49.95L76.40 60.05"/><path d="M51.09 72.07L77.91 37.93"/><path d="M52.60 74.05L76.40 63.95"/></g>
  <g className="nodes"><circle cx="15" cy="26" r="5"/><circle cx="15" cy="48" r="5"/><circle cx="15" cy="70" r="5"/><circle cx="48" cy="20" r="5"/><circle cx="48" cy="48" r="5"/><circle cx="48" cy="76" r="5"/><circle cx="81" cy="34" r="5"/><circle cx="81" cy="62" r="5"/></g></>},
 "streams-plug":{body:<><path d="M2 4h3l5 6M2 12h7M2 20h3l5-6"/><circle cx="11" cy="12" r="2"/><path d="M13 12h3m0-3v6h3l3-2v-2l-3-2Zm3-3v3m0 6v3"/></>},
 code:{body:<><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/></>},
 "heart-hands":{body:<><path d="M12 12 7 8a3 3 0 0 1 5-4 3 3 0 0 1 5 4ZM2 12v7l6 3h8l6-3v-7M2 14l6 3h8l6-3M8 17l-2-4m10 4 2-4"/></>},
 rocket:{body:<><path d="M9 15c-1-6 4-12 12-12 0 8-6 13-12 12ZM9 9H5l-3 6h7m6 0v4l-6 3v-7M6 18l-3 3"/><circle cx="16" cy="8" r="2"/></>},
 briefcase:{body:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V3h8v4M2 12q10 6 20 0M10 13h4v4h-4Z"/></>},
};
export function ExperienceIcon({name}:{name:JourneyIconName}){
 const icon=ICONS[name],box=icon.box??24;
 return <svg viewBox={`0 0 ${box} ${box}`} fill="none" stroke="currentColor" strokeWidth={icon.stroke??1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{normalised(icon.body)}</svg>;
}
