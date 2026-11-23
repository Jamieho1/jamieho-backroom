import {PRACTICE_LIST,problemByNumber} from '@/lib/practice/catalog';
import {TOPICS} from '@/lib/notes/topics';
export function buildsOn(id:number){const p=problemByNumber(id),home=PRACTICE_LIST.find(q=>q.lc===id)?.topic;return p?TOPICS.filter(t=>t.id!=='class-design'&&p.concepts.some(c=>c===t.id)&&t.id!==home):[];}
export function prerequisiteQuestions(id:number){const ids=problemByNumber(id)?.prerequisites??[];return ids.flatMap(key=>{const row=PRACTICE_LIST.find(p=>String(p.lc)===key);return row?[row]:[];});}
export function usedInDesign(topic:string){return PRACTICE_LIST.filter(p=>p.topic==='class-design'&&problemByNumber(p.lc)?.concepts.some(c=>c===topic));}
