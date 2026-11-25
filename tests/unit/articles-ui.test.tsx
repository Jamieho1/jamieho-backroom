// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
const m=vi.hoisted(()=>({save:vi.fn(),role:'anonymous'}));
vi.mock('@/app/actions/articles',()=>({saveArticle:m.save}));vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:{status:m.role}})}));vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('@/app/actions/article-pins',()=>({loadArticlePins:vi.fn(async()=>({ok:true,ids:[]})),saveArticlePin:vi.fn(async()=>({ok:true}))}));
import {ArticleEditor} from '@/components/articles/editor';
import {youtubeId,ARTICLE_NEW_DEFAULTS} from '@/lib/articles';
import {socialLinks} from '@/lib/social';
import type {Article} from '@/lib/articles';
const article:Article={id:'00000000-0000-4000-8000-000000000001',slug:'example',title:'Example reference',summary:'Summary',body:'Reference text',platform:'youtube',category:'ai',source_url:'',cover_url:'',project_id:null,...ARTICLE_NEW_DEFAULTS,published:false,created_at:'now',updated_at:'now'};
beforeEach(()=>{vi.clearAllMocks();m.role='anonymous';m.save.mockImplementation(async input=>({ok:true,article:{...input,created_at:'now',updated_at:'now'}}));});afterEach(cleanup);
it('reads YouTube ids and social links',()=>{
 expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toBe('dQw4w9WgXcQ');expect(youtubeId('https://www.youtube.com/shorts/abcdefghijk')).toBe('abcdefghijk');expect(youtubeId('https://example.com/watch?v=x')).toBeNull();
 expect(socialLinks('[YT](https://www.youtube.com/@jamie) · [In](https://www.linkedin.com/in/jamie) · https://www.xiaohongshu.com/user/1 · [x](http://instagram.com/insecure)').map(l=>l.kind)).toEqual(['linkedin','youtube','xiaohongshu']);
});
it('owner draft save failures retain text and stable ID; Retry can publish and later unpublish',async()=>{
 m.save.mockRejectedValueOnce(new Error('offline'));render(<ArticleEditor initial={[]} />);fireEvent.click(screen.getByRole('button',{name:'New article'}));fireEvent.change(screen.getByLabelText('Title'),{target:{value:'New reference'}});fireEvent.change(screen.getByLabelText('URL slug'),{target:{value:'new-reference'}});fireEvent.change(screen.getByLabelText('Article (Markdown)'),{target:{value:'Draft references'}});expect((screen.getByLabelText('Publish publicly') as HTMLInputElement).checked).toBe(false);fireEvent.click(screen.getByRole('button',{name:'Save article'}));await screen.findByRole('button',{name:'Retry'});expect((screen.getByLabelText('Article (Markdown)') as HTMLTextAreaElement).value).toBe('Draft references');const first=m.save.mock.calls[0][0];fireEvent.click(screen.getByLabelText('Publish publicly'));fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByText('Published');expect(m.save.mock.calls[1][0]).toMatchObject({id:first.id,published:true});expect(screen.getByRole('link',{name:'Open article'}).getAttribute('href')).toBe('/articles/new-reference');fireEvent.click(screen.getByRole('button',{name:'Edit New reference'}));fireEvent.click(screen.getByLabelText('Publish publicly'));fireEvent.click(screen.getByRole('button',{name:'Save article'}));await screen.findByText('Draft');expect(screen.queryByRole('link',{name:'Open article'})).toBeNull();
});
it('cancel leaves the existing article unchanged',()=>{render(<ArticleEditor initial={[article]} />);fireEvent.click(screen.getByRole('button',{name:'Edit Example reference'}));fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Discard'}});fireEvent.click(screen.getByRole('button',{name:'Cancel'}));expect(screen.queryByText('Discard')).toBeNull();expect(m.save).not.toHaveBeenCalled();});
it('picture helpers keep stable names, refuse bad files and write Markdown',async()=>{
 const {imageName,imagePath,imageProblem,imageMarkdown}=await import('@/lib/article-images');
 expect(imageName('My Slide 01.PNG')).toBe('my-slide-01.png');expect(imageName('photo.jpeg')).toBe('photo.jpg');
 expect(imagePath('3-agents','Slide 02.jpg')).toBe('3-agents/slide-02.jpg');
 expect(imageProblem({name:'a.pdf',type:'application/pdf',size:1})).toMatch(/PNG/);expect(imageProblem({name:'a.png',type:'image/png',size:6e6})).toMatch(/5 MB/);expect(imageProblem({name:'a.png',type:'image/png',size:1})).toBeNull();
 expect(imageMarkdown('https://x/a.png','slide-01.png')).toBe('![slide 01](https://x/a.png)');
});
it('owner adds pictures and a cover through the editor, in file-name order',async()=>{
 const upload=vi.fn(async(files:File[],slug:string)=>files.map(f=>({name:f.name,url:`https://cdn.example/${slug}/${f.name}`})));
 render(<ArticleEditor initial={[article]} upload={upload} />);fireEvent.click(screen.getByRole('button',{name:'Edit Example reference'}));
 const add=screen.getByLabelText('Add pictures') as HTMLInputElement;
 fireEvent.change(add,{target:{files:[new File(['b'],'slide-02.png',{type:'image/png'}),new File(['a'],'slide-01.png',{type:'image/png'})]}});
 await screen.findByText('Uploaded 2.');
 const body=(screen.getByLabelText('Article (Markdown)') as HTMLTextAreaElement).value;
 expect(body.indexOf('slide 01')).toBeLessThan(body.indexOf('slide 02'));expect(upload.mock.calls[0][1]).toBe('example');
 fireEvent.change(screen.getByLabelText('Upload cover'),{target:{files:[new File(['c'],'cover.jpg',{type:'image/jpeg'})]}});
 await screen.findByText('Uploaded 1.');
 expect((screen.getByLabelText('Cover image URL (optional)') as HTMLInputElement).value).toBe('https://cdn.example/example/cover.jpg');
});
it('lists ## sections (not code), marks end matter and reads code options',async()=>{
 const {articleSections,codeMeta,isEndMatter,sectionId}=await import('@/lib/articles');
 expect(articleSections('## Watch the **video**\ntext\n```md\n## not a heading\n```\n## [Prompts](https://x)\n### sub')).toEqual([{id:'watch-the-video',text:'Watch the video'},{id:'prompts',text:'Prompts'}]);
 expect(sectionId('Links & sources')).toBe('links-sources');expect(isEndMatter('Links and sources')).toBe(true);expect(isEndMatter('Additional resources')).toBe(true);expect(isEndMatter('Set up the folder')).toBe(false);
 expect(codeMeta('title="Tidy my Downloads" collapsed')).toEqual({title:'Tidy my Downloads',collapsed:true});expect(codeMeta(undefined)).toEqual({title:'',collapsed:false});
});
it('renders prompts as copyable blocks, folded when asked, with anchored sections',async()=>{
 const {ArticleMarkdown}=await import('@/components/articles/article-markdown');
 const writeText=vi.fn(async()=>{});Object.assign(navigator,{clipboard:{writeText}});
 const {container}=render(<ArticleMarkdown text={'## Prompts\n\n```text title="Organise my files"\nSort ~/Downloads by type\n```\n\n```bash collapsed\nmkdir -p "00 Inbox"\n```\n\n## Links and sources\n- [A](https://a.example)'} />);
 expect(container.querySelector('h2#prompts')).toBeTruthy();expect(container.querySelector('h2.article-endmatter')?.textContent).toBe('Links and sources');
 fireEvent.click(screen.getByRole('button',{name:'Copy Organise my files'}));await screen.findByText('Copied ✓');expect(writeText).toHaveBeenCalledWith('Sort ~/Downloads by type');
 const folded=container.querySelector('details.article-code') as HTMLDetailsElement;expect(folded.open).toBe(false);expect(folded.querySelector('summary')?.textContent).toContain('Terminal');
});
