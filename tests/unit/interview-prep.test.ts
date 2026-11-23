import {it,expect} from 'vitest';
import {prepLinksSchema,validPrepRef,unknownPrepLinks,resolvePrepLink,resolvePrepLinks,groupPrepItems,mostMentionedTopics,chipRefs,unknownChips,renderChips,stripChips,questionRef,type PrepContext,type PrepLink} from '@/lib/interview/prep';
import {experienceExcerpt} from '@/lib/interview/experiences';
import {noteSection,sectionTopics,noteHref,ROLE_NOTE_SECTIONS} from '@/lib/interview/content';
import {PRACTICE_ANCHORS,leetcodeSlug} from '@/lib/notes/neetcode150';
import {overlayCompanies as overlay,COMPANY_ALLOWLIST,companyOperation} from '@/lib/content-drafts/companies';
import {interviewExperienceSchema,companyDefaults} from '@/lib/interview/companies';
const ctx:PrepContext={notes:[{id:'full-stack-locking',title:'Locking mechanisms'},{id:'sd-fixture',title:'System design: Synthetic architecture'}],themes:[{id:'conflict',title:'Conflict',total:3,answered:1},{id:'leadership',title:'Leadership',total:2}]};
it('validates prep link shape, duplicates and the 20 link cap',()=>{
 expect(prepLinksSchema.safeParse([{kind:'note',ref:'arrays-hashing'},{kind:'question',ref:'217',label:'Contains Duplicate'},{kind:'behavioral_theme',ref:'conflict'}]).success).toBe(true);
 for(const bad of [[{kind:'other',ref:'a'}],[{kind:'note',ref:'A'}],[{kind:'note',ref:'a',extra:1}],[{kind:'note',ref:'a',label:' '}],[{kind:'note',ref:'a'},{kind:'note',ref:'a'}],'x',Array.from({length:21},(_,i)=>({kind:'note',ref:'n'+i}))])expect(prepLinksSchema.safeParse(bad).success,JSON.stringify(bad).slice(0,50)).toBe(false);
 expect(prepLinksSchema.safeParse([{kind:'note',ref:'a'},{kind:'question',ref:'a'}]).success).toBe(true);
});
it('refuses unknown references per kind but accepts fixed topics, snapshot notes, catalogue questions and live themes',()=>{
 expect(validPrepRef('note','arrays-hashing',ctx)).toBe(true);expect(validPrepRef('note','full-stack-locking',ctx)).toBe(true);expect(validPrepRef('note','full-stack-missing',ctx)).toBe(false);expect(validPrepRef('note','trees-unknown',ctx)).toBe(false);
 expect(validPrepRef('question','146',ctx)).toBe(true);expect(validPrepRef('question','99999',ctx)).toBe(false);expect(validPrepRef('question','lru-cache',ctx)).toBe(false);
 expect(validPrepRef('behavioral_theme','conflict',ctx)).toBe(true);expect(validPrepRef('behavioral_theme','nope',ctx)).toBe(false);
 expect(unknownPrepLinks([{kind:'note',ref:'nope'},{kind:'question',ref:'1'}],ctx)).toEqual([{kind:'note',ref:'nope'}]);
 // Visitors cannot read private note metadata, so rendering accepts well-formed section-prefixed ids but not arbitrary text.
 expect(validPrepRef('note','full-stack-other',{notes:[],themes:[]},false)).toBe(true);expect(validPrepRef('note','plainword',{notes:[],themes:[]},false)).toBe(false);
});
it('resolves labels, hrefs and groups; hides empty groups; visitors never get private note titles',()=>{
 const items=resolvePrepLinks([{kind:'behavioral_theme',ref:'conflict'},{kind:'note',ref:'full-stack-locking'},{kind:'question',ref:'217'},{kind:'note',ref:'sd-fixture',label:'Authored label'},{kind:'question',ref:'999999'}],ctx);
 expect(items.map(i=>[i.kind,i.label,i.href])).toEqual([['behavioral_theme','Conflict','/interview/behavioral/themes/conflict'],['note','Locking mechanisms','/interview/full-stack/notes/full-stack-locking'],['question','Contains Duplicate','/interview/problems/217'],['note','Authored label','/interview/system-design/notes/sd-fixture']]);
 expect(items[0]).toMatchObject({total:3,answered:1});expect(items[2].difficulty).toBe('Easy');
 expect(groupPrepItems(items).map(g=>[g.label,g.items.length])).toEqual([['Concepts',2],['Practice',1],['Behavioral',1]]);
 expect(groupPrepItems(items.filter(i=>i.group==='practice')).map(g=>g.label)).toEqual(['Practice']);expect(groupPrepItems([])).toEqual([]);
 expect(resolvePrepLink({kind:'note',ref:'full-stack-locking'},{notes:[],themes:[]})?.label).toBe('Locking');
 expect(resolvePrepLink({kind:'note',ref:'arrays-hashing'},{notes:[],themes:[]})?.label).toBe('Arrays & Hashing');
});
it('parses inline chips outside code, accepts question title slugs and reports unknown ones',()=>{
 const text='See [[note:full-stack-locking]] and [[question:lru-cache]] then [[behavioral:conflict]] — not `[[note:in-code]]` nor\n```\n[[question:fenced]]\n```\n[[note:missing-one]] [[bogus:x]]';
 expect(chipRefs(text).map(c=>c.kind+':'+c.ref)).toEqual(['note:full-stack-locking','question:146','behavioral_theme:conflict','note:missing-one']);
 expect(unknownChips(text,ctx).map(c=>c.raw)).toEqual(['[[note:missing-one]]']);
 const out=renderChips(text,ctx);
 expect(out).toContain('[Locking mechanisms](/interview/full-stack/notes/full-stack-locking "iv-chip")');expect(out).toContain('[LRU Cache](/interview/problems/146 "iv-chip")');expect(out).toContain('[Conflict](/interview/behavioral/themes/conflict "iv-chip")');
 expect(out).toContain('`[[note:in-code]]`');expect(out).toContain('[[question:fenced]]');expect(out).not.toContain('[[note:missing-one]]');expect(out).toContain('missing-one');expect(out).toContain('[[bogus:x]]');
 expect(renderChips('no chips here',ctx)).toBe('no chips here');expect(stripChips('a [[note:x-y]] b')).toBe('a x-y b');
 expect(renderChips('[[note:full-stack-locking]]',{notes:[{id:'full-stack-locking',title:'A [odd] *title*'}],themes:[]})).toContain('A \\[odd\\] \\*title\\*');
});
it('title slugs resolve uniquely and numeric ids pass through',()=>{
 expect(questionRef('146')).toBe('146');expect(questionRef('lru-cache')).toBe('146');expect(questionRef('2147')).toBeUndefined();expect(questionRef('not-a-question')).toBeUndefined();
 const slugs=PRACTICE_ANCHORS.map(p=>p.slug??leetcodeSlug(p.title));expect(new Set(slugs).size).toBe(slugs.length);
});
it('aggregates published prep links by count (top 8) once per experience with stable ties',()=>{
 const l=(kind:PrepLink['kind'],ref:string,label?:string):PrepLink=>({kind,ref,...(label?{label}:{})});
 const rows=[{published:true,prep_links:[l('note','arrays-hashing'),l('note','arrays-hashing'),l('question','217')]},{published:true,prep_links:[l('note','arrays-hashing','Hashing'),l('behavioral_theme','conflict')]},{published:false,prep_links:[l('question','217'),l('question','217')]},{published:true}];
 expect(mostMentionedTopics(rows)).toEqual([{kind:'note',ref:'arrays-hashing',count:2,label:'Hashing'},{kind:'question',ref:'217',count:1},{kind:'behavioral_theme',ref:'conflict',count:1}]);
 const many=[{published:true,prep_links:Array.from({length:12},(_,i)=>l('note','topic-'+String(i).padStart(2,'0')))}];
 expect(mostMentionedTopics(many).map(t=>t.ref)).toEqual(Array.from({length:8},(_,i)=>'topic-'+String(i).padStart(2,'0')));expect(mostMentionedTopics([])).toEqual([]);
});
it('assigns role notes to role sections without disturbing existing assignment',()=>{
 expect(noteSection('full-stack-locking')).toBe('full-stack');expect(noteSection('fde-intake')).toBe('forward-deploy-engineer');expect(noteSection('data-science-bias')).toBe('data-scientist');expect(noteSection('ml-overfitting')).toBe('machine-learning');
 expect(noteSection('sd-x')).toBe('system-design');expect(noteSection('ai-x')).toBe('ai-engineering');expect(noteSection('trees')).toBe('dsa');
 const notes=[{id:'full-stack-locking',title:'Locking mechanisms'},{id:'ml-x',title:'ML X'}];
 expect(sectionTopics('full-stack',notes).map(t=>t.id)).toEqual(['full-stack-locking']);expect(sectionTopics('machine-learning',notes).map(t=>t.id)).toEqual(['ml-x']);expect(sectionTopics('data-scientist',notes)).toEqual([]);expect(sectionTopics('dsa',notes)).toHaveLength(17);
 expect(noteHref('full-stack-locking')).toBe('/interview/full-stack/notes/full-stack-locking');expect(ROLE_NOTE_SECTIONS).toHaveLength(4);
});
it('experience excerpts show chip references as plain text',()=>{expect(experienceExcerpt('Practise [[question:lru-cache]] first.')).toBe('Practise lru-cache first.');});
it('prep_links is an allowlisted draft field, optional when reading older rows',()=>{
 expect(COMPANY_ALLOWLIST.interview_experiences.fields).toHaveProperty('prep_links');
 const op=companyOperation('interview_experiences');const key='00000000-0000-4000-8000-000000000001';
 expect(op.safeParse({table:'interview_experiences',op:'update',key,fields:{prep_links:[{kind:'note',ref:'arrays-hashing'}]}}).success).toBe(true);
 expect(op.safeParse({table:'interview_experiences',op:'update',key,fields:{prep_links:[{kind:'note',ref:'Bad'}]}}).success).toBe(false);
 const row={id:key,company_id:key,slug:'a',title:'T',level:'Mid',role:'R',interview_date:'',region:'',body:'',published:true,published_at:null};
 expect(interviewExperienceSchema.parse(row).prep_links).toBeUndefined();expect(companyDefaults.interview_experiences.prep_links).toEqual([]);
});
type Ops=Parameters<typeof overlay>[1];
const overlayCompanies=(l:Parameters<typeof overlay>[0],ops:unknown[],notes?:string[],themes?:string[])=>overlay(l,ops as Ops,notes,themes);
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const live=()=>({companies:[{id:id(1),slug:'c',name:'C',logo_path:'',overview:'',sort:1,public:true}],company_questions:[],interview_experiences:[{id:id(2),company_id:id(1),slug:'e',title:'E',level:'Mid' as const,role:'R',interview_date:'',region:'',body:'',published:true,published_at:null,prep_links:[]}]});
const upd=(fields:Record<string,unknown>)=>[{op:'update' as const,table:'interview_experiences',key:id(2),fields}];
it('Content Drafts refuses unknown prep links and unknown inline references, but accepts known ones',()=>{
 const ok=overlayCompanies(live(),upd({prep_links:[{kind:'note',ref:'arrays-hashing'},{kind:'note',ref:'full-stack-locking'},{kind:'question',ref:'217'},{kind:'behavioral_theme',ref:'conflict'}],body:'[[question:lru-cache]] [[note:full-stack-locking]] [[behavioral:conflict]]'}),['full-stack-locking'],['conflict']);
 expect(ok.interview_experiences[0].prep_links).toHaveLength(4);
 expect(()=>overlayCompanies(live(),upd({prep_links:[{kind:'note',ref:'full-stack-missing'}]}),['x'],[])).toThrow(/Unknown prep link: note:full-stack-missing/);
 expect(()=>overlayCompanies(live(),upd({prep_links:[{kind:'question',ref:'99999'}]}),[],[])).toThrow(/Unknown prep link/);
 expect(()=>overlayCompanies(live(),upd({prep_links:[{kind:'behavioral_theme',ref:'zzz'}]}),[],['conflict'])).toThrow(/Unknown prep link/);
 expect(()=>overlayCompanies(live(),upd({body:'See [[note:nope-note]].'}),[],[])).toThrow(/Unknown inline reference.*\[\[note:nope-note\]\]/);
 expect(()=>overlayCompanies(live(),[{op:'update',table:'companies',key:id(1),fields:{overview:'[[question:not-real]]'}}],[],[])).toThrow(/overview/);
 // A theme inserted earlier in the same set is acceptable; untouched live rows are not re-validated.
 expect(overlayCompanies(live(),[{op:'insert',table:'interview_behavioral_themes',key:'fresh-theme',fields:{title:'Fresh',color:'#112233',sort:1}},...upd({prep_links:[{kind:'behavioral_theme',ref:'fresh-theme'}]})],[],[]).interview_experiences[0].prep_links).toHaveLength(1);
 const stale=live();stale.interview_experiences[0].body='[[note:gone]]';expect(()=>overlayCompanies(stale,[{op:'update',table:'companies',key:id(1),fields:{name:'C2'}}],[],[])).not.toThrow();
});
