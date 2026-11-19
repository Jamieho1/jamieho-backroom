import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
import {validateOperations} from '@/lib/content-drafts/allowlist';
const owner={id:'00000000-0000-4000-8000-000000000b91',email:'case-owner@example.test'},member={id:'00000000-0000-4000-8000-000000000b92',email:'case-member@example.test'},id='00000000-0000-4000-8000-000000000b93',other='00000000-0000-4000-8000-000000000b94';let db:PGlite;
const diagram={title:'Research pipeline',nodes:[{id:'filings',title:'Filings & transcripts',lines:['SEC 10-K · earnings']},{id:'retrieval',title:'Hybrid retrieval',lines:['BM25 + BGE-M3 in Qdrant'],highlight:true},{id:'memo',title:'Investment memo'}],edges:[{from:'filings',to:'retrieval'},{from:'retrieval',to:'memo',highlight:true}]};
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values('owner_email',$1)",[owner.email]);await addUser(db,owner);await addUser(db,member);await db.query("insert into public.projects(id,slug,name,public,capabilities,status) values($1,'case-fixture','Synthetic project',true,array['01'],'Live')",[id]);await db.query("insert into public.projects(id,slug,name,public) values($1,'case-other','Other project',true)",[other]);},30000);afterAll(async()=>{await db?.close();});
const op=(fields:Record<string,unknown>,key=id)=>({op:'update',table:'projects',key,fields});
const approve=(q:(sql:string,p?:unknown[])=>Promise<any[]>,operations:unknown[])=>q("insert into public.content_changes(summary,operations) values('Case study proposal',$1) returning id",[JSON.stringify(operations)]).then(async([set])=>{await q("update public.content_changes set status='approved' where id=$1",[set.id]);return set.id as string;});

it('adds the columns with empty defaults, so existing rows and the editor keep working',async()=>{
 expect(await db.query<{capabilities:string[];status:string;diagram:unknown}>('select capabilities,status,diagram from public.projects where id=$1',[other])).toMatchObject({rows:[{capabilities:[],status:'',diagram:null}]});
 await as(db,{role:'authenticated',sub:owner.id},async q=>{await q("update public.projects set name='Renamed by the editor' where id=$1",[other]);expect(await q('select name,capabilities,status,diagram from public.projects where id=$1',[other])).toEqual([{name:'Renamed by the editor',capabilities:[],status:'',diagram:null}]);});
});
it('keeps public reads and owner-only writes',async()=>{
 for(const who of [{role:'anon' as const},{role:'authenticated' as const,sub:member.id}]){
  expect(await as(db,who,q=>q('select capabilities,status,diagram from public.projects where id=$1',[id]))).toEqual([{capabilities:['01'],status:'Live',diagram:null}]);
  if(who.role==='anon')await expect(as(db,who,q=>q("update public.projects set capabilities=array['05'] where id=$1 returning id",[id]))).rejects.toThrow(/permission denied/);else expect(await as(db,who,q=>q("update public.projects set capabilities=array['05'] where id=$1 returning id",[id]))).toEqual([]);
  await expect(as(db,who,q=>q("insert into public.projects(slug,name,capabilities) values('denied','Denied',array['01'])"))).rejects.toThrow();
 }
 await as(db,{role:'authenticated',sub:owner.id},async q=>{await q("update public.projects set capabilities=array['01','04'],status='Working prototype',diagram=$2::jsonb where id=$1",[id,JSON.stringify(diagram)]);expect(await q('select capabilities,status,diagram from public.projects where id=$1',[id])).toEqual([{capabilities:['01','04'],status:'Working prototype',diagram}]);});
});
for(const [name,sql] of [['unknown capability',"capabilities=array['06']"],['duplicate capability',"capabilities=array['01','01']"],['null capability',"capabilities=array['01',null]"],['six capabilities',"capabilities=array['01','02','03','04','05','01']"],['null array',"capabilities=null"],['long status',"status=repeat('x',81)"],['array diagram',"diagram='[]'::jsonb"],['diagram without nodes',`diagram='{"title":"T","nodes":[],"edges":[]}'::jsonb`],['edge to a missing node',`diagram='{"title":"T","nodes":[{"id":"a","title":"A"}],"edges":[{"from":"a","to":"b"}]}'::jsonb`],['unknown diagram key',`diagram='{"title":"T","nodes":[{"id":"a","title":"A"}],"edges":[],"html":"x"}'::jsonb`]] as const)
 it('the table constraints reject '+name,async()=>{await as(db,{role:'authenticated',sub:owner.id},async q=>{await q('savepoint bad');await expect(q(`update public.projects set ${sql} where id=$1`,[id])).rejects.toThrow(/violates check constraint|null value/);await q('rollback to savepoint bad');});});
