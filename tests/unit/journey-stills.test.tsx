import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
vi.mock('@/components/journey/navigation',()=>({JourneyNavigation:()=>null}));
vi.mock('@/components/journey/screen-contact',()=>({ScreenContact:()=>null,ContactContent:()=>null}));
import {StillJourney} from '@/components/journey/journey';
import {HOME_CHAPTERS} from '@/lib/journey/chapters';
import {phoneChapters} from '@/lib/journey/phone';
it('still and phone render the complete new order with canonical and native legacy About anchors',()=>{
 for(const chapters of [HOME_CHAPTERS,phoneChapters(HOME_CHAPTERS)]){
  const html=renderToStaticMarkup(<StillJourney chapters={chapters} base="/home-media"/>);
  const ids=[...html.matchAll(/<li[^>]* id="([^"]+)"/g)].map(m=>m[1]);
  expect(ids).toEqual(['sky','about','experience','projects','toolkit','creator','desk','screen']);
  expect(html).toContain('id="pivot"');expect(html).toContain('journey-anchor-alias');
  for(const retired of ['journey-about-photos','still-westminster','journey-timeline'])expect(html).not.toContain(retired);
 }
});

it('static Work retains project tags, including the Volunteer label',()=>{
 const html=renderToStaticMarkup(<StillJourney base="/home-media" chapters={[{id:'projects',label:'Work',kind:'section',tone:'dark',scroll:1,showcase:[{slug:'synthetic',name:'Synthetic project',tags:['Volunteer'],tagline:'',href:'/projects/synthetic',shots:[]}]}]}/>);
 expect(html).toContain('journey-chips');expect(html).toContain('Volunteer');
});
