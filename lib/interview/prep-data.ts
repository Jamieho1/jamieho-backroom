import {getInterviewNotes} from './notes';
import {getBehavioralData} from './behavioral-data';
import {isAnswered} from './behavioral';
import type {PrepContext} from './prep';
/** Request-scoped: note titles and answered counts depend on the viewer; visitors get neither. Never cache across viewers. */
export async function getPrepContext(preview=false):Promise<PrepContext>{
 const [notes,behavioral]=await Promise.all([getInterviewNotes(),getBehavioralData()]);
 const all=[...behavioral.questions,...behavioral.custom];const signedIn=notes.viewer.role!=='anonymous'&&!!behavioral.userId&&!preview&&!behavioral.error;
 return {
  notes:notes.notes.map(n=>({id:n.id,title:n.title})),
  themes:behavioral.themes.map(t=>{const own=all.filter(q=>q.theme_id===t.id);return {id:t.id,title:t.title,total:own.length,answered:signedIn?own.filter(q=>isAnswered(behavioral.answers.find(a=>a.question_id===q.id))).length:undefined};}),
 };
}