for(const [name,fields] of [['capability outside 01-05',{capabilities:['06']}],['duplicate capabilities',{capabilities:['01','01']}],['capabilities as text',{capabilities:'01'}],['long status',{status:'x'.repeat(81)}],['status as number',{status:5}],['diagram without nodes',{diagram:{title:'T',nodes:[],edges:[]}}],['diagram edge to a missing node',{diagram:{title:'T',nodes:[{id:'a',title:'A'}],edges:[{from:'a',to:'b'}]}}],['diagram duplicate node ids',{diagram:{title:'T',nodes:[{id:'a',title:'A'},{id:'a',title:'B'}],edges:[]}}],['diagram with a self edge',{diagram:{title:'T',nodes:[{id:'a',title:'A'}],edges:[{from:'a',to:'a'}]}}],['diagram with padded text',{diagram:{title:'T',nodes:[{id:'a',title:' A'}],edges:[]}}],['diagram as text',{diagram:'<svg/>'}]] as const)
 it('drafts reject '+name+' in TS and SQL with full rollback',async()=>{expect(validateOperations([op({...fields})]).ok).toBe(false);await as(db,{role:'authenticated',sub:owner.id},async q=>{const [set]=await q<{id:string}>("insert into public.content_changes(summary,operations) values('Invalid case study',$1) returning id",[JSON.stringify([op({name:'Must roll back'}),op({...fields})])]);await q('savepoint invalid');await expect(q("update public.content_changes set status='approved' where id=$1",[set.id])).rejects.toThrow();await q('rollback to savepoint invalid');expect((await q('select name from public.projects where id=$1',[id]))[0].name).toBe('Synthetic project');});});
it('approves a normalised set, records the old values and clears the diagram with null',async()=>{
 await as(db,{role:'authenticated',sub:owner.id},async q=>{
  await q("update public.projects set capabilities='{}',status='',diagram=null where id=$1",[id]);
  const setId=await approve(q as never,[op({capabilities:['04','01'],status:'  Working prototype · sample data  ',diagram})]);
  expect(await q('select capabilities,status,diagram from public.projects where id=$1',[id])).toEqual([{capabilities:['04','01'],status:'Working prototype · sample data',diagram}]);
  const [saved]=await q<{previous:{values:{capabilities:string[];status:string;diagram:unknown}}[]}>('select previous from public.content_changes where id=$1',[setId]);
  expect(saved.previous[0].values).toMatchObject({capabilities:[],status:'',diagram:null});
  await approve(q as never,[op({diagram:null})]);
  expect(await q('select diagram from public.projects where id=$1',[id])).toEqual([{diagram:null}]);
 });
});
it('inserts a new project with the new fields and defaults them when omitted',async()=>{
 await as(db,{role:'authenticated',sub:owner.id},async q=>{
  const full='00000000-0000-4000-8000-000000000b95',bare='00000000-0000-4000-8000-000000000b96';
  await approve(q as never,[{op:'insert',table:'projects',key:full,fields:{slug:'case-new',name:'New case study',public:true,capabilities:['05'],status:'Live',diagram}},{op:'insert',table:'projects',key:bare,fields:{slug:'case-bare',name:'Bare project'}}]);
  expect(await q('select capabilities,status,diagram is not null as has_diagram from public.projects where id=$1',[full])).toEqual([{capabilities:['05'],status:'Live',has_diagram:true}]);
  expect(await q('select capabilities,status,diagram from public.projects where id=$1',[bare])).toEqual([{capabilities:[],status:'',diagram:null}]);
 });
});
it('keeps the validators out of the API surface',async()=>{
 for(const fn of ['valid_project_capabilities','valid_project_diagram'])expect(await db.query<{anon:boolean;pub:boolean}>("select has_function_privilege('anon',p.oid,'execute') as anon,has_function_privilege('public',p.oid,'execute') as pub from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname=$1",[fn])).toMatchObject({rows:[{anon:false,pub:false}]});
 await expect(as(db,{role:'anon'},q=>q("select private.valid_project_capabilities(array['01'])"))).rejects.toThrow(/permission denied/);
});
