import { describe, it, expect } from 'vitest';
import { validateOperations, affectedRoutes } from '@/lib/content-drafts/allowlist';
import { overlayExperience, publicExperienceRows } from '@/lib/content-drafts/experience-overlay';
import { fromRows, type ExperienceRow, LIMITS } from '@/lib/experience';
import { reviewFields } from '@/lib/content-drafts/types';
const item='00000000-0000-4000-8000-000000000401';
const other='00000000-0000-4000-8000-000000000402';
const bullet='00000000-0000-4000-8000-000000000403';
const added='00000000-0000-4000-8000-000000000404';
const op=(table='experience_items',action='update',fields:unknown={title:'New title'},key=item)=>({table,op:action,fields,key});
const parse=(ops:unknown)=>{const r=validateOperations(ops);if(!r.ok)throw Error(r.message);return r.operations;};
const row=(id=item,visible=true):ExperienceRow=>({id,kind:'role',title:'Live role',org:'Example',dates:'2024',location:'London',summary:'Live summary',sort:100,public:visible,experience_bullets:[]});
describe('experience draft validation',()=>{
 it('accepts every editor content field and preserves CV routes',()=>{
  const result=parse([op('experience_items','insert',{kind:'skills',title:' Title ',org:' Org ',dates:'Dates',location:'Location',summary:' Summary ',sort:0,public:true}),op('experience_bullets','insert',{item_id:item,text:' Proof ',sort:1,public:true},bullet),op('experience_bullets','update',{item_id:other,text:'Edit',sort:2,public:false},bullet),op('experience_bullets','delete',{},bullet)]);
  expect(result[0].fields).toMatchObject({title:'Title',org:'Org',summary:'Summary'});
  expect(affectedRoutes(result)).toEqual(['/','/journey','/about','/behavioral']);
 });
 for(const action of ['insert','update']) {
  for(const [field,max] of Object.entries(LIMITS).filter(([f])=>f!=='bullet'))it(`${action} enforces editor ${field} length`,()=>{
   expect(validateOperations([op('experience_items',action,{title:'Valid',[field]:'x'.repeat(max)})]).ok).toBe(true);
   expect(validateOperations([op('experience_items',action,{title:'Valid',[field]:'x'.repeat(max+1)})]).ok).toBe(false);
  });
  it(`${action} refuses invalid item values and unknown fields`,()=>{
   for(const fields of [{title:' '},{title:'X',kind:'unknown'},{title:'X',public:'yes'},{title:'X',sort:1.5},{title:'X',sort:2147483648},{title:'X',updated_at:'today'},{title:'X',summary:null}])expect(validateOperations([op('experience_items',action,fields)]).ok).toBe(false);
  });
  it(`${action} refuses invalid bullet values and parent identifiers`,()=>{
   for(const fields of [{text:'',item_id:item},{text:'x'.repeat(1001),item_id:item},{text:'X',item_id:'invalid'},{text:'X',item_id:item,sort:'1'},{text:'X',item_id:item,public:0},{text:'X',item_id:item,id:bullet}])expect(validateOperations([op('experience_bullets',action,fields,bullet)]).ok).toBe(false);
  });
 }
 it('requires insert identity/fields, permits only bullet deletion and rejects empty updates',()=>{
  for(const operation of [op('experience_items','insert',{}),op('experience_bullets','insert',{text:'X'},bullet),op('experience_items','delete',{}),op('experience_bullets','delete',{text:'X'},bullet),op('experience_items','update',{}),op('experience_bullets','update',{},bullet),op('experience_items','update',{title:'X'},'invalid')])expect(validateOperations([operation]).ok).toBe(false);
  expect(validateOperations([{table:'experience_bullets',op:'delete',key:bullet}]).ok).toBe(true);
 });
 it('matches editor UTF-16 limits, trims ECMAScript whitespace and explains failures',()=>{
  expect(parse([op('experience_items','update',{title:'\u00a0Title\ufeff'})])[0].fields).toEqual({title:'Title'});
  expect(validateOperations([op('experience_items','update',{title:'😀'.repeat(80)})]).ok).toBe(true);
  const result=validateOperations([op('experience_items','update',{title:'😀'.repeat(81)})]);expect(result.ok).toBe(false);if(!result.ok)expect(result.message).toContain('160');
  expect(validateOperations([op('experience_bullets','update',{text:'\0'},bullet)]).ok).toBe(false);
 });
});
describe('experience preview snapshot',()=>{
 it('adds, edits and hides atomically in an immutable snapshot; Home omits hidden data',()=>{
  const live=[row(),row(other)];const before=structuredClone(live);
  const snapshot=overlayExperience(live,parse([op('experience_bullets','insert',{item_id:item,text:'Added proof',public:true},bullet),op('experience_items','update',{title:'Draft title'}),op('experience_items','update',{public:false},other)]));
  expect(live).toEqual(before);
  const home=fromRows(publicExperienceRows(snapshot));expect(home).toHaveLength(1);expect(home[0]).toMatchObject({title:'Draft title',draftChanged:true,bullets:[{text:'Added proof',draftChanged:true}]});
  expect(fromRows(snapshot)[1]).toMatchObject({id:other,public:false,draftChanged:true});
 });
 it('creates hidden defaults, supports sequential item+bullet inserts, moves and deletes bullets',()=>{
  const ops=parse([op('experience_items','insert',{title:'New hidden item'},other),op('experience_bullets','insert',{item_id:other,text:'New hidden bullet'},added),op('experience_bullets','update',{item_id:item,text:'Moved'},added)]);
  const snapshot=overlayExperience([row()],ops);
  expect(snapshot.find(r=>r.id===other)).toMatchObject({kind:'role',sort:100,public:false,org:'',draftChanged:true,experience_bullets:[]});
  expect(snapshot[0].experience_bullets?.[0]).toMatchObject({text:'Moved',sort:100,public:false,draftChanged:true});
  expect(publicExperienceRows(snapshot)[0].experience_bullets).toEqual([]);
  expect(overlayExperience(snapshot,parse([op('experience_bullets','delete',{},added)]))[0]).toMatchObject({draftChanged:true,experience_bullets:[]});
 });
 it('refuses stale targets, duplicate insert keys and missing parents without mutating live data',()=>{
  const live=[row()];const before=structuredClone(live);
  for(const operation of [op('experience_items','update',{title:'X'},other),op('experience_items','insert',{title:'X'}),op('experience_bullets','insert',{item_id:other,text:'X'},bullet),op('experience_bullets','delete',{},bullet)])expect(()=>overlayExperience(live,parse([operation]))).toThrow();
  expect(live).toEqual(before);
 });
 it('review shows current values, new fields and the complete deleted bullet',()=>{
  const result=reviewFields(parse([op('experience_items','update',{title:'Draft'}),op('experience_bullets','insert',{item_id:item,text:'New'},added),op('experience_bullets','delete',{},bullet)]),{}, {experience_items:{[item]:{title:'Live'}},experience_bullets:{[bullet]:{id:bullet,text:'Old',item_id:item,public:true,sort:1}}});
  expect(result[0]).toMatchObject({current:'Live',proposed:'Draft'});expect(result[1].current).toBe('(new row)');expect(result.at(-1)?.current).toContain('Old');expect(result.at(-1)?.proposed).toBe('(delete bullet)');
 });
});
