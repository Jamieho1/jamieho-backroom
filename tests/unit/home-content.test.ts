import {it,expect,vi,afterEach} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {getAboutPhotos,getJourneyStops,publicAboutPhotos,publicJourneyStops} from '@/lib/home-content';
import {overlayAboutPhotos} from '@/lib/content-drafts/about-photos';
import {overlayExperience} from '@/lib/content-drafts/experience-overlay';
import {validateOperations,affectedRoutes} from '@/lib/content-drafts/allowlist';
import {parsePhotoSlots,photoPath,photoUrl,slotsComplete,validatePhotoFile} from '@/lib/content-drafts/photo-slots';
import {withPhotoOperations} from '@/lib/content-drafts/photo-server';
import {JOURNEY_ICONS,type AboutPhoto} from '@/lib/home-content-schema';
import type {ExperienceRow} from '@/lib/experience';
const key='00000000-0000-4000-8000-000000001101',set='00000000-0000-4000-8000-000000001102';
const photo=(id:string,extra:Partial<AboutPhoto>={}):AboutPhoto=>({id,path:'synthetic.png',caption:'Synthetic',alt:'Synthetic photo',sort:0,centre:false,public:true,...extra});
const item=(id:string,dates:string,sort=0):ExperienceRow=>({id,kind:'role',title:'Synthetic role',org:'Fixture',dates,sort,location:'',summary:'',public:true,show_on_journey:true,journey_icon:'briefcase',experience_bullets:Array.from({length:6},(_,i)=>({id:String(i),text:`Synthetic bullet ${i}`,sort:5-i,public:i!==5}))});
it('public photos sort centre first then sort and never leak hidden rows or mutate snapshots',async()=>{
 const rows=[photo('b',{sort:2}),photo('a',{sort:3,centre:true}),photo('c',{sort:1}),photo('hidden',{public:false})];const before=structuredClone(rows);
 expect(publicAboutPhotos(rows).map(r=>r.id)).toEqual(['a','c','b']);expect(rows).toEqual(before);
 expect((await getAboutPhotos({id:set,summary:'Preview',operations:[],aboutPhotos:rows})).map(r=>r.id)).toEqual(['a','c','b']);
});
it('journey stops order by sort ascending (not dates), tie by id, filter hidden/off rows and limit public bullets to three',async()=>{
 const rows=[item('new','2024 – Present',2),item('early','Sep 2020 – 2024',0),item('older','Jan 2020 – 2022',1),item('tie','2024',1),{...item('hidden','2018'),public:false},{...item('off','2017'),show_on_journey:false},item('undated','',7)];const before=structuredClone(rows);
 const stops=publicJourneyStops(rows);expect(stops.map(r=>r.id)).toEqual(['early','older','tie','new','undated']);expect(stops[0].experience_bullets?.map(b=>b.id)).toEqual(['4','3','2']);expect(rows).toEqual(before);
 expect(await getJourneyStops({id:set,summary:'Preview',operations:[],experience:rows})).toEqual(stops);
});
it('strict photo and journey/story drafts overlay without changing live snapshots',()=>{
 const parsed=validateOperations([{table:'about_photos',op:'insert',key,fields:{path:'fixture.png',alt:'Fixture',centre:true,public:true}},{table:'experience_items',op:'update',key,fields:{show_on_journey:true,journey_icon:'streams-plug'}},{table:'site_sections',op:'update',key:'story',fields:{title:'My story',body:''}}]);expect(parsed.ok).toBe(true);if(!parsed.ok)return;
 expect(overlayAboutPhotos([],parsed.operations)[0]).toMatchObject({id:key,centre:true,draftChanged:true});expect(overlayExperience([item(key,'2020')],parsed.operations)[0]).toMatchObject({journey_icon:'streams-plug',draftChanged:true});expect(affectedRoutes(parsed.operations)).toContain('/about');
 const live=[photo(key,{centre:true})];expect(()=>overlayAboutPhotos(live,[{op:'insert',table:'about_photos',key:set,fields:{path:'fixture.png',alt:'Fixture',centre:true}}])).toThrow(/one/);
 expect(overlayAboutPhotos(live,[{op:'delete',table:'about_photos',key,fields:{}}])).toEqual([]);expect(live).toHaveLength(1);
 for(const fields of [{path:'../x.png'},{path:'https://example.test/x.png'},{unknown:true},{alt:''},{alt:'x'.repeat(241)},{centre:1},{sort:0.5}])expect(validateOperations([{op:'update',table:'about_photos',key,fields}]).ok).toBe(false);
 for(const icon of JOURNEY_ICONS)expect(validateOperations([{op:'update',table:'experience_items',key,fields:{journey_icon:icon}}]).ok).toBe(true);
 expect(validateOperations([{op:'update',table:'experience_items',key,fields:{journey_icon:'unknown'}}]).ok).toBe(false);
});
it('home-media slots block until filled and produce a new preview photo with exact metadata and path',async()=>{
 const raw={slot:'about',expected_filename:'about.png',bucket:'home-media',target:{table:'about_photos',key,field:'path'},caption:'Fixture photo',alt:'Synthetic portrait',sort:2,public:true,path:null};
 const slots=parsePhotoSlots([raw],set);expect(slotsComplete(slots)).toBe(false);
 const sb={from:vi.fn(()=>({select:async()=>({data:[],error:null})}))} as unknown as SupabaseClient;
 expect(await withPhotoOperations(sb,[],slots)).toEqual([]);
 const ready=parsePhotoSlots([{...raw,path:photoPath(set,slots[0])}],set);const ops=await withPhotoOperations(sb,[],ready);
 expect(ops).toEqual([{op:'insert',table:'about_photos',key,fields:{path:photoPath(set,slots[0]),caption:'Fixture photo',alt:'Synthetic portrait',sort:2,centre:false,public:true}}]);
 expect(overlayAboutPhotos([],ops)[0].path).toBe(ready[0].path);expect(photoUrl(ready[0].path!,'home-media')).toContain('/home-media/drafts/');
 expect(validatePhotoFile({name:'wrong.png',type:'image/png',size:50},ready[0])).toContain('exactly');
 for(const changes of [{alt:''},{sort:1.5},{bucket:'project-media'},{path:'other.png'},{target:{table:'profiles',key,field:'path'}}])expect(()=>parsePhotoSlots([{...raw,...changes}],set)).toThrow();
 await expect(withPhotoOperations(sb,[],[...ready,{...ready[0],slot:'another'}])).rejects.toThrow(/distinct/);
});

it('dial stops follow the experience stop order set through sort: Imperial, Global Relay, KOLN3D',()=>{
 const named=(id:string,org:string,dates:string,sort:number)=>({...item(id,dates,sort),org});
 const rows=[named('koln','KOLN3D','Jun 2023 – Sep 2023',30),named('gr','Global Relay','Sep 2024 – Present',20),named('imperial','Imperial College London','Oct 2020 – Jun 2024',10)];
 expect(publicJourneyStops(rows).map(r=>r.org)).toEqual(['Imperial College London','Global Relay','KOLN3D']);
});
