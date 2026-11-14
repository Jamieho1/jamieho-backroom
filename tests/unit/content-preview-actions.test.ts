import { beforeEach, it, expect, vi } from 'vitest';
const m=vi.hoisted(()=>({mode:vi.fn(),enable:vi.fn(),disable:vi.fn(),cookies:vi.fn(),set:vi.fn(),del:vi.fn(),owner:vi.fn(),preview:vi.fn(),approve:vi.fn(),discard:vi.fn()}));
vi.mock('next/headers',()=>({draftMode:m.mode,cookies:m.cookies}));
vi.mock('@/lib/content-drafts/preview',()=>({loadOwnerPreview:m.owner,getHomePreview:m.preview,PREVIEW_COOKIE:'jb.content-preview'}));
vi.mock('@/app/actions/content-drafts',()=>({approveContentChange:m.approve,discardContentChange:m.discard}));
import {startContentPreview,exitContentPreview,approvePreviewChange,discardPreviewChange} from '@/app/actions/content-preview';
const id='00000000-0000-4000-8000-000000000101';
beforeEach(()=>{vi.resetAllMocks();m.owner.mockResolvedValue({id,summary:'Draft',operations:[]});m.preview.mockResolvedValue({id});m.mode.mockResolvedValue({isEnabled:true,enable:m.enable,disable:m.disable});m.cookies.mockResolvedValue({set:m.set,delete:m.del});m.approve.mockResolvedValue({ok:true,message:'Approved',applied:true});m.discard.mockResolvedValue({ok:true,message:'Discarded'});});
it('entry requires an owner-validated draft before enabling any cookie',async()=>{
 m.owner.mockResolvedValue(null);expect((await startContentPreview(id)).ok).toBe(false);expect(m.set).not.toHaveBeenCalled();expect(m.enable).not.toHaveBeenCalled();
});
it('stores only the validated id in an httpOnly same-site cookie and enables Draft Mode',async()=>{
 expect((await startContentPreview(id)).ok).toBe(true);expect(m.set).toHaveBeenCalledWith('jb.content-preview',id,expect.objectContaining({httpOnly:true,sameSite:'lax',path:'/',maxAge:3600}));expect(m.enable).toHaveBeenCalledOnce();
});
it('exiting clears both preview cookies without changing any content',async()=>{
 expect((await exitContentPreview()).ok).toBe(true);expect(m.disable).toHaveBeenCalledOnce();expect(m.del).toHaveBeenCalledWith('jb.content-preview');expect(m.approve).not.toHaveBeenCalled();expect(m.discard).not.toHaveBeenCalled();
});
it('approve/discard use only the current validated cookie set, reuse the engine and exit on success',async()=>{
 expect((await approvePreviewChange()).ok).toBe(true);expect(m.approve).toHaveBeenCalledWith(id);expect(m.disable).toHaveBeenCalledTimes(1);
 expect((await discardPreviewChange()).ok).toBe(true);expect(m.discard).toHaveBeenCalledWith(id);expect(m.disable).toHaveBeenCalledTimes(2);
});
it('forged/expired previews cannot invoke approve/discard',async()=>{
 m.preview.mockResolvedValue(null);expect((await approvePreviewChange()).ok).toBe(false);expect((await discardPreviewChange()).ok).toBe(false);expect(m.approve).not.toHaveBeenCalled();expect(m.discard).not.toHaveBeenCalled();
});
it('failed approval keeps preview open and reports the existing engine error',async()=>{
 m.approve.mockResolvedValue({ok:false,message:'Owner access required'});expect(await approvePreviewChange()).toEqual({ok:false,message:'Owner access required'});expect(m.disable).not.toHaveBeenCalled();expect(m.del).not.toHaveBeenCalled();
});
it('cookie exit failure never misreports a committed approval as rolled back',async()=>{
 m.disable.mockImplementation(()=>{throw Error('cookie failure')});expect(await approvePreviewChange()).toMatchObject({ok:true,applied:true,message:expect.stringContaining('could not close')});
});
