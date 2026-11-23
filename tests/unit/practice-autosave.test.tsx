// @vitest-environment jsdom
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {renderHook,act,cleanup} from '@testing-library/react';
const mocks=vi.hoisted(()=>({save:vi.fn()}));
vi.mock('@/app/actions/practice',()=>({savePracticeCode:mocks.save}));
import {useCodeAutosave} from '@/components/practice/use-code-autosave';
import {codeKey} from '@/lib/practice/storage';
const props={viewerKey:'synthetic-owner',problem:217,starter:'starter',canSave:true,ready:true,remote:null};
beforeEach(()=>{vi.useFakeTimers();localStorage.clear();mocks.save.mockReset().mockResolvedValue({ok:true});});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});
it('debounces 800ms, writes locally immediately and flushes newest code on unmount',async()=>{
 const h=renderHook(()=>useCodeAutosave(props));act(()=>h.result.current.edit('first'));expect(localStorage.getItem(codeKey(props.viewerKey,217))).toBe('first');
 await act(async()=>{await vi.advanceTimersByTimeAsync(799);});expect(mocks.save).not.toHaveBeenCalled();
 await act(async()=>{await vi.advanceTimersByTimeAsync(1);});expect(mocks.save).toHaveBeenLastCalledWith(217,'first',props.viewerKey);expect(h.result.current.status).toBe('Saved');
 act(()=>h.result.current.edit('latest'));h.unmount();await act(async()=>{});expect(mocks.save).toHaveBeenLastCalledWith(217,'latest',props.viewerKey);
});
it('serializes remote writes so edits during an in-flight save win',async()=>{
 let release!:(v:{ok:true})=>void;mocks.save.mockImplementationOnce(()=>new Promise(r=>{release=r}));
 const h=renderHook(()=>useCodeAutosave(props));act(()=>h.result.current.edit('old'));await act(async()=>{void h.result.current.flush();});act(()=>h.result.current.edit('new'));expect(mocks.save).toHaveBeenCalledTimes(1);
 await act(async()=>{release({ok:true});});expect(mocks.save).toHaveBeenNthCalledWith(2,217,'new',props.viewerKey);expect(h.result.current.status).toBe('Saved');
});
it('retains unsynced local code over stale remote data after navigation and retries online',async()=>{
 mocks.save.mockResolvedValue({ok:false,message:'offline'});const h=renderHook(()=>useCodeAutosave(props));act(()=>h.result.current.edit('pending'));
 await act(async()=>{await h.result.current.flush();});expect(h.result.current.status).toBe('Offline — saved locally');h.unmount();
 const restored=renderHook(()=>useCodeAutosave({...props,remote:'stale'}));await act(async()=>{});expect(restored.result.current.code).toBe('pending');
 mocks.save.mockResolvedValue({ok:true});await act(async()=>{window.dispatchEvent(new Event('online'));});expect(mocks.save).toHaveBeenLastCalledWith(217,'pending',props.viewerKey);expect(restored.result.current.status).toBe('Saved');
});
it('does not overwrite typing while remote load resolves; untouched code hydrates without a save',async()=>{
 const h=renderHook(({ready,remote})=>useCodeAutosave({...props,ready,remote}),{initialProps:{ready:false,remote:null as string|null}});
 act(()=>h.result.current.edit('typed early'));h.rerender({ready:true,remote:'old remote'});await act(async()=>{});expect(h.result.current.code).toBe('typed early');expect(mocks.save).toHaveBeenLastCalledWith(217,'typed early',props.viewerKey);h.unmount();mocks.save.mockClear();
 const other=renderHook(()=>useCodeAutosave({...props,viewerKey:'other',remote:'saved remotely'}));expect(other.result.current.code).toBe('saved remotely');expect(mocks.save).not.toHaveBeenCalled();
});
it('keeps visitor/account keys separate, never saves previews, and tolerates unavailable storage',async()=>{
 const visitor=renderHook(()=>useCodeAutosave({...props,viewerKey:'visitor',canSave:false}));act(()=>visitor.result.current.edit('visitor code'));await act(async()=>{await vi.advanceTimersByTimeAsync(900);});expect(mocks.save).not.toHaveBeenCalled();expect(localStorage.getItem(codeKey('synthetic-owner',217))).toBeNull();visitor.unmount();
 const preview=renderHook(()=>useCodeAutosave({...props,readOnly:true,starter:'preview'}));act(()=>preview.result.current.edit('blocked'));await act(async()=>{await preview.result.current.flush();});expect(preview.result.current.code).toBe('preview');expect(mocks.save).not.toHaveBeenCalled();preview.unmount();
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('full')});const unavailable=renderHook(()=>useCodeAutosave({...props,canSave:false}));act(()=>unavailable.result.current.edit('safe in memory'));expect(unavailable.result.current.storageError).toBe(true);expect(unavailable.result.current.code).toBe('safe in memory');
});

it('orders saves across route remounts and never replays an obsolete unmounted snapshot last',async()=>{
 let release!:(v:{ok:true})=>void;mocks.save.mockImplementationOnce(()=>new Promise(r=>{release=r}));
 const old=renderHook(()=>useCodeAutosave(props));act(()=>old.result.current.edit('old in flight'));await act(async()=>{void old.result.current.flush();});
 act(()=>old.result.current.edit('pending on navigation'));old.unmount();
 const next=renderHook(()=>useCodeAutosave({...props,remote:'stale remote'}));act(()=>next.result.current.edit('newest after return'));act(()=>{void next.result.current.flush();});
 await act(async()=>{release({ok:true});});
 expect(mocks.save).toHaveBeenLastCalledWith(217,'newest after return',props.viewerKey);
 expect(localStorage.getItem(codeKey(props.viewerKey,217))).toBe('newest after return');expect(next.result.current.code).toBe('newest after return');expect(next.result.current.status).toBe('Saved');
});
