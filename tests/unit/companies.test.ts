import {it,expect} from 'vitest';
import {companyMonogram,companyDirectory,filterCompanies,validCompanyReference,companySchema} from '@/lib/interview/companies';
import {validateOperations,affectedRoutes} from '@/lib/content-drafts/allowlist';
import {overlayCompanies} from '@/lib/content-drafts/companies';
const id='00000000-0000-4000-8000-000000000901',qid='00000000-0000-4000-8000-000000000902';
const company=companySchema.parse({id,slug:'fixture',name:'Fixture Company',logo_path:'',overview:'',sort:100,public:true});
const op=(table:string,fields:unknown,action='insert',key=id)=>({table,fields,op:action,key});
it('deterministic monograms handle whitespace, single words and empty values',()=>{expect(companyMonogram(' Fixture Company ').letters).toBe('FC');expect(companyMonogram('Example').letters).toBe('E');expect(companyMonogram('  ').letters).toBe('?');expect(companyMonogram('Fixture Company')).toEqual(companyMonogram('Fixture Company'));expect(companyMonogram('😀 Labs').letters).toBe('😀L');});
it('directory counts public questions only, filters and deterministically sorts without mutating',()=>{
 const rows=companyDirectory([company,{...company,id:qid,name:'Alpha',slug:'alpha'},{...company,id:'hidden',public:false}],[{id:qid,company_id:id,kind:'coding',section:'DSA',question_ref:'217',rank:1,public:true},{id:'hidden',company_id:id,kind:'coding',section:'DSA',question_ref:'1',rank:2,public:false}]);
 expect(rows).toHaveLength(2);expect(filterCompanies(rows,' fixture ','az').map(c=>c.name)).toEqual(['Fixture Company']);expect(filterCompanies(rows,'','az')[0].name).toBe('Alpha');expect(filterCompanies(rows,'','questions')[0].questionCount).toBe(1);expect(rows[0].name).toBe('Fixture Company');expect(filterCompanies(rows,'missing','az')).toEqual([]);
});
it('validates all three tables, rejects unknown fields/refs/types and limits',()=>{
 for(const [table,fields] of [['companies',{slug:'new-company',name:'New company'}],['company_questions',{company_id:id,kind:'coding',section:'Data Structures & Algorithms',question_ref:'217'}],['interview_experiences',{company_id:id,slug:'experience',title:'An interview',role:'Engineer'}]] as const){expect(validateOperations([op(table,fields)]).ok).toBe(true);expect(validateOperations([op(table,{...fields,author:'No author'})]).ok).toBe(false);expect(validateOperations([op(table,{},'delete')]).ok).toBe(true);}
 for(const fields of [{name:'x'.repeat(161)},{name:' '},{logo_path:'https://third-party.test/logo.png'},{logo_path:'../x.png'},{slug:'Bad Slug'},{public:'true'},{sort:1.5},{overview:'\0'}])expect(validateOperations([op('companies',fields,'update')]).ok).toBe(false);
 for(const ref of ['999999999','not-a-topic','217oops'])expect(validateOperations([op('company_questions',{question_ref:ref},'update')]).ok).toBe(false);
 expect(validCompanyReference('sd-fixture','system_design',['sd-fixture'])).toBe(true);expect(validCompanyReference('sd-unknown','system_design',['sd-fixture'])).toBe(false);expect(validCompanyReference('146','coding')).toBe(false);
});
it('overlays inserts/updates/unpublish sequentially, preserves live data and validates merged references',()=>{
 const live={companies:[company],company_questions:[],interview_experiences:[]};const parsed=validateOperations([op('companies',{name:'Draft name'},'update'),op('company_questions',{company_id:id,kind:'coding',section:'DSA',question_ref:'217',public:true},'insert',qid)]);if(!parsed.ok)throw Error(parsed.message);
 const result=overlayCompanies(live,parsed.operations);expect(result.companies[0]).toMatchObject({name:'Draft name',draftChanged:true});expect(companyDirectory(result.companies,result.company_questions)[0].questionCount).toBe(1);expect(live.companies[0].name).toBe('Fixture Company');
 const deletion=validateOperations([op('companies',{},'delete')]);if(!deletion.ok)throw Error(deletion.message);expect(companyDirectory(overlayCompanies(live,deletion.operations).companies,[])).toEqual([]);
 const unknown=validateOperations([op('company_questions',{company_id:id,kind:'system_design',section:'System Design',question_ref:'sd-missing'},'insert',qid)]);if(!unknown.ok)throw Error(unknown.message);expect(()=>overlayCompanies(live,unknown.operations)).toThrow(/existing practice problem or note topic/);
});
it('revalidates directory and both company slugs',()=>{const parsed=validateOperations([op('companies',{slug:'new-slug'},'update')]);if(!parsed.ok)throw Error(parsed.message);expect(affectedRoutes(parsed.operations,[{table:'companies',values:{slug:'old-slug'}}])).toEqual(expect.arrayContaining(['/interview/companies','/interview/companies/new-slug','/interview/companies/old-slug']));});
