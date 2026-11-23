import {z} from 'zod';
import {plainHeading} from './system-design';

/** S2: pure whiteboard helpers (template, library blocks, saved scene, timer). Nothing here imports Excalidraw at runtime. */
export const WB_LIMITS={elements:3000,bytes:900_000,functional:12,line:44} as const;
export const WB_STORAGE_PREFIX='jb.sd.board.v1.';
export const WB_PANEL_KEY='jb.sd.board.panel.v1';
export const wbHref=(slug:string)=>`/interview/system-design/${encodeURIComponent(slug)}/whiteboard`;

// ---- Template ------------------------------------------------------------------------------------------------------
export interface WbTemplateInput{title:string;solution:string}
export interface WbTemplateText{id:string;x:number;y:number;text:string;size:number;grey?:boolean}
export interface WbTemplateFrame{id:string;name:string;x:number;y:number;w:number;h:number;children:string[]}
export interface WbTemplate{texts:WbTemplateText[];frames:WbTemplateFrame[];width:number;height:number}

/** Hard-wraps on spaces so template text stays inside its frame; a single over-long word is kept whole. */
export function wrapText(text:string,width:number):string[]{
 const out:string[]=[];
 for(const para of text.split(/\r?\n/)){
  let line='';
  for(const word of para.split(/\s+/).filter(Boolean)){
   if(line&&Array.from(line+' '+word).length>width){out.push(line);line=word;}else line=line?line+' '+word:word;
  }
  out.push(line);
 }
 return out;
}
const inline=(s:string)=>plainHeading(s.replace(/<[^>]*>/g,''));
const FENCE=/^ {0,3}(`{3,}|~{3,})/;
/** Lines of one `##` section (fenced code blocks are skipped), matched case-insensitively on the heading text. */
export function sectionLines(markdown:string,heading:string):string[]{
 let fence:string|null=null,inside=false;const out:string[]=[];
 for(const line of markdown.split(/\r?\n/)){
  const f=FENCE.exec(line);
  if(fence){if(f&&f[1][0]===fence[0]&&line.trim()===f[1])fence=null;continue;}
  if(f){fence=f[1];continue;}
  const h=/^ {0,3}##(?!#)\s+(.+?)\s*$/.exec(line);
  if(h){inside=inline(h[1]).toLowerCase()===heading.toLowerCase();continue;}
  if(inside)out.push(line);
 }
 return out;
}
/** One-line task for the board: the first sentence of the Overview, if the question has one. */
export function overviewSentence(solution:string):string{
 const paragraph=sectionLines(solution,'Overview').filter(l=>l.trim()&&!/^\s*(#|[-*]\s|\d+\.\s|>|`{3}|~{3})/.test(l)).join(' ');
 const text=inline(paragraph).replace(/\s+/g,' ').trim();
 const m=/^(.+?[.!?])(\s|$)/.exec(text);const sentence=(m?m[1]:text).trim();
 return Array.from(sentence).length>160?Array.from(sentence).slice(0,157).join('')+'…':sentence;
}
/** Bullets of the Requirements section that sit before any "### Non-functional…" (or other) sub-heading, or under "### Functional…". */
export function functionalRequirements(solution:string):string[]{
 const items:string[]=[];let mode:'functional'|'skip'='functional';
 for(const line of sectionLines(solution,'Requirements')){
  const h=/^ {0,3}###(?!#)\s+(.+?)\s*$/.exec(line);
  if(h){const label=inline(h[1]);mode=/functional/i.test(label)&&!/non[\s-]?functional/i.test(label)?'functional':'skip';continue;}
  if(mode!=='functional')continue;
  const b=/^\s*(?:[-*+]|\d+[.)])\s+(.+?)\s*$/.exec(line);if(!b)continue;
  const text=inline(b[1]);if(!text)continue;
  items.push(Array.from(text).length>120?Array.from(text).slice(0,117).join('')+'…':text);
  if(items.length>=WB_LIMITS.functional)break;
 }
 return items;
}
const EXAMPLES:Record<string,string>={
 functional:'Example: Users can post a message\nand read the latest ones.',
 non:'Example: reads under 200 ms,\n99.9% available, eventually consistent.',
 entities:'Example: User, Message, Channel',
 api:'Example: POST /messages -> 201\nGET /channels/{id}/messages',
};
/** The starting board, as plain data the canvas turns into Excalidraw elements. All text comes from the question or is generic. */
export function buildTemplate({title,solution}:WbTemplateInput):WbTemplate{
 const texts:WbTemplateText[]=[];const frames:WbTemplateFrame[]=[];
 const heading=Array.from(title.trim()||'System design').slice(0,100).join('');
 texts.push({id:'wb-title',x:0,y:0,text:heading,size:36});
 const sentence=overviewSentence(solution);
 const task=wrapText(`Your task: design ${heading}.${sentence?' '+sentence:''}`,110).join('\n');
 texts.push({id:'wb-task',x:0,y:60,text:task,size:20,grey:true});
 const top=60+task.split('\n').length*26+50;
 const fr=functionalRequirements(solution);
 const frText=fr.length?fr.flatMap(i=>wrapText(i,WB_LIMITS.line-2).map((l,n)=>(n?'  ':'• ')+l)):[];
 const COLUMN=420,GAP=50;let y=top;
 const specs=[{key:'functional',name:'Functional Requirements',lines:frText},{key:'non',name:'Non-Functional Requirements',lines:[]},{key:'entities',name:'Core Entities',lines:[]},{key:'api',name:'API Design',lines:[]}];
 for(const s of specs){
  const h=Math.max(240,64+s.lines.length*24);const children:string[]=[];
  if(s.lines.length){const id=`wb-${s.key}-items`;texts.push({id,x:20,y:y+24,text:s.lines.join('\n'),size:18});children.push(id);}
  frames.push({id:`wb-${s.key}`,name:s.name,x:0,y,w:COLUMN,h,children});
  texts.push({id:`wb-${s.key}-example`,x:COLUMN+30,y:y+8,text:EXAMPLES[s.key],size:16,grey:true});
  y+=h+GAP;
 }
 const hldX=COLUMN+620,hldH=Math.max(1000,y-top-GAP);
 frames.push({id:'wb-hld',name:'High-Level Design',x:hldX,y:top,w:1300,h:hldH,children:[]});
 return {texts,frames,width:hldX+1300,height:top+hldH};
}
/** Excalidraw element skeletons (input of convertToExcalidrawElements) for a template. */
export function templateSkeletons(t:WbTemplate):Record<string,unknown>[]{
 return [
  ...t.texts.map(x=>({type:'text',id:x.id,x:x.x,y:x.y,text:x.text,fontSize:x.size,...(x.grey?{strokeColor:'#868e96'}:{})})),
  ...t.frames.map(f=>({type:'frame',id:f.id,name:f.name,x:f.x,y:f.y,width:f.w,height:f.h,children:f.children})),
 ];
}

// ---- Library blocks ------------------------------------------------------------------------------------------------
export interface WbBlock{id:string;name:string;keywords:string[]}
/** The component library: own-designed simple blocks. Shapes live in the canvas module; names and search terms live here. */
export const WB_BLOCKS:readonly WbBlock[]=[
 {id:'client',name:'Client',keywords:['browser','mobile','app','user','frontend']},
 {id:'server',name:'Server',keywords:['backend','service','api','app server']},
 {id:'multi-server',name:'Multi-instance Server',keywords:['replicas','scale out','horizontal','cluster','fleet']},
 {id:'api-gateway',name:'API Gateway',keywords:['gateway','routing','auth','rate limit','edge']},
 {id:'load-balancer',name:'Load Balancer',keywords:['lb','balance','traffic','nginx','distribute']},
 {id:'message-queue',name:'Message Queue',keywords:['queue','kafka','sqs','stream','broker','pubsub']},
 {id:'database',name:'Database',keywords:['db','sql','postgres','storage','store','nosql']},
 {id:'cache',name:'Cache',keywords:['redis','memcached','memory','fast reads']},
 {id:'cdn',name:'CDN',keywords:['content delivery','edge','static','assets']},
 {id:'object-storage',name:'Object Storage',keywords:['blob','s3','files','media','bucket']},
 {id:'worker',name:'Worker',keywords:['job','background','async','consumer','cron']},
 {id:'dns',name:'DNS',keywords:['domain','name','lookup','resolver']},
];
export function filterBlocks(query:string,blocks:readonly WbBlock[]=WB_BLOCKS):WbBlock[]{
 const tokens=query.toLowerCase().split(/\s+/).filter(Boolean);if(!tokens.length)return [...blocks];
 return blocks.filter(b=>{const hay=[b.name,...b.keywords].join(' ').toLowerCase();return tokens.every(t=>hay.includes(t));});
}

// ---- Saved scene ---------------------------------------------------------------------------------------------------
/** Element types a saved board may contain: no images, embeds or AI frames. */
export const WB_ELEMENT_TYPES=['rectangle','diamond','ellipse','arrow','line','text','freedraw','frame'] as const;
const elementSchema=z.looseObject({id:z.string().min(1).max(100),type:z.enum(WB_ELEMENT_TYPES)});
const finite=z.number().min(-1e9).max(1e9);
const viewSchema=z.object({scrollX:finite,scrollY:finite,zoom:z.number().min(0.1).max(30)}).strict();
export interface WbScene{v:1;elements:Record<string,unknown>[];view?:{scrollX:number;scrollY:number;zoom:number}}
/** Cleans untrusted saved data: unknown element types are dropped, links removed, size capped. Null when it is not a scene. */
export function sanitizeScene(raw:unknown):WbScene|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const {elements,view}=raw as {elements?:unknown;view?:unknown};
 if(!Array.isArray(elements))return null;
 const kept:Record<string,unknown>[]=[];
 for(const e of elements){const p=elementSchema.safeParse(e);if(p.success){kept.push({...p.data,link:null});if(kept.length>=WB_LIMITS.elements)break;}}
 const v=viewSchema.safeParse(view);
 const scene:WbScene={v:1,elements:kept,...(v.success?{view:v.data}:{})};
 return sceneBytes(scene)>WB_LIMITS.bytes?null:scene;
}
export const sceneBytes=(scene:unknown)=>new TextEncoder().encode(JSON.stringify(scene)).length;
export function parseStoredScene(raw:string|null):WbScene|null{if(!raw)return null;try{return sanitizeScene(JSON.parse(raw));}catch{return null;}}
/** The scene to store: live elements only, with the viewport. */
export function toScene(elements:readonly {isDeleted?:boolean}[],view:{scrollX:number;scrollY:number;zoom:number}):WbScene{
 return {v:1,elements:elements.filter(e=>!e.isDeleted) as unknown as Record<string,unknown>[],view};
}

// ---- Timer and panel -------------------------------------------------------------------------------------------------
export function formatTimer(totalSeconds:number):string{
 const s=Math.max(0,Math.floor(Number.isFinite(totalSeconds)?totalSeconds:0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;
 const mm=String(m).padStart(2,'0'),rr=String(r).padStart(2,'0');return h?`${h}:${mm}:${rr}`:`${mm}:${rr}`;
}
export const PANEL_MIN=240,PANEL_MAX_RATIO=0.6,PANEL_DEFAULT=340;
export const clampPanel=(width:number,total:number)=>{const max=Math.max(PANEL_MIN,Math.floor(total*PANEL_MAX_RATIO));return Math.min(max,Math.max(PANEL_MIN,Math.round(Number.isFinite(width)?width:PANEL_DEFAULT)));};
