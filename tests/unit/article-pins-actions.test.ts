import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),from:vi.fn(),upsert:vi.fn(),del:vi.fn(),eq:vi.fn(),order:vi.fn(),select:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {loadArticlePins,saveArticlePin} from '@/app/actions/article-pins';
const user='00000000-0000-4000-8000-000000000091',post='00000000-0000-4000-8000-000000000099';
beforeEach(()=>{vi.resetAllMocks();m.viewer.mockResolvedValue({role:'member',id:user});m.server.mockResolvedValue({from:m.from});m.from.mockReturnValue({select:m.select,upsert:m.upsert,delete:m.del});m.select.mockReturnValue({eq:m.eq});m.eq.mockReturnValue({order:m.order,eq:m.eq});m.order.mockResolvedValue({data:[{article_id:post}],error:null});m.upsert.mockResolvedValue({error:null});m.del.mockReturnValue({eq:m.eq});});
it('signed-out calls and malformed inputs do not reach the database',async()=>{
 m.viewer.mockResolvedValue({role:'anonymous'});expect((await loadArticlePins()).ok).toBe(false);expect((await saveArticlePin(post,true)).ok).toBe(false);expect((await saveArticlePin('bad',true)).ok).toBe(false);expect(m.from).not.toHaveBeenCalled();
});
it('reads and writes use the authenticated server identity, not a supplied user ID',async()=>{
 expect(await loadArticlePins()).toEqual({ok:true,ids:[post]});expect(m.eq).toHaveBeenCalledWith('user_id',user);
 expect(await saveArticlePin(post,true)).toEqual({ok:true});expect(m.upsert).toHaveBeenCalledWith({user_id:user,article_id:post},{onConflict:'user_id,article_id',ignoreDuplicates:true});
 m.eq.mockReturnValueOnce({eq:m.eq}).mockResolvedValueOnce({error:null});expect(await saveArticlePin(post,false)).toEqual({ok:true});expect(m.eq).toHaveBeenCalledWith('article_id',post);
});
it('database failures are recoverable and never reported as saved',async()=>{m.upsert.mockResolvedValue({error:{message:'offline'}});expect((await saveArticlePin(post,true)).ok).toBe(false);m.order.mockRejectedValue(new Error('offline'));expect((await loadArticlePins()).ok).toBe(false);});
