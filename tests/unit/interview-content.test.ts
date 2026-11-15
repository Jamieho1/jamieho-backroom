import {it,expect} from 'vitest';
import {noteSection,sectionTopics,modeHref,noteHref,sectionQuestions} from '@/lib/interview/content';
import {appTargets} from '@/lib/content-drafts/app-overlay';
import {affectedRoutes,validateOperations} from '@/lib/content-drafts/allowlist';
it('assigns imported and future notes deterministically without changing the 17 coding topics',()=>{
 const notes=[{id:'sd-fixture',title:'System design: Synthetic topic'},{id:'class-design',title:'Class design'},{id:'finance-fixture',title:'Finance fixture'},{id:'ai-fixture',title:'AI fixture'}];
 expect(sectionTopics('dsa',notes)).toHaveLength(17);
 expect(sectionTopics('system-design',notes)).toEqual([{id:'sd-fixture',label:'Synthetic topic',dot:'#F54E00'}]);
 expect(sectionTopics('low-level-design',notes).map(t=>t.id)).toEqual(['class-design']);
 expect(sectionTopics('finance',notes)[0].id).toBe('finance-fixture');expect(sectionTopics('ai-engineering',notes)[0].id).toBe('ai-fixture');
 expect(noteSection('trees')).toBe('dsa');expect(noteSection('sd-fixture')).toBe('system-design');
 expect(sectionQuestions('dsa','arrays-hashing').some(p=>p.lc===217)).toBe(true);
 for(const section of ['system-design','low-level-design','finance','ai-engineering'])expect(sectionQuestions(section)).toEqual([]);
});
it('preserves topic and routes draft notes/problems to Interview while revalidating old addresses',()=>{
 expect(modeHref('dsa',true,'trees')).toBe('/interview/dsa/notes/trees');expect(modeHref('dsa',false,'trees')).toBe('/interview/dsa/practice/trees');
 expect(noteHref('class-design')).toBe('/interview/low-level-design/notes/class-design');
 const parsed=validateOperations([{op:'update',table:'notes',key:'sd-fixture',fields:{body:'Synthetic'}},{op:'update',table:'question_notes',key:217,fields:{body:'Synthetic'}}]);
 if(!parsed.ok)throw Error(parsed.message);
 expect(appTargets(parsed.operations).map(t=>t.href)).toEqual(['/interview/system-design/notes/sd-fixture','/interview/problems/217']);
 expect(affectedRoutes(parsed.operations)).toEqual(expect.arrayContaining(['/notes','/practices','/practices/217','/interview/system-design/notes/sd-fixture','/interview/problems/217']));
});
