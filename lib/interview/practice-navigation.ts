import {PRACTICE_LIST,problemByNumber} from '@/lib/practice/catalog';
import {sectionTopics} from './content';
import type {Anchor} from '@/lib/notes/neetcode150';
/** Follow section topic order, then the catalogue order within each topic. */
export function practiceNavigation(id:number,catalogue:readonly Anchor[]=PRACTICE_LIST){
 const current=catalogue.find(p=>p.lc===id);
 const section=current?.topic==='class-design'?'low-level-design':'dsa';
 const topics=sectionTopics(section);
 const questions=topics.flatMap(t=>catalogue.filter(p=>p.topic===t.id));
 const index=questions.findIndex(p=>p.lc===id);
 return {section,topics,questions,current,topicLabel:topics.find(t=>t.id===current?.topic)?.label??'Questions',previous:index>0?questions[index-1]:undefined,next:index>=0?questions[index+1]:undefined};
}

/** Shared concepts cross sections; question navigation/list homes remain independent. */
export function relatedQuestions(id:number){
 const current=problemByNumber(id),home=PRACTICE_LIST.find(p=>p.lc===id);if(!current||!home)return [];
 const sameSection=(topic:string)=>(topic==='class-design')===(home.topic==='class-design');
 return PRACTICE_LIST.filter(p=>p.lc!==id).map((p,index)=>{const other=problemByNumber(p.lc)!;const shared=current.concepts.filter(c=>other.concepts.includes(c)).length;const warmup=current.prerequisites?.includes(String(p.lc))||other.prerequisites?.includes(String(id));return {p,index,shared,warmup,rank:shared?0:p.topic===home.topic?1:sameSection(p.topic)?2:3};}).filter(r=>r.rank<3).sort((a,b)=>a.rank-b.rank||b.shared-a.shared||Number(!!b.warmup)-Number(!!a.warmup)||a.index-b.index).slice(0,5).map(r=>r.p);
}
