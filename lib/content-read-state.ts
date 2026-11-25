/** Per-browser reading state for the Content hub (no sign-in, no server). Every access is guarded: storage can be missing, full or blocked. */
export const READ_KEY='jb.content.read';
export const VIEW_KEY='jb.content.view';
export const MAX_READ=500;
export type HubView='grid'|'list';
function store():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
/** Ids (uuids) of posts and guides opened in this browser. Anything malformed is ignored. */
export function readIds():Set<string>{
 try{const raw=store()?.getItem(READ_KEY);if(!raw)return new Set();const v:unknown=JSON.parse(raw);
  return new Set(Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'&&x.length>0&&x.length<=64).slice(-MAX_READ):[]);
 }catch{return new Set();}
}
/** Remember that a post or guide was opened. Keeps the newest MAX_READ ids. Returns false when nothing could be saved. */
export function markRead(id:string):boolean{
 if(!id||id.length>64)return false;
 try{const s=store();if(!s)return false;const ids=[...readIds()].filter(x=>x!==id);ids.push(id);s.setItem(READ_KEY,JSON.stringify(ids.slice(-MAX_READ)));return true;}catch{return false;}
}
export function readView():HubView{try{return store()?.getItem(VIEW_KEY)==='list'?'list':'grid';}catch{return 'grid';}}
export function saveView(v:HubView):void{try{store()?.setItem(VIEW_KEY,v);}catch{/* a preference only */}}
