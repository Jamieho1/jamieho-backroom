import type {SupabaseClient} from '@supabase/supabase-js';
import {isGuideTable,questionSchema,themeSchema,questionHref,type BehavioralTheme,type GuideQuestion} from '@/lib/interview/behavioral';
import type {ContentOperation} from './allowlist';
export interface BehavioralPreview{themes:BehavioralTheme[];questions:GuideQuestion[]}
export function behavioralTargets(operations:ContentOperation[]){return operations.filter(op=>isGuideTable(op.table)).map(op=>({href:op.table==='interview_behavioral_questions'?questionHref(op.key):'/interview/behavioral',label:'Preview Behavioral guide'}));}
export async function loadBehavioralPreview(sb:SupabaseClient,operations:ContentOperation[]):Promise<BehavioralPreview|undefined>{
 const ops=operations.filter(op=>isGuideTable(op.table));if(!ops.length)return;
 const [t,q]=await Promise.all([sb.from('interview_behavioral_themes').select('*'),sb.from('interview_behavioral_questions').select('*')]);if(t.error||q.error)throw Error('Behavioral guides unavailable.');
 const themes=new Map<string,BehavioralTheme>((t.data??[]).map(t=>[t.id,t]));const questions=new Map<string,GuideQuestion>((q.data??[]).map(q=>[q.id,q]));
 for(const op of ops){if(!isGuideTable(op.table))continue;const theme=op.table==='interview_behavioral_themes';const rows=theme?themes:questions;const current=rows.get(String(op.key));if(op.op==='insert'&&current||op.op==='update'&&!current)throw Error('Guide is missing or already exists.');
 const next={...(current??(theme?{}:{looking_for:'',talk_about:'',star:'',mistakes:'',followups:'',sample:'',sort:0,published:true})),...op.fields,id:op.key};
 if(theme)themes.set(String(op.key),themeSchema.parse(next));else{const row=questionSchema.parse(next);if(!themes.has(row.theme_id))throw Error('Choose an existing theme.');questions.set(String(op.key),{...row,draftChanged:true});}
 }
 return {themes:[...themes.values()].sort((a,b)=>a.sort-b.sort),questions:[...questions.values()].filter(q=>q.published).sort((a,b)=>a.sort-b.sort)};
}
