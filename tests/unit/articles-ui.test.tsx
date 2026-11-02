// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
const m=vi.hoisted(()=>({save:vi.fn(),role:'anonymous'}));
vi.mock('@/app/actions/articles',()=>({saveArticle:m.save}));vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:{status:m.role}})}));vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
import {ArticleEditor} from '@/components/articles/editor';
import {ArticlesShell} from '@/components/articles/library';
import {relatedArticles,youtubeId} from '@/lib/articles';
import {socialLinks} from '@/lib/social';
import type {Article} from '@/lib/articles';
const article:Article={id:'00000000-0000-4000-8000-000000000001',slug:'example',title:'Example reference',summary:'Summary',body:'Reference text',platform:'youtube',category:'ai',source_url:'',cover_url:'',project_id:null,published:false,created_at:'now',updated_at:'now'};
beforeEach(()=>{vi.clearAllMocks();m.role='anonymous';m.save.mockImplementation(async input=>({ok:true,article:{...input,created_at:'now',updated_at:'now'}}));});afterEach(cleanup);
it('readers filter by category pills and platform toggle, with no dropdowns or "Extra references"',()=>{
 const {container}=render(<ArticlesShell articles={[article,{...article,id:'two',slug:'second',title:'Second post',platform:'instagram',category:'career'}]} />);
 expect(container.querySelector('select')).toBeNull();expect(screen.queryByText(/extra references/i)).toBeNull();expect(screen.queryByRole('link',{name:'Manage articles'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Career'}));expect(screen.queryByRole('link',{name:'Example reference'})).toBeNull();expect(screen.getByRole('link',{name:'Second post'}).getAttribute('href')).toBe('/articles/second');
 fireEvent.click(within(screen.getByRole('group',{name:'Category'})).getByRole('button',{name:'All'}));fireEvent.click(within(screen.getByRole('group',{name:'Platform'})).getByRole('button',{name:'YouTube'}));expect(screen.queryByRole('link',{name:'Second post'})).toBeNull();
 fireEvent.change(screen.getByPlaceholderText('Search articles…'),{target:{value:'no-match'}});expect(screen.getByText('No articles match these filters.')).toBeTruthy();
});
it('shows a short list beside an article, not every post',()=>{
 const many=Array.from({length:20},(_,i)=>({...article,id:String(i),slug:`post-${i}`,title:`Post ${i}`}));
 render(<ArticlesShell articles={many} currentId="3"><p>body</p></ArticlesShell>);
 const nav=screen.getByRole('navigation',{name:'Articles'});expect(within(nav).getAllByRole('link')).toHaveLength(8);expect(within(nav).getByRole('link',{name:/Post 3/}).getAttribute('aria-current')).toBe('page');
 fireEvent.click(within(nav).getByRole('button',{name:'Show more'}));expect(within(nav).getAllByRole('link')).toHaveLength(16);
});
it('recommends same-category posts first and reads YouTube ids and social links',()=>{
 const a={...article,id:'a',category:'ai' as const},b={...article,id:'b',category:'career' as const},c={...article,id:'c',category:'ai' as const};
 expect(relatedArticles([a,b,c],a).map(x=>x.id)).toEqual(['c','b']);
 expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toBe('dQw4w9WgXcQ');expect(youtubeId('https://www.youtube.com/shorts/abcdefghijk')).toBe('abcdefghijk');expect(youtubeId('https://example.com/watch?v=x')).toBeNull();
 expect(socialLinks('[YT](https://www.youtube.com/@jamie) · [In](https://www.linkedin.com/in/jamie) · https://www.xiaohongshu.com/user/1 · [x](http://instagram.com/insecure)').map(l=>l.kind)).toEqual(['linkedin','youtube','xiaohongshu']);
});
it('owner draft save failures retain text and stable ID; Retry can publish and later unpublish',async()=>{
 m.save.mockRejectedValueOnce(new Error('offline'));render(<ArticleEditor initial={[]} />);fireEvent.click(screen.getByRole('button',{name:'New article'}));fireEvent.change(screen.getByLabelText('Title'),{target:{value:'New reference'}});fireEvent.change(screen.getByLabelText('URL slug'),{target:{value:'new-reference'}});fireEvent.change(screen.getByLabelText('Article (Markdown)'),{target:{value:'Draft references'}});expect((screen.getByLabelText('Publish publicly') as HTMLInputElement).checked).toBe(false);fireEvent.click(screen.getByRole('button',{name:'Save article'}));await screen.findByRole('button',{name:'Retry'});expect((screen.getByLabelText('Article (Markdown)') as HTMLTextAreaElement).value).toBe('Draft references');const first=m.save.mock.calls[0][0];fireEvent.click(screen.getByLabelText('Publish publicly'));fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByText('Published');expect(m.save.mock.calls[1][0]).toMatchObject({id:first.id,published:true});expect(screen.getByRole('link',{name:'Open article'}).getAttribute('href')).toBe('/articles/new-reference');fireEvent.click(screen.getByRole('button',{name:'Edit New reference'}));fireEvent.click(screen.getByLabelText('Publish publicly'));fireEvent.click(screen.getByRole('button',{name:'Save article'}));await screen.findByText('Draft');expect(screen.queryByRole('link',{name:'Open article'})).toBeNull();
});
it('cancel leaves the existing article unchanged',()=>{render(<ArticleEditor initial={[article]} />);fireEvent.click(screen.getByRole('button',{name:'Edit Example reference'}));fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Discard'}});fireEvent.click(screen.getByRole('button',{name:'Cancel'}));expect(screen.queryByText('Discard')).toBeNull();expect(m.save).not.toHaveBeenCalled();});
it('footer shows the name and year with icon links to the channels',async()=>{
 const {ArticlesFooter}=await import('@/components/articles/footer');
 render(<ArticlesFooter socials={[{kind:'linkedin',href:'https://www.linkedin.com/in/x'},{kind:'xiaohongshu',href:'https://www.xiaohongshu.com/user/1'}]} />);
 expect(screen.getByText(/Jamie Ho ©/)).toBeTruthy();
 const nav=screen.getByRole('navigation',{name:"Jamie's channels"});
 expect(within(nav).getByRole('link',{name:'LinkedIn'}).getAttribute('target')).toBe('_blank');
 expect(within(nav).getByRole('link',{name:'RedNote (小红书)'}).querySelector('img')?.getAttribute('src')).toBe('/social/xiaohongshu.png');
});
