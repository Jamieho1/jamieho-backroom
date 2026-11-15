import {it,expect} from 'vitest';
import {blankAnswer,isAnswered,privateAnswerSchema,customQuestionSchema} from '@/lib/interview/behavioral';
import {validateOperations,affectedRoutes} from '@/lib/content-drafts/allowlist';
const id='12200000-0000-4000-8000-000000000001';
it('counts completed STAR only and validates private questions/answers without identity injection',()=>{
 const a=blankAnswer(id);expect(isAnswered(a)).toBe(false);expect(isAnswered({...a,situation:'s',task:'t',action:'a',result:'r'})).toBe(true);expect(isAnswered({...a,situation:'s',task:'t',action:'a',result:'  '})).toBe(false);
 for(const bad of [{...a,user_id:id},{...a,action:'x'.repeat(20001)},{...a,role_id:'no'},{...a,action:'\0'},{...a,custom:'yes'}])expect(privateAnswerSchema.safeParse(bad).success).toBe(false);
 expect(customQuestionSchema.safeParse({id,theme_id:'conflict',prompt:'A synthetic question'}).success).toBe(true);for(const prompt of [' ','x'.repeat(401),'\0'])expect(customQuestionSchema.safeParse({id,theme_id:'conflict',prompt}).success).toBe(false);
});
it('allows only shared guide drafts and revalidates question and theme pages',()=>{
 const operation={op:'update',table:'interview_behavioral_questions',key:id,fields:{prompt:'Synthetic question',sample:'Generic synthetic guide'}};const result=validateOperations([operation]);expect(result.ok).toBe(true);if(result.ok)expect(affectedRoutes(result.operations)).toEqual(['/interview/behavioral','/interview/behavioral/questions/'+id]);
 for(const bad of [{...operation,op:'delete'},{...operation,fields:{sample:'x'.repeat(12001)}},{...operation,fields:{sample:null}},{...operation,fields:{user_id:id}},{...operation,fields:{sort:1.5}},{...operation,table:'interview_behavioral_answers'},{...operation,table:'interview_behavioral_custom_questions'},{...operation,fields:{}}])expect(validateOperations([bad]).ok).toBe(false);
 expect(validateOperations([{op:'insert',table:'interview_behavioral_themes',key:'new-theme',fields:{title:'New',color:'#34D399',sort:9}}]).ok).toBe(true);
});
