'use client';
import {useMemo} from 'react';
import {DiagramFigure,ShapeTree} from '@/components/diagram';
import {layoutDesktop,layoutMobile,type ProjectDiagram} from '@/lib/project-diagram';

/** Solution figures must be fully drawn without relying on the portfolio's stylesheet or scroll animation. */
export function SystemDesignDiagram({diagram}:{diagram:ProjectDiagram}){
 const layouts=useMemo(()=>({wide:layoutDesktop(diagram,4,920,true),medium:layoutDesktop(diagram,2,600,true),narrow:layoutMobile(diagram)}),[diagram]);
 return <div className="iv-sd-diagram"><DiagramFigure fig="FIG 01" title={diagram.title} caption={diagram.caption||undefined} figureProps={{'data-system-design-diagram':'true','data-project-diagram':'true'}}>
 {prefix=><><div className="iv-sd-diagram-wide"><ShapeTree shape={layouts.wide.svg} prefix={prefix}/></div><div className="iv-sd-diagram-medium"><ShapeTree shape={layouts.medium.svg} prefix={prefix}/></div><div className="iv-sd-diagram-narrow"><ShapeTree shape={layouts.narrow.svg} prefix={prefix}/></div></>}
 </DiagramFigure></div>;
}
