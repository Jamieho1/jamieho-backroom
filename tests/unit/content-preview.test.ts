import { beforeEach, it, expect, vi } from 'vitest';
const m=vi.hoisted(()=>({mode:vi.fn(),cookies:vi.fn(),get:vi.fn(),viewer:vi.fn(),server:vi.fn(),from:vi.fn(),single:vi.fn()}));
vi.mock('next/headers',()=>({draftMode:m.mode,cookies:m.cookies}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {getHomePreview,loadOwnerPreview,PREVIEW_COOKIE} from '@/lib/content-drafts/preview';
import {overlaySections,draftChapterChanged} from '@/lib/content-drafts/overlay';
import {FALLBACK_SECTIONS} from '@/lib/sections';
const id='00000000-0000-4000-8000-000000000101';
const operations=[{op:'update' as const,table:'site_sections' as const,key:'hero' as const,fields:{title:'Preview name'}}];
beforeEach(()=>{vi.resetAllMocks();m.mode.mockResolvedValue({isEnabled:true});m.cookies.mockResolvedValue({get:m.get});m.get.mockReturnValue({value:id});m.viewer.mockResolvedValue({role:'owner',id:'owner'});m.server.mockResolvedValue({from:m.from});m.from.mockReturnValue({select:()=>({eq:()=>({eq:()=>({maybeSingle:m.single})})})});m.single.mockResolvedValue({data:{id,summary:'Preview hero',status:'draft',operations,photo_slots:[]},error:null});});
it('public prerender and normal requests read no cookies, session or draft data',async()=>{
 m.mode.mockResolvedValue({isEnabled:false});expect(await getHomePreview()).toBeNull();expect(m.cookies).not.toHaveBeenCalled();expect(m.viewer).not.toHaveBeenCalled();expect(m.server).not.toHaveBeenCalled();
});
it('stolen valid preview cookies give signed-out and non-owner sessions no draft values',async()=>{
 for(const role of ['anonymous','member']){m.viewer.mockResolvedValue({role,id:'not-owner'});expect(await getHomePreview()).toBeNull();}
 expect(m.server).not.toHaveBeenCalled();expect(m.from).not.toHaveBeenCalled();
});
it('only a verified owner gets a validated pending proposal',async()=>{
 expect(await getHomePreview()).toEqual({id,summary:'Preview hero',operations});expect(m.get).toHaveBeenCalledWith(PREVIEW_COOKIE);
});
it('missing and malformed ids, finalized sets, errors, invalid fields and photo slots never overlay content',async()=>{
 m.get.mockReturnValueOnce(undefined);expect(await getHomePreview()).toBeNull();
 expect(await loadOwnerPreview('invalid')).toBeNull();
 for(const data of [null,{id,status:'approved',operations,photo_slots:[]},{id,status:'draft',operations:[{...operations[0],fields:{role:'owner'}}],photo_slots:[]},{id,status:'draft',operations,photo_slots:[{}]}]){m.single.mockResolvedValueOnce({data,error:null});expect(await getHomePreview()).toBeNull();}
 m.single.mockResolvedValueOnce({data:null,error:{message:'offline'}});expect(await getHomePreview()).toBeNull();
});
it('overlay is immutable, preserves live fields and applies repeated edits in order',()=>{
 const before=JSON.stringify(FALLBACK_SECTIONS);
 const result=overlaySections(FALLBACK_SECTIONS,[...operations,{...operations[0],fields:{title:'Final name',body:'Draft body'}}]);
 expect(result.hero).toEqual({key:'hero',title:'Final name',body:'Draft body'});expect(JSON.stringify(FALLBACK_SECTIONS)).toBe(before);expect(overlaySections(FALLBACK_SECTIONS,[])).toEqual(FALLBACK_SECTIONS);
});
it('maps outlines to existing sections without adding or changing chapters',()=>{
 expect(draftChapterChanged('pivot',['about'])).toBe(true);expect(draftChapterChanged('creator',['contact'])).toBe(true);expect(draftChapterChanged('screen',['contact'])).toBe(true);expect(draftChapterChanged('sky',['hero'])).toBe(true);expect(draftChapterChanged('projects',['about'])).toBe(false);expect(draftChapterChanged('experience',[])).toBe(false);
});
