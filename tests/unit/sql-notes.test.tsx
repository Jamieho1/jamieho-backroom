import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {SQL_NOTES,isSqlNoteId,noteSection,noteHref,noteComingSoon,sectionTopics,modeHref} from '@/lib/interview/content';
import {validateNoteEdit} from '@/lib/notes';
import {chipRefs,unknownChips,renderChips,validPrepRef,resolvePrepLink,questionRef,prepLinksSchema,type PrepContext} from '@/lib/interview/prep';
import {SQL_LIST,sqlProblemHref} from '@/lib/practice/sql-catalog';
import {PRACTICE_ANCHORS} from '@/lib/notes/neetcode150';
import {overlayApp} from '@/lib/content-drafts/app-overlay';
import {validateOperations,affectedRoutes} from '@/lib/content-drafts/allowlist';
import {Markdown} from '@/components/notes/markdown';
import {SqlBuildsOn} from '@/components/practice/question-connections';
const ctx:PrepContext={notes:[],themes:[]};
const note=(id:string,body='')=>({id,title:id,body,free:'',visual:[],sort:1,updated_at:'2026-01-01T00:00:00Z'});

it('accepts the three SQL note ids everywhere an id is validated and files them under the SQL section',()=>{
 expect(SQL_NOTES.map(n=>[n.id,n.label])).toEqual([['sql-basics','SQL basics'],['sql-tackling','Tackling SQL questions'],['sql-postgres-mysql','Postgres vs MySQL']]);
 for(const {id} of SQL_NOTES){expect(validateNoteEdit(id,{body:'x',free:''})).toBeNull();expect(noteSection(id)).toBe('sql');expect(isSqlNoteId(id)).toBe(true);expect(noteHref(id)).toBe(`/interview/sql/notes/${id}`);expect(validPrepRef('note',id,ctx)).toBe(true);}
 expect(isSqlNoteId('sql-select')).toBe(false);expect(validPrepRef('note','sql-other',ctx)).toBe(false);
});
it('lists exactly the three notes, in order, on the SQL notes shelf; practice keeps the seven topics',()=>{
 const rows=[{id:'sql-postgres-mysql',title:'Postgres vs MySQL'},{id:'sql-basics',title:'SQL basics'},{id:'sql-extra',title:'Stray'}];
 expect(sectionTopics('sql',rows,'notes').map(t=>t.id)).toEqual(['sql-basics','sql-tackling','sql-postgres-mysql']);
 expect(sectionTopics('sql',[],'notes').map(t=>t.label)).toEqual(['SQL basics','Tackling SQL questions','Postgres vs MySQL']);
 expect(sectionTopics('sql',rows).map(t=>t.id)).toHaveLength(7);expect(sectionTopics('sql',rows,'practice').some(t=>t.id==='sql-basics')).toBe(false);
 expect(sectionTopics('dsa',[],'notes')).toHaveLength(17);expect(modeHref('sql',true,'sql-basics')).toBe('/interview/sql/notes/sql-basics');
});
it('shows coming soon for a missing or empty note and real content once drafted',()=>{
 expect(noteComingSoon(undefined)).toBe(true);expect(noteComingSoon(note('sql-basics'))).toBe(true);expect(noteComingSoon({body:'  \n',free:' '})).toBe(true);
 expect(noteComingSoon(note('sql-basics','# SELECT'))).toBe(false);expect(noteComingSoon({body:'',free:'my notes'})).toBe(false);
});
it('question chips accept the 50 SQL numbers and link to SQL problem pages; DSA numbers keep their links',()=>{
 expect(SQL_LIST).toHaveLength(50);
 for(const p of SQL_LIST){
  expect(PRACTICE_ANCHORS.some(a=>a.lc===p.lc)).toBe(false);
  expect(validPrepRef('question',String(p.lc),ctx)).toBe(true);expect(questionRef(String(p.lc))).toBe(String(p.lc));
  const item=resolvePrepLink({kind:'question',ref:String(p.lc)},ctx)!;expect(item).toMatchObject({href:`/interview/sql/problems/${p.lc}`,label:p.title,group:'practice',problem:p.lc});expect(item.href).toBe(sqlProblemHref(p.lc));
  expect(unknownChips(`See [[question:${p.lc}]].`,ctx)).toEqual([]);expect(renderChips(`[[question:${p.lc}]]`,ctx)).toBe(`[${p.title}](/interview/sql/problems/${p.lc} "iv-chip")`);
 }
 expect(resolvePrepLink({kind:'question',ref:'217'},ctx)).toMatchObject({href:'/interview/problems/217',label:'Contains Duplicate'});
 expect(renderChips('[[question:146]]',ctx)).toContain('(/interview/problems/146 "iv-chip")');
 expect(unknownChips('[[question:99999]] [[question:1757]] [[note:sql-basics]] [[note:sql-nope]]',ctx).map(c=>c.raw)).toEqual(['[[question:99999]]','[[note:sql-nope]]']);
 expect(validPrepRef('question','99999',ctx)).toBe(false);expect(prepLinksSchema.safeParse([{kind:'question',ref:'1757'},{kind:'note',ref:'sql-basics'}]).success).toBe(true);
});
it('note chips work from prose and render as SQL note links with their titles',()=>{
 expect(chipRefs('Read [[note:sql-basics]], then [[note:sql-tackling]] and [[note:sql-postgres-mysql]].').map(c=>c.ref)).toEqual(['sql-basics','sql-tackling','sql-postgres-mysql']);
 const md=renderChips('[[note:sql-basics]] [[note:sql-postgres-mysql]]',ctx);
 expect(md).toBe('[SQL basics](/interview/sql/notes/sql-basics "iv-chip") [Postgres vs MySQL](/interview/sql/notes/sql-postgres-mysql "iv-chip")');
 expect(renderChips('`[[note:sql-basics]]`',ctx)).toBe('`[[note:sql-basics]]`');
});
it('notes render chips as links; unknown ones and code stay plain text',()=>{
 const html=renderToStaticMarkup(<Markdown text={'Start with [[note:sql-basics]] and [[question:1757]], also [[question:217]] and [[question:99999]]. `[[note:sql-basics]]`'}/>);
 expect(html).toContain('<a class="iv-chip" href="/interview/sql/notes/sql-basics">SQL basics</a>');
 expect(html).toContain('href="/interview/sql/problems/1757"');expect(html).toContain('href="/interview/problems/217"');
 expect(html).toContain('[[question:99999]]');expect(html).toContain('<code>[[note:sql-basics]]</code>');
});
it('SQL problem pages link the SQL basics note',()=>{
 const html=renderToStaticMarkup(<SqlBuildsOn/>);expect(html).toContain('href="/interview/sql/notes/sql-basics"');expect(html).toContain('SQL basics');
});
it('note drafts are checked for unknown chips (note and question only)',()=>{
 const op=(body:string,key='sql-basics')=>{const r=validateOperations([{table:'notes',op:'update',key,fields:{body}}]);if(!r.ok)throw Error(r.message);return r.operations;};
 const live=[note('sql-basics'),note('sql-tackling')];
 const ok=overlayApp('notes',live,op('Try [[question:1757]], [[question:217]] and [[note:sql-tackling]] and [[note:sql-postgres-mysql]].'));
 expect(ok.find(n=>n.id==='sql-basics')?.body).toContain('1757');
 for(const bad of ['[[question:99999]]','[[note:sql-nope]]','[[behavioral:conflict]]'])expect(()=>overlayApp('notes',live,op(bad)),bad).toThrow(/Unknown inline reference/);
});
it('a Content Draft for each SQL note validates and previews on the SQL shelf',()=>{
 for(const {id} of SQL_NOTES){const r=validateOperations([{table:'notes',op:'update',key:id,fields:{body:'## Heading\n\nText.'}}]);expect(r.ok).toBe(true);if(r.ok)expect(affectedRoutes(r.operations)).toContain(`/interview/sql/notes/${id}`);}
});
