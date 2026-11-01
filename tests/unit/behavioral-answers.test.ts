import { it,expect } from 'vitest';
import { QUESTIONS,THEMES,SETS } from '@/lib/behavioral/questions';
import { coverage,emptyAnswer,answerSchema } from '@/lib/behavioral/answers';
const id='00000000-0000-4000-8000-000000000001';
it('catalog has unique stable IDs and covers all required themes and sets',()=>{
 expect(new Set(QUESTIONS.map(q=>q.id)).size).toBe(QUESTIONS.length);
 for(const t of THEMES)expect(QUESTIONS.some(q=>q.theme===t)).toBe(true);
 for(const s of SETS)expect(QUESTIONS.some(q=>q.set===s)).toBe(true);
 expect(QUESTIONS.every(q=>/^[a-z0-9-]{1,80}$/.test(q.id))).toBe(true);
});
it('counts each question once, even when it maps two stories, and ignores blank or stale mappings',()=>{
 const a={...emptyAnswer('g-disagree'),primary_story_id:id,secondary_story_id:'00000000-0000-4000-8000-000000000002'};
 expect(coverage([a],[id,a.secondary_story_id]).find(c=>c.theme==='Conflict')?.mapped).toBe(1);
 expect(coverage([a],[]).every(c=>c.mapped===0)).toBe(true);
 expect(coverage([{...emptyAnswer('g-disagree'),outline:'Only text'}],[id]).every(c=>c.mapped===0)).toBe(true);
 expect(coverage([],[id]).reduce((n,c)=>n+c.total,0)).toBe(QUESTIONS.length);
});
it('validates known questions, distinct story IDs and bounded answer text',()=>{
 expect(answerSchema.safeParse(emptyAnswer('g-disagree')).success).toBe(true);
 for(const a of [{...emptyAnswer('unknown')},{...emptyAnswer('g-disagree'),primary_story_id:'bad'},{...emptyAnswer('g-disagree'),primary_story_id:id,secondary_story_id:id},{...emptyAnswer('g-disagree'),outline:'x'.repeat(20001)},{...emptyAnswer('g-disagree'),followups:'x'.repeat(10001)}])expect(answerSchema.safeParse(a).success).toBe(false);
});
