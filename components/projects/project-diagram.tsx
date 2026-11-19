"use client";
import {useMemo} from "react";
import {DiagramFigure,ShapeTree} from "@/components/diagram";
import {layoutDesktop,layoutMobile,type ProjectDiagram as Diagram} from "@/lib/project-diagram";

/** "How it works": the project's validated nodes/edges drawn by the same figure component as What I build. */
export function ProjectDiagram({diagram}:{diagram:Diagram}){
 const layouts=useMemo(()=>({wide:layoutDesktop(diagram),narrow:layoutMobile(diagram)}),[diagram]);
 return <DiagramFigure reveal fig="FIG 01" title={diagram.title} caption={diagram.caption||undefined} figureProps={{"data-project-diagram":"true"}}>
  {prefix=><><div className="pj-dd"><ShapeTree shape={layouts.wide.svg} prefix={prefix}/></div><div className="pj-dm"><ShapeTree shape={layouts.narrow.svg} prefix={prefix}/></div></>}
 </DiagramFigure>;
}
