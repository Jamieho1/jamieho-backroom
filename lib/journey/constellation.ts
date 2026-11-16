import type {AboutPhoto} from '@/lib/home-content-schema';
export interface PhotoPosition {index:number;x:number;y:number;width:number;height:number;tilt:number;centre:boolean}
export interface ConstellationLayout {width:number;height:number;mode:'single'|'simple'|'constellation';photos:PhotoPosition[];paths:string[]}
/** Select after public filtering, before capping: the designated centre must never be dropped. */
export function constellationPhotos(photos:readonly AboutPhoto[]):AboutPhoto[]{
 return photos.filter(p=>p.public).map(p=>({...p})).sort((a,b)=>Number(b.centre)-Number(a.centre)||a.sort-b.sort||a.id.localeCompare(b.id)).slice(0,12);
}
/** Pure bounded placement; dimensions refer to the photo board, not the whole page. */
export function constellationLayout(count:number,viewport:{width:number;height:number}):ConstellationLayout{
 const width=Number.isFinite(viewport.width)?Math.max(1,viewport.width):1000;
 const height=Number.isFinite(viewport.height)?Math.max(1,viewport.height):440;
 const n=Number.isFinite(count)?Math.min(12,Math.max(0,Math.floor(count))):0;
 const mode=n<2?'single':n<5?'simple':'constellation';
 const cx=width/2,cy=height*(mode==='simple'?.34:.5),radius=Math.min(width*.38,height*.36);
 const centreWidth=Math.min(width*.30,height*(mode==='constellation'?.32:.53)),centreHeight=Math.min(height*.67,centreWidth*1.28);
 const photos:PhotoPosition[]=n?[{index:0,x:cx,y:cy,width:centreWidth,height:centreHeight,tilt:0,centre:true}]:[];
 for(let i=1;i<n;i++){
  const angle=-Math.PI/2+(i-.5)*Math.PI*2/(n-1);
  const w=Math.min(width*(mode==='simple'?.20:.14),height*(mode==='simple'?.28:.18)),h=w*1.12;
  photos.push({index:i,x:mode==='simple'?width*i/n:cx+Math.cos(angle)*radius,y:mode==='simple'?height*.81:cy+Math.sin(angle)*radius,width:w,height:h,tilt:((i*7)%13)-6,centre:false});
 }
 const paths=photos.slice(1).map(p=>{const mx=(cx+p.x)/2,my=(cy+p.y)/2;return `M ${cx} ${cy} Q ${mx+(p.y-cy)*.12} ${my-(p.x-cx)*.06} ${p.x} ${p.y}`;});
 return {width,height,mode,photos,paths};
}
/** Only a lowercase connector between capitalised words receives the italic treatment. */
export function constellationTitle(title:string):{word:string;connector:boolean}[]{
 const words=title.trim().split(/\s+/).filter(Boolean);
 return words.map((word,i)=>({word,connector:/^(to|of|that|and)$/.test(word)&&i>0&&i<words.length-1&&/^\p{Lu}/u.test(words[i-1])&&/^\p{Lu}/u.test(words[i+1])}));
}
