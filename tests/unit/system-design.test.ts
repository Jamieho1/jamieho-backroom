import {describe,it,expect} from 'vitest';
import {tocFromMarkdown,headingSlug,plainHeading,parseTableSchema,splitSolution,scoreQuiz,parseLocalAttempts,addLocalAttempt,sdTab,sdHref,questionSchema,picksSchema,SOLUTION_SECTIONS,MAX_LOCAL_ATTEMPTS,type QuizItem} from '@/lib/interview/system-design';
import {validateOperations,affectedRoutes,CONTENT_ALLOWLIST} from '@/lib/content-drafts/allowlist';
const KEY='00000000-0000-4000-8000-000000000b01';
const quiz:QuizItem[]=[0,1,2].map(i=>({q:`Question ${i}`,options:['a','b','c','d'],answer:i,explanation:'because'}));
describe('table of contents',()=>{
 it('lists ## headings in order with stable slugs and ignores other levels',()=>{
  const md='# Title\n\n## Overview\ntext\n### Detail\n## Data Model\n#### deep\n## API Design';
  expect(tocFromMarkdown(md)).toEqual([{id:'overview',text:'Overview'},{id:'data-model',text:'Data Model'},{id:'api-design',text:'API Design'}]);
 });
 it('skips headings inside fenced code, including tilde and longer fences',()=>{
  const md='## Real\n```md\n## Not a heading\n```\n~~~\n## Also not\n~~~\n````\n```\n## still code\n````\n## After';
  expect(tocFromMarkdown(md).map(i=>i.text)).toEqual(['Real','After']);
 });
 it('de-duplicates repeated headings, strips inline markup and handles unicode',()=>{
  const md='## Scale\n## Scale\n## **Bold** `code` [link](https://x.test)\n## Café & Résumé ##\n## ';
  expect(tocFromMarkdown(md)).toEqual([{id:'scale',text:'Scale'},{id:'scale-2',text:'Scale'},{id:'bold-code-link',text:'Bold code link'},{id:'cafe-resume',text:'Café & Résumé'}]);
  expect(headingSlug('!!!')).toBe('section');expect(plainHeading('a  *b*  ')).toBe('a b');
 });
 it('returns nothing for empty or heading-free text and keeps the agreed section order list',()=>{
  expect(tocFromMarkdown('')).toEqual([]);expect(tocFromMarkdown('plain\ntext')).toEqual([]);
  expect(tocFromMarkdown(SOLUTION_SECTIONS.map(s=>`## ${s}`).join('\n\nbody\n\n')).map(i=>i.text)).toEqual([...SOLUTION_SECTIONS]);
 });
});
describe('table-schema parsing',()=>{
 const ok={table:'urls',columns:[{name:'id',type:'bigint',pk:true},{name:'long_url',type:'text'}]};
 it('accepts a table with typed columns and a primary key flag',()=>{const r=parseTableSchema(JSON.stringify(ok));expect(r.ok&&r.schema.columns[0].pk).toBe(true);});
 it('rejects bad JSON, missing fields, unknown keys, duplicate or empty columns and oversized tables',()=>{
  for(const raw of ['{','[]',JSON.stringify({table:'t'}),JSON.stringify({table:'t',columns:[]}),JSON.stringify({table:'t',columns:[{name:'a'}]}),JSON.stringify({...ok,extra:1}),JSON.stringify({table:'t',columns:[{name:'a',type:'x'},{name:'A',type:'y'}]}),JSON.stringify({table:'t',columns:Array.from({length:31},(_,i)=>({name:'c'+i,type:'int'}))}),JSON.stringify({table:' ',columns:[{name:'a',type:'x'}]})])expect(parseTableSchema(raw).ok).toBe(false);
 });
 it('splits the solution at table-schema and diagram fences only',()=>{
  const diagram={title:'Flow',nodes:[{id:'a',title:'Client'},{id:'b',title:'Server'}],edges:[{from:'a',to:'b'}]};
  const md=`## Data Model\nintro\n\`\`\`table-schema\n${JSON.stringify(ok)}\n\`\`\`\n## Basic design\n\`\`\`diagram\n${JSON.stringify(diagram)}\n\`\`\`\n\`\`\`ts\nconst x = 1;\n\`\`\`\ntail`;
  const blocks=splitSolution(md);
  expect(blocks.map(b=>b.kind)).toEqual(['markdown','table-schema','markdown','diagram','markdown']);
  expect(blocks[1]).toMatchObject({kind:'table-schema',result:{ok:true}});expect(blocks[3]).toMatchObject({kind:'diagram',diagram:{title:'Flow'}});
  expect((blocks[4] as {text:string}).text).toContain('const x = 1;');
 });
 it('keeps invalid blocks as visible errors and survives an unterminated fence',()=>{
  const blocks=splitSolution('```table-schema\nnot json\n```\n```diagram\n{"title":"x"}\n```\n```table-schema\n{"table":"t"');
  expect(blocks.map(b=>b.kind)).toEqual(['table-schema','diagram','table-schema']);
  expect(blocks[0]).toMatchObject({result:{ok:false}});expect(blocks[1]).toMatchObject({diagram:null,message:expect.any(String)});expect(blocks[2]).toMatchObject({result:{ok:false}});
 });
});
describe('quiz scoring',()=>{
 it('counts exact matches, treats Don\'t know and missing picks as wrong and reports them in order',()=>{
  const r=scoreQuiz(quiz,[0,3,null]);
  expect(r).toEqual({score:1,total:3,percent:33,wrong:[{index:1,picked:3},{index:2,picked:null}]});
  expect(scoreQuiz(quiz,[0]).wrong.map(w=>w.picked)).toEqual([null,null]);
 });
 it('scores perfect, zero and empty quizzes',()=>{
  expect(scoreQuiz(quiz,[0,1,2])).toMatchObject({score:3,percent:100,wrong:[]});expect(scoreQuiz(quiz,[null,null,null]).score).toBe(0);expect(scoreQuiz([],[])).toEqual({score:0,total:0,percent:0,wrong:[]});
 });
 it('validates quiz items and picks',()=>{
  const base={id:KEY,slug:'q',title:'Q',icon:'system-design',topic:'',note_ref:'',solution:'',quiz,steps:[],sort:1,public:true};
  expect(questionSchema.safeParse(base).success).toBe(true);
  for(const bad of [{...quiz[0],options:['a','b','c']},{...quiz[0],answer:4},{...quiz[0],extra:1},{...quiz[0],q:'  '}])expect(questionSchema.safeParse({...base,quiz:[bad]}).success).toBe(false);
  expect(questionSchema.safeParse({...base,slug:'Bad Slug'}).success).toBe(false);expect(questionSchema.safeParse({...base,note_ref:'other'}).success).toBe(false);
  expect(picksSchema.safeParse([0,null,3]).success).toBe(true);expect(picksSchema.safeParse([4]).success).toBe(false);
 });
});
describe('attempts stored for visitors',()=>{
 it('parses safely, caps the list and rejects tampered data',()=>{
  expect(parseLocalAttempts(null)).toEqual([]);expect(parseLocalAttempts('{')).toEqual([]);expect(parseLocalAttempts(JSON.stringify([{id:'a',score:5,total:3,created_at:new Date().toISOString()}]))).toEqual([]);
  const a={id:'a',score:2,total:3,created_at:'2026-11-23T10:00:00.000Z'};expect(parseLocalAttempts(JSON.stringify([a]))).toEqual([a]);
  let list=[a];for(let i=0;i<30;i++)list=addLocalAttempt(list,{...a,id:'n'+i});expect(list).toHaveLength(MAX_LOCAL_ATTEMPTS);expect(list[0].id).toBe('n29');
 });
});
describe('routing helpers',()=>{
 it('normalises tabs and builds question links',()=>{
  expect(sdTab('quiz')).toBe('quiz');expect(sdTab('nope')).toBe('solution');expect(sdTab(null)).toBe('solution');
  expect(sdHref('tiny-url')).toBe('/interview/system-design/tiny-url');expect(sdHref('tiny-url','quiz')).toBe('/interview/system-design/tiny-url?tab=quiz');
 });
});
describe('Content Drafts allowlist',()=>{
 const op=(o:object)=>validateOperations([{table:'system_design_questions',key:KEY,...o}]);
 it('accepts inserts with slug and title plus every editable field and updates one field',()=>{
  expect(op({op:'insert',fields:{slug:'tiny-url',title:'Tiny URL',icon:'system-design',topic:'sd-intro',note_ref:'sd-tiny-url',solution:'## Overview',quiz,steps:[{id:'requirements',title:'Requirements',extra:true}],sort:1,public:true}}).ok).toBe(true);
  expect(op({op:'update',fields:{title:'Renamed'}}).ok).toBe(true);expect(op({op:'delete'}).ok).toBe(true);
 });
 it('refuses unknown fields, reserved slugs, missing insert fields, field-bearing deletes and bad quizzes',()=>{
  for(const o of [{op:'update',fields:{id:KEY}},{op:'update',fields:{slug:'practice'}},{op:'update',fields:{slug:'notes'}},{op:'insert',fields:{slug:'only-slug'}},{op:'update',fields:{}},{op:'delete',fields:{title:'x'}},{op:'update',fields:{quiz:[{...quiz[0],answer:9}]}},{op:'update',fields:{steps:[{id:'Bad Id',title:'x'}]}},{op:'update',fields:{public:'yes'}}])expect(op(o).ok).toBe(false);
 });
 it('maps drafts to the list route and the question page',()=>{
  const parsed=op({op:'update',fields:{slug:'tiny-url'}});if(!parsed.ok)throw Error('expected valid');
  expect(affectedRoutes(parsed.operations,[{table:'system_design_questions',values:{slug:'old-slug'}}])).toEqual(expect.arrayContaining(['/interview/system-design/practice','/interview/system-design/tiny-url','/interview/system-design/old-slug']));
  expect(CONTENT_ALLOWLIST.system_design_questions.operations).toEqual(['insert','update','delete']);
 });
});
describe('privacy and export',()=>{
 it('includes per-user quiz attempts and progress in the encrypted export manifest and pages them by user',async()=>{
  const {readFileSync}=await import('node:fs');
  const tables=JSON.parse(readFileSync('scripts/export-tables.json','utf8')) as string[];
  for(const t of ['system_design_questions','system_design_quiz_attempts','system_design_progress','system_design_whiteboards'])expect(tables).toContain(t);
  const ops=readFileSync('scripts/ops.mjs','utf8');
  expect(ops).toContain('system_design_quiz_attempts:["user_id","id"]');expect(ops).toContain('system_design_progress:["user_id","question_id"]');expect(ops).toContain('system_design_whiteboards:["user_id","question_id"]');
 });
 it('discloses quiz attempts and flag/done marks in the privacy page',async()=>{
  const {readFileSync}=await import('node:fs');const page=readFileSync('app/privacy/page.tsx','utf8');
  expect(page).toContain('System design questions');expect(page).toContain('quiz attempts');expect(page).toMatch(/Administrative encrypted backups include these records/);
 });
});
