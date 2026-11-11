// @vitest-environment jsdom
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {renderHook,act,waitFor,cleanup} from '@testing-library/react';
const m=vi.hoisted(()=>({load:vi.fn(),save:vi.fn()}));
vi.mock('@/app/actions/article-pins',()=>({loadArticlePins:m.load,saveArticlePin:m.save}));
import {useArticlePins} from '@/components/articles/use-article-pins';
beforeEach(()=>{vi.resetAllMocks();m.load.mockResolvedValue({ok:true,ids:['one']});m.save.mockResolvedValue({ok:true});});afterEach(cleanup);
it('loads personal pins, keeps failed saves unchanged and supports retry',async()=>{
 const {result}=renderHook(()=>useArticlePins('a'));await waitFor(()=>expect(result.current.loaded).toBe(true));
 m.save.mockResolvedValueOnce({ok:false,message:'Retry pin'});await act(()=>result.current.save('two',true));expect([...result.current.ids]).toEqual(['one']);expect(result.current.saveError).toBe('Retry pin');
 await act(()=>result.current.retry());expect([...result.current.ids]).toEqual(['two','one']);expect(result.current.saveError).toBe('');
 await act(()=>result.current.save('two',false));expect([...result.current.ids]).toEqual(['one']);
});
it('logout and account changes immediately hide the previous account pins and ignore stale requests',async()=>{
 let finish!:(v:{ok:true;ids:string[]})=>void;
 const {result,rerender}=renderHook(({id}:{id:string|null})=>useArticlePins(id),{initialProps:{id:'a' as string|null}});
 await waitFor(()=>expect(result.current.loaded).toBe(true));
 m.save.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve}));
 let saving:Promise<void>;act(()=>{saving=result.current.save('old',true)});
 m.load.mockResolvedValueOnce({ok:true,ids:['other']});rerender({id:'b'});
 expect(result.current.ids.has('one')).toBe(false);await waitFor(()=>expect(result.current.loaded).toBe(true));
 await act(async()=>{finish({ok:true,ids:[]});await saving;});expect([...result.current.ids]).toEqual(['other']);
 rerender({id:null});expect(result.current.ids.size).toBe(0);expect(result.current.loaded).toBe(false);
});
it('failed loads can be retried and signed-out renders make no API calls',async()=>{
 const {result,rerender}=renderHook(({id}:{id:string|null})=>useArticlePins(id),{initialProps:{id:null as string|null}});expect(m.load).not.toHaveBeenCalled();
 m.load.mockResolvedValueOnce({ok:false,message:'Load failed'});rerender({id:'a'});await waitFor(()=>expect(result.current.loadError).toBe('Load failed'));
 act(()=>result.current.reload());await waitFor(()=>expect(result.current.loaded).toBe(true));expect(result.current.ids.has('one')).toBe(true);
});
