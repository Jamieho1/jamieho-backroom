import {VARIATIONS} from '@/lib/practice/solutions';
import {PRACTICE_LIST} from '@/lib/practice/catalog';
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

/** Match the Notes concept grouping first, then the topic, then the remaining section order. */
export function relatedQuestions(id:number){
 const {current,questions}=practiceNavigation(id);if(!current)return [];
 const concepts=new Set(VARIATIONS.filter(v=>v.topic===current.topic&&v.problems.includes(id)).flatMap(v=>v.problems));
 return questions.filter(p=>p.lc!==id).map((p,index)=>({p,index,rank:p.topic===current.topic?(concepts.has(p.lc)?0:1):2})).sort((a,b)=>a.rank-b.rank||a.index-b.index).slice(0,5).map(row=>row.p);
}
