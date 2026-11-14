import {it,expect,describe} from 'vitest';
import {validateOperations,affectedRoutes,publishingSchemas,type PublishingTable} from '@/lib/content-drafts/allowlist';
import {overlayPublishing} from '@/lib/content-drafts/publishing-overlay';
import {emptyProject} from '@/lib/portfolio-core';
import {emptyArticle} from '@/lib/articles';
import {emptyGuide} from '@/lib/guides';
const id='00000000-0000-4000-8000-000000000601',other='00000000-0000-4000-8000-000000000602';
const fields={projects:{...emptyProject(),id,slug:'example-project',name:'Project',public:true},articles:{...emptyArticle(),id,slug:'example-article',title:'Article',published:true},guides:{...emptyGuide(),id,slug:'example-guide',title:'Guide',published:true}};
function parse(input:unknown){const r=validateOperations(input);if(!r.ok)throw Error(r.message);return r.operations;}
const op=(table:PublishingTable,action='update',values:unknown={},key=id)=>({op:action,table,key,fields:values});
for(const table of ['projects','articles','guides'] as const)describe(table,()=>{
 const full=fields[table];const {id:unused,...editable}=full;void unused;
 it('reuses editor field schemas, accepts a complete insert and rejects metadata/unknown fields',()=>{
  const [operation]=parse([op(table,'insert',editable)]);expect(operation.fields).toEqual((()=>{const {id:ignored,...row}=publishingSchemas[table].parse(full);void ignored;return row;})());
  for(const extra of [{id:other},{created_at:'now'},{role:'owner'}])expect(validateOperations([op(table,'update',extra)]).ok).toBe(false);
  for(const values of [{slug:'manage'},{slug:'has space'},{slug:'a'.repeat(81)},{[table==='projects'?'name':'title']:' '}])expect(validateOperations([op(table,'update',values)]).ok).toBe(false);
 });
 it('normalizes merged rows, creates hidden defaults and keeps soft-deleted rows restorable',()=>{
  const live=[{...full,created_at:'2025-01-01',updated_at:'2025-01-01'}];const before=structuredClone(live);
  const name=table==='projects'?'name':'title';
  const edited=overlayPublishing(table,live as never,parse([op(table,'update',{[name]:' Edited ',slug:'changed-slug'})]));expect(edited[0]).toMatchObject({[name]:'Edited',slug:'changed-slug',draftChanged:true});expect(live).toEqual(before);
  const hidden=overlayPublishing(table,edited as never,parse([op(table,'delete')]));expect(hidden).toHaveLength(1);expect(hidden[0]).toMatchObject({[table==='projects'?'public':'published']:false,slug:'changed-slug'});
  const restored=overlayPublishing(table,hidden as never,parse([op(table,'update',{[table==='projects'?'public':'published']:true})]));expect(restored[0]).toMatchObject({[table==='projects'?'public':'published']:true});
  const inserted=overlayPublishing(table,[],parse([op(table,'insert',{slug:'new-row',[name]:'New'},other)]));expect(inserted[0]).toMatchObject({id:other,[table==='projects'?'public':'published']:false});
 });
 it('refuses empty/invalid operations, missing targets, duplicate keys and slug collisions',()=>{
  for(const operation of [op(table,'update'),op(table,'insert',{slug:'new'}),op(table,'delete',{slug:'x'}),op(table,'update',{slug:'valid'},'bad')])expect(validateOperations([operation]).ok).toBe(false);
  const live=[{...full,created_at:'2025-01-01',updated_at:'2025-01-01'}];
  expect(()=>overlayPublishing(table,live as never,parse([op(table,'insert',editable)]))).toThrow(/already exists/);
  expect(()=>overlayPublishing(table,live as never,parse([op(table,'update',{slug:'valid'},other)]))).toThrow(/no longer exists/);
  expect(()=>overlayPublishing(table,live as never,parse([op(table,'insert',{...editable},other)]))).toThrow(/slug is already/);
 });
 it('refreshes previous, intermediate and proposed slugs, including unpublish',()=>{
  const ops=parse([op(table,'update',{slug:'new-slug'}),op(table,'delete')]);const routes=affectedRoutes(ops,[{table,key:id,values:{slug:'old-slug'}},{table,key:id,values:{slug:'new-slug'}}]);
  expect(routes).toContain(`/${table}/old-slug`);expect(routes).toContain(`/${table}/new-slug`);expect(routes).toContain(`/${table}`);expect(new Set(routes).size).toBe(routes.length);
 });
 it('refuses unsafe links even where URL parsing would coerce a missing scheme separator',()=>{
  const name=table==='projects'?'url':'cover_url';for(const value of ['http://example.com','javascript:alert(1)','https:example.com','https://','https://%','https://example.com/a b','https://example.com\\path'])expect(validateOperations([op(table,'update',{[name]:value})]).ok).toBe(false);
 });
});
it('enforces project tag/screenshot/sort limits and article/guide-specific fields',()=>{
 for(const input of [{tags:Array(9).fill('x')},{tags:['x'.repeat(25)]},{tags:[' ']},{screenshots:Array(7).fill('https://example.com/x')},{screenshots:['http://x']},{sort:1001},{sort:1.5},{featured:'yes'},{body:'x'.repeat(50001)},{name:'x'.repeat(81)},{tagline:'x'.repeat(161)}])expect(validateOperations([op('projects','update',input)]).ok).toBe(false);
 for(const table of ['articles','guides'] as const)for(const values of [{title:'x'.repeat(161)},{summary:'x'.repeat(601)},{body:'x'.repeat(200001)},{published:'true'},{cover_url:'https://example.com/'+'x'.repeat(2049)}])expect(validateOperations([op(table,'update',values)]).ok).toBe(false);
 for(const values of [{platform:'unknown'},{category:'unknown'},{project_id:42},{project_id:'x'.repeat(81)}])expect(validateOperations([op('articles','update',values)]).ok).toBe(false);
});
it('guide previews simulate the update timestamp used for shelf ordering',()=>{
 const stamp='2026-11-14T12:00:00.000Z';const live=[{...fields.guides,created_at:'2025-01-01',updated_at:'2025-01-01'}];
 const result=overlayPublishing('guides',live,parse([op('guides','update',{title:'Updated guide'})]),stamp);expect(result[0].updated_at).toBe(stamp);expect(live[0].updated_at).toBe('2025-01-01');
});
it('the review table preserves exact array boundaries instead of flattening comma-containing tags',async()=>{
 const {reviewFields}=await import('@/lib/content-drafts/types');const result=reviewFields(parse([op('projects','update',{tags:['AI, backend','Systems']})]),{},{projects:{[id]:{tags:['Old']}}});
 expect(JSON.parse(result[0].current)).toEqual(['Old']);expect(JSON.parse(result[0].proposed)).toEqual(['AI, backend','Systems']);
});
