import type {ProjectSummary} from "@/lib/project-view";
import {hostOf} from "@/lib/project-view";
import {screenshotAspect} from "@/lib/screenshot-geometry";
import {TitleCard} from "./title-card";
import type {CSSProperties} from "react";

/**
 * Browser frame for a project on the index: its screenshots side by side (two shown when there are two or more),
 * or the generated title card when there are none. Screenshots are shown whole (never cropped): one shot sets the frame to
 * its aspect ratio, two sit in a wider band. Reuses the shared .browser-frame traffic-light chrome.
 */
export function ProjectFrame({project,n,total}:{project:ProjectSummary;n:number;total:number}){
 const shots=project.screenshots.slice(0,2),host=project.url?hostOf(project.url):"";
 return <div className="browser-frame">
  <div className="browser-traffic-lights" aria-hidden="true"><i/><i/><i/>{host?<span className="pj-burl">{host}</span>:null}</div>
  <div className={`pj-screen${shots.length?"":" is-card"}`} data-shots={shots.length} style={shots.length===1?{"--shot-aspect":Math.max(1.3,Math.min(2.2,screenshotAspect(project.slug)))} as CSSProperties:undefined}>
   {shots.length?shots.map((src,i)=><div className="pj-shot" key={src}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={`${project.name} screenshot ${i+1}`} loading="lazy"/></div>):<TitleCard n={n} total={total} name={project.name} tags={project.tags}/>}
  </div>
 </div>;
}
