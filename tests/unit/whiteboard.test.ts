import {it,expect} from 'vitest';
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {WB_BLOCKS,WB_LIMITS,buildTemplate,clampPanel,filterBlocks,formatTimer,functionalRequirements,overviewSentence,parseStoredScene,sanitizeScene,sceneBytes,sectionLines,templateSkeletons,toScene,wbHref,wrapText} from '@/lib/interview/whiteboard';
// Fixture content only: no question is seeded and nothing here describes a real person.
const solution=`## Overview\nA fixture service stores short notes for visitors. It has two read paths.\n\n## Requirements\n- Users can add a note\n- Users can read a note by id with [a link](https://example.test)\n\n### Non-functional\n- Reads are fast\n\n### Functional extras\n1. Notes can be deleted\n\n\`\`\`text\n## Requirements\n- inside a fence\n\`\`\`\n\n## Data Model\n- not a requirement`;
const names=['Functional Requirements','Non-Functional Requirements','Core Entities','API Design','High-Level Design'];
it('extracts the one-line task and the functional list from question data only',()=>{
 expect(overviewSentence(solution)).toBe('A fixture service stores short notes for visitors.');
 expect(functionalRequirements(solution)).toEqual(['Users can add a note','Users can read a note by id with a link','Notes can be deleted']);
 expect(functionalRequirements('## Overview\nx')).toEqual([]);expect(overviewSentence('')).toBe('');
 expect(sectionLines(solution,'requirements').join('\n')).not.toContain('inside a fence');expect(sectionLines(solution,'requirements').join('\n')).toContain('Reads are fast');
 expect(functionalRequirements('## Requirements\n'+Array.from({length:30},(_,i)=>`- item ${i}`).join('\n'))).toHaveLength(WB_LIMITS.functional);
});
it('builds the five frames, prefilled functional requirements and grey examples beside the four small frames',()=>{
 const t=buildTemplate({title:'Fixture Notes',solution});
 expect(t.frames.map(f=>f.name)).toEqual(names);
 const fr=t.frames[0];expect(fr.children).toEqual(['wb-functional-items']);
 const items=t.texts.find(x=>x.id==='wb-functional-items')!;expect(items.text).toContain('• Users can add a note');expect(items.text).toContain('• Notes can be deleted');
 for(const f of t.frames.slice(1,4))expect(f.children).toEqual([]);
 for(const key of ['functional','non','entities','api']){const ex=t.texts.find(x=>x.id===`wb-${key}-example`)!;expect(ex.grey).toBe(true);expect(ex.text.startsWith('Example')).toBe(true);}
 const hld=t.frames[4];expect(hld.w).toBeGreaterThan(t.frames[0].w*2);expect(hld.h).toBeGreaterThanOrEqual(1000);
 expect(t.texts.find(x=>x.id==='wb-title')!.text).toBe('Fixture Notes');expect(t.texts.find(x=>x.id==='wb-task')!.text).toContain('Your task: design Fixture Notes.');
 // frames stack without overlapping, and the examples sit right of their frame and left of the main frame
 for(let i=1;i<4;i++)expect(t.frames[i].y).toBeGreaterThanOrEqual(t.frames[i-1].y+t.frames[i-1].h);
 for(const x of t.texts.filter(x=>x.id.endsWith('-example')))expect(x.x).toBeGreaterThan(t.frames[0].w);
 expect(hld.x).toBeGreaterThan(t.frames[0].w+500);
});
it('is generated per question: different data gives different boards; an empty solution still works; long lists grow the frame',()=>{
 const a=buildTemplate({title:'Alpha',solution});const b=buildTemplate({title:'Beta',solution:'## Requirements\n- Only this'});const c=buildTemplate({title:'Gamma',solution:''});
 expect(a.texts.find(x=>x.id==='wb-title')!.text).toBe('Alpha');expect(b.texts.find(x=>x.id==='wb-functional-items')!.text).toBe('• Only this');
 expect(c.frames.map(f=>f.name)).toEqual(names);expect(c.frames[0].children).toEqual([]);expect(c.texts.find(x=>x.id==='wb-task')!.text).toBe('Your task: design Gamma.');
 const long=buildTemplate({title:'Long',solution:'## Requirements\n'+Array.from({length:12},(_,i)=>`- ${'word '.repeat(30)}${i}`).join('\n')});
 expect(long.frames[0].h).toBeGreaterThan(240);expect(long.frames[1].y).toBeGreaterThanOrEqual(long.frames[0].y+long.frames[0].h);
 const ids=[...a.texts.map(x=>x.id),...a.frames.map(f=>f.id)];expect(new Set(ids).size).toBe(ids.length);
});
it('template skeletons are plain data: frames reference existing children, no binary or image elements',()=>{
 const sk=templateSkeletons(buildTemplate({title:'Fixture',solution}));
 const ids=new Set(sk.map(s=>s.id));for(const s of sk)if(s.type==='frame')for(const c of s.children as string[])expect(ids.has(c)).toBe(true);
 expect(sk.every(s=>['text','frame'].includes(s.type as string))).toBe(true);expect(JSON.stringify(sk)).not.toMatch(/data:|fileId|"image"/);
 expect(sk.filter(s=>s.type==='frame')).toHaveLength(5);
});
it('wraps text on words and keeps over-long words whole',()=>{
 expect(wrapText('aaa bbb ccc',7)).toEqual(['aaa bbb','ccc']);expect(wrapText('x'.repeat(60),10)).toEqual(['x'.repeat(60)]);expect(wrapText('a\nb',10)).toEqual(['a','b']);
});
it('library has the twelve required blocks with unique ids, and search matches names and keywords',()=>{
 expect(WB_BLOCKS.map(b=>b.name)).toEqual(['Client','Server','Multi-instance Server','API Gateway','Load Balancer','Message Queue','Database','Cache','CDN','Object Storage','Worker','DNS']);
 expect(new Set(WB_BLOCKS.map(b=>b.id)).size).toBe(12);
 expect(filterBlocks('').length).toBe(12);expect(filterBlocks('  ').length).toBe(12);
 expect(filterBlocks('QUEUE').map(b=>b.name)).toEqual(['Message Queue']);expect(filterBlocks('redis').map(b=>b.name)).toEqual(['Cache']);
 expect(filterBlocks('server').map(b=>b.name)).toEqual(['Server','Multi-instance Server']);expect(filterBlocks('s3 blob').map(b=>b.name)).toEqual(['Object Storage']);expect(filterBlocks('zzz')).toEqual([]);
});
it('sanitizes saved scenes: drops images/embeds and unknown data, removes links, caps size and count',()=>{
 const good={id:'a',type:'rectangle',x:1,y:2,link:'https://example.test'};
 const scene=sanitizeScene({elements:[good,{id:'b',type:'image',fileId:'f'},{id:'c',type:'embeddable',link:'https://example.test'},{id:'d',type:'iframe'},{id:'',type:'text'},'junk',null,{id:'e',type:'frame',name:'F'}],view:{scrollX:1,scrollY:2,zoom:1.5}});
 expect(scene).toEqual({v:1,elements:[{...good,link:null},{id:'e',type:'frame',name:'F',link:null}],view:{scrollX:1,scrollY:2,zoom:1.5}});
 expect(sanitizeScene({elements:[],view:{scrollX:1,scrollY:2,zoom:0}})).toEqual({v:1,elements:[]});
 for(const bad of [null,undefined,'x',5,[],{},{elements:'no'}])expect(sanitizeScene(bad)).toBeNull();
 expect(sanitizeScene({elements:Array.from({length:WB_LIMITS.elements+10},(_,i)=>({id:'e'+i,type:'line'}))})!.elements).toHaveLength(WB_LIMITS.elements);
 expect(sanitizeScene({elements:[{id:'big',type:'text',text:'x'.repeat(WB_LIMITS.bytes+1)}]})).toBeNull();
 expect(sceneBytes({a:'é'})).toBe(JSON.stringify({a:'é'}).length+1);
});
it('stored scenes survive a round trip and bad storage reads as no board',()=>{
 const s=toScene([{isDeleted:true,id:'x'} as never,{isDeleted:false,id:'y',type:'text'} as never],{scrollX:0,scrollY:0,zoom:1});
 expect(s.elements).toHaveLength(1);expect(parseStoredScene(JSON.stringify(s))).toEqual({v:1,elements:[{id:'y',type:'text',link:null,isDeleted:false}],view:{scrollX:0,scrollY:0,zoom:1}});
 expect(parseStoredScene(null)).toBeNull();expect(parseStoredScene('{')).toBeNull();expect(parseStoredScene('[]')).toBeNull();
});
it('formats the timer and clamps the divider',()=>{
 expect([0,5,65,3599,3600,3725,-4,NaN].map(formatTimer)).toEqual(['00:00','00:05','01:05','59:59','1:00:00','1:02:05','00:00','00:00']);
 expect(clampPanel(100,1000)).toBe(240);expect(clampPanel(400,1000)).toBe(400);expect(clampPanel(900,1000)).toBe(600);expect(clampPanel(NaN,1000)).toBe(340);expect(clampPanel(500,300)).toBe(240);
 expect(wbHref('tiny url')).toBe('/interview/system-design/tiny%20url/whiteboard');
});
function walk(dir:string):string[]{return readdirSync(dir).flatMap(n=>{if(['node_modules','.next','public','test-results'].includes(n)||n.startsWith('.'))return [];const p=join(dir,n);return statSync(p).isDirectory()?walk(p):[p];});}
it('static: only the whiteboard canvas module imports Excalidraw, and only through next/dynamic with ssr:false',()=>{
 const files=['app','components','lib','scripts'].flatMap(d=>walk(d)).filter(f=>/\.(tsx?|mjs)$/.test(f));
 const users=files.filter(f=>/@excalidraw\//.test(readFileSync(f,'utf8')));
 expect(users.sort()).toEqual(['components/interview/sd-whiteboard-canvas.tsx','scripts/copy-excalidraw.mjs'].sort());
 const host=readFileSync('components/interview/sd-whiteboard.tsx','utf8');
 expect(host).toMatch(/dynamic\(\(\)=>import\('\.\/sd-whiteboard-canvas'\),\{ssr:false/);expect(host).not.toMatch(/^import[^\n]*sd-whiteboard-canvas/m);
 const others=files.filter(f=>f!=='components/interview/sd-whiteboard.tsx'&&/sd-whiteboard-canvas/.test(readFileSync(f,'utf8')));expect(others).toEqual([]);
});
it('static: collaboration, cloud export, image upload and AI/text-to-diagram stay disabled in the canvas',()=>{
 const src=readFileSync('components/interview/sd-whiteboard-canvas.tsx','utf8');
 for(const flag of ['isCollaborating={false}','aiEnabled={false}','validateEmbeddable={false}','export:false','saveAsImage:false','loadScene:false','image:false','toggleTheme:false'])expect(src).toContain(flag);
 expect(src).not.toMatch(/TTDDialog|LiveCollaboration|fetch\(|https?:\/\//);expect(src).toContain('theme="dark"');expect(src).toContain("EXCALIDRAW_ASSET_PATH='/excalidraw-assets/'");
 const pkg=JSON.parse(readFileSync('package.json','utf8'));expect(pkg.dependencies['@excalidraw/excalidraw']).toMatch(/^\d+\.\d+\.\d+$/);
});
