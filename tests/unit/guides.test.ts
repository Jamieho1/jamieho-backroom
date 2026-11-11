import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),previous:vi.fn(),upsert:vi.fn(),saved:vi.fn(),revalidate:vi.fn(),client:vi.fn(),select:vi.fn(),eq:vi.fn(),order:vi.fn(),single:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));vi.mock('next/cache',()=>({revalidatePath:m.revalidate}));
vi.mock('@/lib/env',()=>({readSupabaseEnv:()=>({url:'https://example.supabase.co',anonKey:'public-test-placeholder'})}));vi.mock('@supabase/supabase-js',()=>({createClient:m.client}));
import {saveGuide} from '@/app/actions/guides';
import {getPublicGuides,getPublicGuide} from '@/lib/guides-public';
const draft={id:'00000000-0000-4000-8000-000000000002',slug:'example-guide',title:'Example guide',summary:'Summary',body:'Body',notion_url:'https://example.com/toolkit',doc_url:'',cover_url:'',published:false};
beforeEach(()=>{vi.clearAllMocks();m.viewer.mockResolvedValue({role:'owner'});m.previous.mockResolvedValue({data:{slug:'old-guide'},error:null});m.saved.mockResolvedValue({data:{...draft,created_at:'now',updated_at:'now'},error:null});m.upsert.mockReturnValue({select:()=>({single:m.saved})});m.server.mockResolvedValue({from:()=>({select:()=>({eq:()=>({maybeSingle:m.previous})}),upsert:m.upsert})});
 m.order.mockResolvedValue({data:[],error:null});m.single.mockResolvedValue({data:null,error:null});m.eq.mockReturnValue({eq:m.eq,order:m.order,maybeSingle:m.single});m.select.mockReturnValue({eq:m.eq});m.client.mockReturnValue({from:()=>({select:m.select})});});
it('only the owner can save; unsafe links and reserved slugs are rejected',async()=>{
 for(const role of ['anonymous','member']){m.viewer.mockResolvedValue({role});expect((await saveGuide(draft)).ok).toBe(false);}
 m.viewer.mockResolvedValue({role:'owner'});
 for(const bad of [{...draft,slug:'manage'},{...draft,notion_url:'javascript:alert(1)'},{...draft,doc_url:'http://example.com'},{...draft,title:' '}])expect((await saveGuide(bad)).ok).toBe(false);
 expect(m.upsert).not.toHaveBeenCalled();
});
it('saves validated fields and refreshes Resources, the list and old and new guide URLs',async()=>{
 expect((await saveGuide({...draft,created_at:'spoof'})).ok).toBe(true);expect(m.upsert).toHaveBeenCalledWith(draft,{onConflict:'id'});
 for(const p of ['/resources','/guides','/guides/example-guide','/guides/old-guide'])expect(m.revalidate).toHaveBeenCalledWith(p);
});
it('reports duplicate slugs and failures without claiming success',async()=>{m.saved.mockResolvedValue({data:null,error:{code:'23505'}});expect(await saveGuide(draft)).toMatchObject({ok:false,message:expect.stringContaining('slug')});m.previous.mockRejectedValue(new Error('offline'));expect((await saveGuide(draft)).ok).toBe(false);});
it('public reads are cookie-free and exclude drafts; failures surface',async()=>{
 await getPublicGuides();expect(m.client).toHaveBeenCalledWith('https://example.supabase.co','public-test-placeholder',{auth:{persistSession:false}});expect(m.eq).toHaveBeenCalledWith('published',true);
 await getPublicGuide('draft-guide');expect(m.eq).toHaveBeenCalledWith('slug','draft-guide');expect(m.eq).toHaveBeenLastCalledWith('published',true);
 m.order.mockResolvedValue({data:null,error:{message:'down'}});await expect(getPublicGuides()).rejects.toThrow('unavailable');
});
