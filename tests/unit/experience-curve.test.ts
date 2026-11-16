import {describe,it,expect} from "vitest";
import {experienceLayout,experienceStops,experienceState,isPresent,experiencePoint} from "@/lib/journey/experience-curve";
import type {ExperienceRow} from "@/lib/experience";
const row=(i:number):ExperienceRow=>({id:String(i),kind:"role",title:`Role ${i}`,org:`Org ${i}`,dates:`${2000+i} – present`,location:"",summary:"",public:true,sort:i,show_on_journey:true,journey_icon:"code",experience_bullets:Array.from({length:5},(_,b)=>({id:String(b),sort:b,text:`Bullet ${b}`,public:b!==1}))});
describe("Experience curve",()=>{
 for(const count of [3,4,6,7])for(const vertical of [false,true])it(`${count} stops, ${vertical?'vertical':'horizontal'}`,()=>{
  const result=experienceLayout(count,vertical,vertical?350:1000);
  expect(result.points).toHaveLength(Math.min(count,6));expect(result.path).toMatch(/^M /);
  result.points.forEach((p,i)=>{expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(result.width);expect(p.y).toBeGreaterThan(0);expect(p.y).toBeLessThan(result.height);expect(result.path).toContain(`${p.x} ${p.y}`);if(i)expect(p.progress).toBeGreaterThan(result.points[i-1].progress)});
  expect(result.points.at(-1)?.progress).toBe(1);expect(result).toEqual(experienceLayout(count,vertical,vertical?350:1000));
 });
 it("keeps chronological loader order, newest five plus Projects, public bullets and preview markers",()=>{
  const rows=Array.from({length:7},(_,i)=>row(i));rows[3].draftChanged=true;rows[3].experience_bullets![0].draftChanged=true;
  const before=JSON.stringify(rows);const stops=experienceStops(rows);
  expect(stops.map(s=>s.id)).toEqual(['2','3','4','5','6','journey-projects']);expect(stops[1].draftChanged).toBe(true);expect(stops[1].bullets[0].draftChanged).toBe(true);
  expect(stops[0].bullets.map(b=>b.text)).toEqual(['Bullet 0','Bullet 2','Bullet 3']);expect(stops.at(-1)).toMatchObject({project:true,icon:'rocket'});expect(JSON.stringify(rows)).toBe(before);
  expect(experienceStops([{...row(0),public:false},{...row(1),show_on_journey:false}])).toHaveLength(1);
 });
 it("handles sparse and invalid dimensions without fake CV stops",()=>{
  expect(experienceStops([])[0].project).toBe(true);
  for(const n of [0,1,2,NaN])expect(experienceLayout(n,false,NaN).path).not.toContain('NaN');
 });
 it("only a date ending in present receives the current-role ring",()=>{
  for(const text of ['2024 – Present','2024-PRESENT   ','present'])expect(isPresent(text)).toBe(true);
  for(const text of ['present – 2024','2024 – now','representation',''])expect(isPresent(text)).toBe(false);
 });
 it("reverses at the same progress and advances only when the line reaches a stop",()=>{
  for(const local of [0,.2,.44,.68,.92,1]){const state=experienceState(local,4);expect(state.progress).toBeGreaterThanOrEqual(0);expect(state.progress).toBeLessThanOrEqual(1);expect(experienceState(local,4)).toEqual(state)}
  expect([.2,.44,.68,.92].map(p=>experienceState(p,4).current)).toEqual([0,1,2,3]);expect(experienceState(.44,4).progress).toBeCloseTo(1/3);
 });
});

it('mascot guide reaches every stop exactly, returns the same points in reverse, and remains finite for sparse data',()=>{
 for(const count of [1,3,4,6]){
  const {points}=experienceLayout(count);
  for(const p of [...points,...points.toReversed()]){const at=experiencePoint(points,p.progress);expect(at.x).toBeCloseTo(p.x,6);expect(at.y).toBeCloseTo(p.y,6);}
  expect(experiencePoint(points,.37)).toEqual(experiencePoint(points,.37));
 }
 expect(experiencePoint([],0)).toEqual({x:0,y:0});
});

it('pixel-rounded arrivals snap line, highlight and mascot together without hysteresis',()=>{
 expect(experienceState(.9199,4)).toEqual({progress:1,current:3});expect(experienceState(.4401,4).progress).toBeCloseTo(1/3);expect(experienceState(.4399,4).current).toBe(1);
});
