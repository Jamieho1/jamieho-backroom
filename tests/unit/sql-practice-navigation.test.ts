import {it,expect} from 'vitest';
import {INTERVIEW_SECTIONS,PRACTICE_SECTIONS,interviewSection} from '@/lib/interview/navigation';
import {noteSection,sectionQuestions,sectionTopics,modeHref,questionHref,noteHref} from '@/lib/interview/content';
import {sqlNavigation,sqlProblemHref,starterSql} from '@/lib/practice/sql-catalog';
import {validProblem,validPracticeProblem,validAttempt,attemptInput} from '@/lib/practice/data';
import {completedProblems} from '@/lib/practice/progress';
import {submissionInput,SubmissionInput} from '@/lib/practice/submissions';
import {PRACTICE_LIST} from '@/lib/practice/catalog';
const out=(passed:number,total:number)=>({status:'ok' as const,results:Array.from({length:total},(_,i)=>({id:`t${i}`,visible:true,status:(i<passed?'pass':'fail') as 'pass'|'fail'})),passed,total,stdout:'',ms:5});
it('SQL is a practice section with routes /interview/sql/practice and /interview/sql/notes',()=>{
 expect(PRACTICE_SECTIONS).toContain('sql');expect(INTERVIEW_SECTIONS.find(s=>s.id==='sql')?.href).toBe('/interview/sql/practice');
 expect(modeHref('sql',false)).toBe('/interview/sql/practice');expect(modeHref('sql',true)).toBe('/interview/sql/notes');expect(modeHref('sql',false,'sql-select')).toBe('/interview/sql/practice/sql-select');
 expect(interviewSection('/interview/sql/practice').id).toBe('sql');expect(interviewSection('/interview/sql/problems/1757').id).toBe('sql');expect(interviewSection('/interview/problems/217').id).toBe('dsa');
});
it('the topic list is the seven SQL 50 topics in plan order, and DSA topics are untouched',()=>{
 expect(sectionTopics('sql').map(t=>t.label)).toEqual(['Select','Basic Joins','Basic Aggregate Functions','Sorting and Grouping','Advanced Select and Joins','Subqueries','Advanced String Functions / Regex / Clause']);
 expect(sectionTopics('dsa')).toHaveLength(17);expect(noteSection('sql-select')).toBe('sql');expect(noteHref('sql-basics')).toBe('/interview/sql/notes/sql-basics');
});
it('SQL question lists, links and previous/next stay inside SQL and never leak into DSA lists',()=>{
 expect(sectionQuestions('sql').map(p=>p.lc)).toEqual([1757,1378,620]);expect(sectionQuestions('sql','sql-basic-joins').map(p=>p.lc)).toEqual([1378]);expect(sectionQuestions('sql','sql-subqueries')).toEqual([]);
 expect(sectionQuestions('dsa').some(p=>[1757,1378,620].includes(p.lc))).toBe(false);expect(PRACTICE_LIST.some(p=>[1757,1378,620].includes(p.lc))).toBe(false);
 expect(questionHref('sql',1757)).toBe('/interview/sql/problems/1757');expect(questionHref('dsa',217)).toBe('/interview/problems/217');expect(sqlProblemHref(620)).toBe('/interview/sql/problems/620');
 const middle=sqlNavigation(1378);expect(middle.previous?.lc).toBe(1757);expect(middle.next?.lc).toBe(620);expect(middle.topicLabel).toBe('Basic Joins');
 expect(sqlNavigation(1757).previous).toBeUndefined();expect(sqlNavigation(620).next).toBeUndefined();
 expect(starterSql(1757)).toMatch(/^-- One SELECT/);expect(starterSql(217)).toBe('');
});
it('per-user data accepts SQL numbers while owner content drafts stay on the DSA catalogue',()=>{
 for(const lc of [1757,1378,620,217])expect(validPracticeProblem(lc)).toBe(true);
 expect(validProblem(1757)).toBe(false);expect(validProblem(217)).toBe(true);for(const bad of [0,-1,1.5,99999,'1757',null])expect(validPracticeProblem(bad)).toBe(false);
 expect(validAttempt(attemptInput(1757,'SELECT 1','submit',out(4,4)))).toBe(true);
});
it('SQL completions come from submit attempts and are counted independently of DSA ones',()=>{
 const rows=[{problem:1757,mode:'submit',status:'ok',passed:4,total:4},{problem:1378,mode:'run',status:'ok',passed:1,total:1},{problem:620,mode:'submit',status:'ok',passed:3,total:4},{problem:217,mode:'submit',status:'ok',passed:9,total:9},{problem:777777,mode:'submit',status:'ok',passed:1,total:1}];
 const done=completedProblems(rows);expect(done.sort((a,b)=>a-b)).toEqual([217,1757]);
 expect(sectionQuestions('sql').filter(p=>done.includes(p.lc))).toHaveLength(1);expect(sectionQuestions('dsa').filter(p=>done.includes(p.lc)).map(p=>p.lc)).toEqual([217]);
});
it('SQL submissions are stored with language SQL and the SQL test count',()=>{
 const accepted=submissionInput(1757,'SELECT 1',{time_complexity:'',space_complexity:''},out(4,4));
 expect(accepted).toMatchObject({language:'SQL',status:'accepted',passed:4,total:4});expect(SubmissionInput.safeParse(accepted).success).toBe(true);
 const wrong=submissionInput(1757,'SELECT 1',{time_complexity:'',space_complexity:''},out(2,4));expect(wrong).toMatchObject({language:'SQL',status:'wrong answer',passed:2,total:4});
 expect(submissionInput(217,'x',{time_complexity:'',space_complexity:''},out(1,1)).language).toBe('Python');
});
