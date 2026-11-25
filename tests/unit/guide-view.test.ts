import {describe,it,expect} from 'vitest';
import {guideChapters,guideFacts,guideHighlights,guideTopic} from '@/lib/guide-view';
import {readMinutes} from '@/lib/articles';

describe('guide chapters',()=>{
 it('numbers the ## headings, skips code blocks and ### sub-headings, and gives each chapter a read time',()=>{
  const words=(n:number)=>Array.from({length:n},()=>'word').join(' ');
  const body=`Intro ${words(50)}\n\n## What is **MCP**?\n${words(440)}\n### Sub\n\`\`\`md\n## not a chapter\n\`\`\`\n## [Connect](https://x.test) it ##\n${words(10)}\n## Last`;
  const ch=guideChapters(body);
  expect(ch.map(c=>c.n)).toEqual(['01','02','03']);
  expect(ch.map(c=>c.title)).toEqual(['What is MCP?','Connect it','Last']);
  expect(ch[0].id).toBe('what-is-mcp');
  expect(ch.map(c=>c.minutes)).toEqual([3,1,1]);
 });
 it('is empty without headings and ignores CRLF line endings',()=>{
  expect(guideChapters('')).toEqual([]);expect(guideChapters('Just text')).toEqual([]);
  expect(guideChapters('## One\r\ntext\r\n## Two\r\n').map(c=>c.title)).toEqual(['One','Two']);
 });
 it('agrees with the read time of the whole body for a single chapter',()=>{
  const body='## Only\n'+Array.from({length:500},()=>'w').join(' ');
  expect(guideChapters(body)[0].minutes).toBe(readMinutes(body));
 });
});
describe('guide facts',()=>{
 it('shows chapters, minutes and exercises when set, with singular labels',()=>{
  expect(guideFacts({chapters:5,minutes:25,exercises:12})).toEqual([{value:'5',label:'chapters'},{value:'25m',label:'to read'},{value:'12',label:'exercises'}]);
  expect(guideFacts({chapters:1,minutes:1,exercises:1})).toEqual([{value:'1',label:'chapter'},{value:'1m',label:'to read'},{value:'1',label:'exercise'}]);
 });
 it('leaves out chapters without headings and exercises that are unset or zero',()=>{
  expect(guideFacts({chapters:0,minutes:4,exercises:null})).toEqual([{value:'4m',label:'to read'}]);
  expect(guideFacts({chapters:3,minutes:4,exercises:0}).map(f=>f.label)).toEqual(['chapters','to read']);
 });
});
describe('highlights and topic',()=>{
 it('keeps at most three non-blank ticks',()=>{
  expect(guideHighlights({highlights:[' a ','','b','c','d']})).toEqual(['a','b','c']);
 });
 it('uses the series topic, else the editorial label',()=>{
  const series=[{id:'s',topic:'career' as const}];
  expect(guideTopic({slug:'x',series_id:'s'},series)).toBe('Career');
  expect(guideTopic({slug:'mcp',series_id:null},series)).toBe('AI Engineering');
  expect(guideTopic({slug:'other',series_id:null},series)).toBe('General');
 });
});
