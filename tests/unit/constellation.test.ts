import {describe,it,expect} from 'vitest';
import {constellationLayout,constellationPhotos,constellationTitle} from '@/lib/journey/constellation';
import type {AboutPhoto} from '@/lib/home-content-schema';
const photo=(i:number,centre=false):AboutPhoto=>({id:String(i),path:'synthetic.png',caption:'Synthetic',alt:'Synthetic',sort:i,centre,public:true});
describe('constellation layout',()=>{
 for(const count of [1,4,5,12,13])for(const viewport of [{width:1100,height:440},{width:700,height:400},{width:390,height:380}])it(`bounds ${count} photos at ${viewport.width}px with stable tilts and ordering`,()=>{
  const result=constellationLayout(count,viewport);expect(result.photos).toHaveLength(Math.min(count,12));expect(result.paths).toHaveLength(Math.min(count,12)-1);
  expect(result.mode).toBe(count===1?'single':count<5?'simple':'constellation');
  expect(result).toEqual(constellationLayout(count,viewport));
  for(const p of result.photos){expect(p.x-p.width/2).toBeGreaterThanOrEqual(0);expect(p.y-p.height/2).toBeGreaterThanOrEqual(0);expect(p.x+p.width/2).toBeLessThanOrEqual(viewport.width);expect(p.y+p.height/2).toBeLessThanOrEqual(viewport.height);expect(p.tilt).toBeGreaterThanOrEqual(-6);expect(p.tilt).toBeLessThanOrEqual(6);}
  expect(result.photos[0]).toMatchObject({index:0,centre:true,tilt:0});
 });
 it('filters publication, chooses centre before the cap, falls back to first sort and never mutates input',()=>{
  const photos=Array.from({length:14},(_,i)=>photo(i,i===13));photos[0].public=false;const copy=structuredClone(photos);
  const selected=constellationPhotos(photos);expect(selected).toHaveLength(12);expect(selected[0].id).toBe('13');expect(selected.slice(1).map(p=>p.id)).toEqual(Array.from({length:11},(_,i)=>String(i+1)));expect(photos).toEqual(copy);
  expect(constellationPhotos([photo(2),photo(1)])[0].id).toBe('1');expect(constellationPhotos([])).toEqual([]);
 });
 it('handles empty or invalid counts/dimensions safely',()=>{expect(constellationLayout(0,{width:0,height:0}).photos).toEqual([]);expect(constellationLayout(NaN,{width:NaN,height:Infinity}).photos).toEqual([]);});
 it('styles lowercase connectors only between capitalised words without changing copy',()=>{
  expect(constellationTitle('From Biomedical Engineering to AI Engineering').filter(w=>w.connector).map(w=>w.word)).toEqual(['to']);
  expect(constellationTitle('Systems of Meaning and Purpose').filter(w=>w.connector).map(w=>w.word)).toEqual(['of','and']);
  expect(constellationTitle('to build and learn').some(w=>w.connector)).toBe(false);expect(constellationTitle('FROM LAB TO CODE').some(w=>w.connector)).toBe(false);
 });
});
