import {it,expect} from 'vitest';
import {resumeDocumentSchema,emptyResume,moveResumeItem,sortResume} from '@/lib/resume';
import {validateOperations,affectedRoutes} from '@/lib/content-drafts/allowlist';
const entry={id:'00000000-0000-4000-8000-000000000121',kind:'role' as const,title:'Synthetic role',org:'Example org',dates:'2025',location:'Remote',summary:'Synthetic summary',sort:0,bullets:[{id:'00000000-0000-4000-8000-000000000122',text:'Synthetic bullet',sort:0}]};
it('validates the whole resume and rejects identity, publication and invalid nested fields',()=>{
 expect(resumeDocumentSchema.safeParse(emptyResume()).success).toBe(true);expect(resumeDocumentSchema.safeParse({entries:[entry]}).success).toBe(true);
 for(const bad of [{entries:[{...entry,user_id:'someone'}]},{entries:[{...entry,public:true}]},{entries:[entry,entry]},{entries:[{...entry,title:' '.repeat(2)}]},{entries:[{...entry,title:'x'.repeat(161)}]},{entries:[{...entry,sort:-1}]},{entries:[{...entry,bullets:[entry.bullets[0],entry.bullets[0]]}]},{entries:[{...entry,bullets:[{...entry.bullets[0],text:'x'.repeat(1001)}]}]},{entries:[{...entry,kind:'unknown'}]}])expect(resumeDocumentSchema.safeParse(bad).success).toBe(false);
});
it('sorts/reorders without mutating a template or another resume',()=>{
 const copy={entries:[entry,{...entry,id:'00000000-0000-4000-8000-000000000123',sort:2}]};const moved=moveResumeItem(copy.entries,0,1);expect(moved[0].id).toBe(copy.entries[1].id);expect(copy.entries[0]).toBe(entry);expect(sortResume(copy).entries[0].id).toBe(entry.id);
});
it('drafts only update the singleton public template; private resumes are not draftable',()=>{
 const op={table:'resume_templates',op:'update',key:'default',fields:{content:{entries:[entry]}}};const parsed=validateOperations([op]);expect(parsed.ok).toBe(true);if(parsed.ok)expect(affectedRoutes(parsed.operations)).toEqual(['/interview/resume']);
 for(const bad of [{...op,table:'user_resumes'},{...op,op:'delete'},{...op,op:'insert'},{...op,key:'other'},{...op,fields:{user_id:'someone'}},{...op,fields:{content:{entries:[{...entry,title:''}]}}},{...op,fields:{}}])expect(validateOperations([bad]).ok).toBe(false);
});
