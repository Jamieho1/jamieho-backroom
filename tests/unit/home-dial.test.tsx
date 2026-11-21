import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {HomeDial} from '@/components/journey/home-dial';
import {ExperienceIcon} from '@/components/journey/experience-icon';
import {JOURNEY_ICONS} from '@/lib/home-content-schema';
import {dialData,dialCount,dialLocal,dialTime,dialShotProgress,dialAnchorLocal,coordinates} from '@/lib/journey/dial';
import {landingOf,layout,wipeOffset} from '@/lib/journey/timeline';
const project=(i:number)=>({id:String(i),name:'Project '+i,slug:'project-'+i,tagline:'Synthetic work',body:'Body must not become highlights',tags:['Volunteer'],screenshots:['https://example.test/shot.png'],url:'',public:true,featured:true,sort:i,created_at:''});
const entry={id:'education',title:'Synthetic degree',org:'Imperial',kind:'education' as const,dates:'2020',location:'London',summary:'',public:true,show_on_journey:true,journey_icon:'graduation-cap' as const,sort:0,experience_bullets:[{id:'public',text:'Public proof',sort:1,public:true},{id:'hidden',text:'Private proof',sort:0,public:false}]};
for(let count=3;count<=8;count++)it(`keeps ${count} stops, aliases and reverse positions deterministic`,()=>{const data=dialData([entry],Array.from({length:count-2},(_,i)=>project(i)));expect(dialCount(data)).toBe(count);for(let i=0;i<count;i++)expect(dialTime(dialLocal(i,count),count)).toBeCloseTo(i);expect(data.experiences[0].experience_bullets!.map(b=>b.id)).toEqual(['public']);const chapters=[{id:'about',label:'Background',kind:'section' as const,tone:'dark' as const,scroll:count,dial:data}];for(const alias of ['about','background','pivot','experience','work','projects'])expect(landingOf(chapters,alias,layout(chapters))).toBe(dialAnchorLocal(alias,data));});
it('filters public opt-ins and featured projects without mutating snapshots',()=>{const input=[entry,{...entry,id:'off',show_on_journey:false},{...entry,id:'private',public:false}];const before=structuredClone(input);const data=dialData(input,[project(1),{...project(2),public:false},{...project(3),featured:false}]);expect(data.experiences).toHaveLength(1);expect(data.projects).toHaveLength(1);expect(input).toEqual(before);expect(coordinates(entry)).toContain('51.4988');expect(coordinates({...entry,org:'KOLN',location:'Hong Kong'})).toContain('22.3193');});
it('renders natural, outlined static steps with optional highlights, no body extraction and safe About copy',()=>{const html=renderToStaticMarkup(<HomeDial still changed data={dialData([entry],[{...project(0),draftChanged:true,highlights:['Explicit proof']}])} panel={{id:'about',from:0,to:1,title:'From Study to Systems',body:'[Read](https://example.test/unwanted)'}} photos={[]} base="/home-media"/>);expect(html).toContain('dial-stacked');expect(html).toContain('Explicit proof');expect(html).toContain('data-draft-changed="true"');expect(html).toContain('Public proof');expect(html).not.toContain('Private proof');expect(html).not.toContain('Body must not');expect(html).not.toContain('href="https://example.test/unwanted"');});

it('holds complete first/last states and has no zero-wipe singularity',()=>{expect(dialTime(0,6)).toBe(0);expect(dialTime(1,6)).toBe(5);expect(wipeOffset(0,0)).toBe(0);});

it('scrubs the final project through its last image without fading away its copy',()=>{expect(dialShotProgress(dialLocal(5,6,-.25),5,6)).toBe(0);expect(dialShotProgress(dialLocal(5,6,.25),5,6)).toBe(1);expect(dialTime(dialLocal(5,6,.25),6)).toBe(5);});

