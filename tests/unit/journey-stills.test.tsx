import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
vi.mock('@/components/journey/navigation',()=>({JourneyNavigation:()=>null}));
vi.mock('@/components/journey/contact-brief',()=>({ContactBrief:()=>null}));
import {StillJourney} from '@/components/journey/journey';
import {HOME_CHAPTERS} from '@/lib/journey/chapters';
import {phoneChapters} from '@/lib/journey/phone';
it('still and phone render the complete new order with canonical and native legacy About anchors',()=>{
 for(const chapters of [HOME_CHAPTERS,phoneChapters(HOME_CHAPTERS)]){
  const html=renderToStaticMarkup(<StillJourney chapters={chapters} base="/home-media"/>);
  const ids=[...html.matchAll(/<li[^>]* id="([^"]+)"/g)].map(m=>m[1]);
  expect(ids).toEqual(['sky','about','toolkit','cta','creator']);
  expect(html).toContain('id="pivot"');expect(html).toContain('journey-anchor-alias');
  for(const retired of ['journey-about-photos','still-westminster','journey-timeline'])expect(html).not.toContain(retired);
 }
});

it('static dial retains public tags and natural screenshot rows',()=>{
 const html=renderToStaticMarkup(<StillJourney base="/home-media" chapters={[{id:'about',label:'Background',kind:'section',tone:'dark',scroll:1,dial:{experiences:[],projects:[{id:'p',slug:'synthetic',name:'Synthetic project',body:'',tags:['Volunteer'],tagline:'',url:'',public:true,featured:true,sort:0,created_at:'',screenshots:[]}]}}]}/>);
 expect(html).toContain('dial-stacked');expect(html).toContain('Volunteer');expect(html).toContain('id="projects"');
});
