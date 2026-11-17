import type {AboutPhoto} from '@/lib/home-content-schema';
/** Select after public filtering, before capping: the designated centre must never be dropped. */
export function constellationPhotos(photos:readonly AboutPhoto[]):AboutPhoto[]{
 return photos.filter(p=>p.public).map(p=>({...p})).sort((a,b)=>Number(b.centre)-Number(a.centre)||a.sort-b.sort||a.id.localeCompare(b.id)).slice(0,12);
}
/** Only a lowercase connector between capitalised words receives the italic treatment. */
export function constellationTitle(title:string):{word:string;connector:boolean}[]{
 const words=title.trim().split(/\s+/).filter(Boolean);
 return words.map((word,i)=>({word,connector:/^(to|of|that|and)$/.test(word)&&i>0&&i<words.length-1&&/^\p{Lu}/u.test(words[i-1])&&/^\p{Lu}/u.test(words[i+1])}));
}
