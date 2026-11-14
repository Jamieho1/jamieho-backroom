import {InterviewIcon} from './icons';
import type {InterviewSection} from '@/lib/interview/navigation';
export function InterviewPlaceholder({section,title}:{section:InterviewSection;title?:string}){
 return <article className="iv-placeholder"><div className="iv-placeholder-mark" style={{color:section.color}}><InterviewIcon name={section.id}/></div><span className="iv-soon">Soon</span><h1>{title??section.label}</h1><p>This workspace is coming soon. Your interview preparation will live here.</p></article>;
}