it('every built-in icon normalises all shapes to pathLength 1 and neural-network is the supplied 3-3-2 network',()=>{
 for(const name of JOURNEY_ICONS){const html=renderToStaticMarkup(<ExperienceIcon name={name}/>);const shapes=html.match(/<(path|circle|rect|line)\b[^>]*>/g)??[];expect(shapes.length,name).toBeGreaterThan(0);for(const tag of shapes)expect(tag,name).toContain('pathLength="1"');expect(html).toContain('stroke="currentColor"');}
 const html=renderToStaticMarkup(<ExperienceIcon name="neural-network"/>);expect(html).toContain('viewBox="0 0 96 96"');expect(html.match(/<path\b/g)).toHaveLength(15);expect(html.match(/<circle\b/g)).toHaveLength(8);expect(html.indexOf('class="edges"')).toBeLessThan(html.indexOf('class="nodes"'));expect(html).not.toContain('metadata');
});
it('ghost layer exists only in the pinned dial; the static dial lists captions as tags above prints',()=>{
 const photos=Array.from({length:5},(_,i)=>({id:'p'+i,path:'p'+i+'.png',caption:'Caption '+i,alt:'Alt '+i,sort:i,centre:i===0,public:true}));
 const html=renderToStaticMarkup(<HomeDial still data={dialData([entry],[project(0)])} panel={{id:'about',from:0,to:1,title:'Title',body:'Body'}} photos={photos} base="/m"/>);
 expect(html).not.toContain('dial-orbit');expect(html).toContain('dial-side-photos');expect(html.match(/class="dial-tag"/g)!.length).toBeGreaterThanOrEqual(5);expect(html).not.toContain('<figcaption');
 const live=renderToStaticMarkup(<HomeDial data={dialData([entry],[project(0)])} panel={{id:'about',from:0,to:1,title:'Title',body:'Body'}} photos={photos} base="/m"/>);
 expect(live.match(/dial-orbit-photo/g)).toHaveLength(4);expect(live).toContain('dial-photo-centre');
});
it('a stop photo becomes a white print with a gold icon badge; stops without one keep the big icon',()=>{
 const role={...entry,id:'role',kind:'role' as const,title:'Synthetic role',org:'Example',location:'Hong Kong',journey_icon:'code' as const,sort:1};
 const withPhoto={...role,id:'photo',journey_photo:'journey-fixture.jpg',draftChanged:true},bare={...role,id:'bare',journey_icon:'rocket' as const};
 const panel={id:'about',from:0,to:1,title:'Title',body:'Body'};
 for(const still of [true,false]){
  const html=renderToStaticMarkup(<HomeDial still={still} data={dialData([withPhoto,bare],[project(0)])} panel={panel} photos={[]} base="/m"/>);
  const photoStep=html.slice(html.indexOf('class="dial-journey"'));
  expect(html.match(/class="dial-journey"/g),String(still)).toHaveLength(1);
  expect(photoStep).toContain('src="/m/journey-fixture.jpg');expect(photoStep).toContain('alt="Synthetic role · Example"');expect(photoStep).toContain('data-draft-changed="true"');
  // The journey photo carries the same gold caption tag as the Background photos, derived from org and location.
  expect(photoStep.slice(0,photoStep.indexOf('dial-icon-badge')+1)).toContain('<p class="dial-tag">Example · Hong Kong</p>');
  expect(html.match(/class="dial-tag"/g)).toHaveLength(1);
  expect(html.match(/dial-icon-badge/g)).toHaveLength(1);expect(html.match(/class="dial-icon(?: is-present)?"/g)).toHaveLength(1);
 }
 const noLocation=renderToStaticMarkup(<HomeDial still data={dialData([{...withPhoto,location:''}],[project(0)])} panel={panel} photos={[]} base="/m"/>);
 expect(noLocation).toContain('<p class="dial-tag">Example</p>');
 const educationOnly=renderToStaticMarkup(<HomeDial still data={dialData([entry],[project(0)])} panel={panel} photos={[{id:'c',path:'c.png',caption:'C',alt:'C',sort:0,centre:true,public:true}]} base="/m"/>);
 expect(educationOnly).not.toContain('dial-journey');expect(educationOnly).not.toContain('dial-icon-badge');
});
