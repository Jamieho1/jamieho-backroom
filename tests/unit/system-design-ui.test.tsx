// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within,waitFor,act} from '@testing-library/react';
const m=vi.hoisted(()=>({viewer:{status:'visitor' as string,id:undefined as string|undefined},params:new URLSearchParams(),loadAttempts:vi.fn(),saveAttempt:vi.fn(),loadProgress:vi.fn(),saveProgress:vi.fn()}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer,configured:true})}));
vi.mock('next/navigation',()=>({useSearchParams:()=>m.params,usePathname:()=>'/interview/system-design/fixture'}));
vi.mock('@/app/actions/system-design',()=>({loadQuizAttempts:m.loadAttempts,saveQuizAttempt:m.saveAttempt,loadSdProgress:m.loadProgress,saveSdProgress:m.saveProgress}));
import {QuizPanel} from '@/components/interview/sd-quiz';
import {SystemDesignPage} from '@/components/interview/sd-page';
import {SolutionView} from '@/components/interview/sd-solution';
import {tocFromMarkdown,type SdQuestion,type QuizItem} from '@/lib/interview/system-design';
const QID='00000000-0000-4000-8000-000000000d01';
const quiz:QuizItem[]=[{q:'First?',options:['wrong','right','x','y'],answer:1,explanation:'First is B.'},{q:'Second?',options:['right','b','c','d'],answer:0,explanation:'Second is A.'},{q:'Third?',options:['a','b','right','d'],answer:2,explanation:''}];
const diagram={title:'Request flow',nodes:[{id:'client',title:'Client'},{id:'api',title:'API'}],edges:[{from:'client',to:'api'}]};
const schema={table:'urls',columns:[{name:'id',type:'bigint',pk:true},{name:'long_url',type:'text'}]};
const solution=`## Overview\nIntro text\n\n## Data Model\n\`\`\`table-schema\n${JSON.stringify(schema)}\n\`\`\`\n\n## Basic design\n\`\`\`diagram\n${JSON.stringify(diagram)}\n\`\`\`\n\n## Additional discussion points\nMore <script>alert(1)</script> text`;
const question:SdQuestion={id:QID,slug:'fixture',title:'Fixture Design',icon:'system-design',topic:'',note_ref:'sd-fixture',solution,quiz,steps:[],sort:1,public:true};
const list=[{id:QID,slug:'fixture',title:'Fixture Design',icon:'system-design',sort:1,topic:'',note_ref:'sd-fixture'},{id:'x2',slug:'other',title:'Other Design',icon:'nope',sort:2,topic:'',note_ref:''}];
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();m.viewer={status:'visitor',id:undefined};m.params=new URLSearchParams();m.loadAttempts.mockResolvedValue({ok:true,attempts:[]});m.loadProgress.mockResolvedValue({ok:true,flagged:[],done:[]});m.saveProgress.mockResolvedValue({ok:true});Element.prototype.scrollIntoView=vi.fn();});
afterEach(cleanup);
const panel=(account?:string)=><QuizPanel questionId={QID} slug="fixture" title="Fixture Design" quiz={quiz} account={account}/>;
it('quiz card shows the title and question count; no AI hint control exists',()=>{
 render(panel());expect(screen.getByRole('heading',{name:'Fixture Design · Quiz · 3 Qs'})).toBeTruthy();expect(screen.getByRole('button',{name:'Start quiz'})).toBeTruthy();expect(screen.getByText('No attempts yet.')).toBeTruthy();expect(screen.queryByText(/hint/i)).toBeNull();
});
it('runs the whole flow with keyboard 1-4, explanations, Don\'t know as wrong, a score screen, review and a stored attempt',async()=>{
 const {unmount}=render(panel());fireEvent.click(screen.getByRole('button',{name:'Start quiz'}));
 expect(screen.getByText('1 / 3')).toBeTruthy();expect(screen.getByRole('heading',{name:'First?'})).toBeTruthy();expect(screen.getAllByRole('button').filter(b=>b.querySelector('kbd'))).toHaveLength(4);
 fireEvent.keyDown(document,{key:'2'});
 expect(screen.getByRole('status').textContent).toContain('Correct');expect(screen.getByText('First is B.')).toBeTruthy();expect(screen.queryByRole('button',{name:"Don't know"})).toBeNull();
 fireEvent.keyDown(document,{key:'3'});expect(screen.getByRole('status').textContent).not.toContain('Incorrect');// answers are final once given
 fireEvent.click(screen.getByRole('button',{name:'Next'}));expect(screen.getByText('2 / 3')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:"Don't know"}));expect(screen.getByRole('status').textContent).toContain("don't know");expect(screen.getByText('Correct answer: right')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Next'}));fireEvent.keyDown(document,{key:'4'});expect(screen.getByRole('status').textContent).toContain('Incorrect');
 fireEvent.click(screen.getByRole('button',{name:'See score'}));
 expect(screen.getByRole('heading',{name:'Your score: 1 / 3'})).toBeTruthy();expect(screen.getByText('33%')).toBeTruthy();
 const review=screen.getByRole('list',{name:''}).closest('ol')??document.querySelector('.iv-sd-review')!;expect(within(review as HTMLElement).getAllByRole('listitem')).toHaveLength(2);expect(within(review as HTMLElement).getByText("You answered: Don't know")).toBeTruthy();expect(within(review as HTMLElement).getByText('You answered: d')).toBeTruthy();
 expect(JSON.parse(localStorage.getItem('jb.sd.quiz.v1.fixture')!)).toMatchObject([{score:1,total:3}]);
 fireEvent.click(screen.getByRole('button',{name:'Back to attempts'}));expect(within(screen.getByRole('list',{name:'Your attempts'})).getByText('1 / 3')).toBeTruthy();expect(screen.getByText(/kept in this browser only/)).toBeTruthy();
 unmount();render(panel());expect(within(screen.getByRole('list',{name:'Your attempts'})).getByText('1 / 3')).toBeTruthy();// survives a reload
 expect(m.saveAttempt).not.toHaveBeenCalled();expect(m.loadAttempts).not.toHaveBeenCalled();
});
it('a perfect run says so and a second attempt is listed newest first',async()=>{
 render(panel());for(let run=0;run<2;run++){fireEvent.click(screen.getByRole('button',{name:'Start quiz'}));for(const [i,key] of ['2','1','3'].entries()){fireEvent.keyDown(document,{key});fireEvent.click(screen.getByRole('button',{name:i<2?'Next':'See score'}));}expect(screen.getByRole('heading',{name:'Your score: 3 / 3'})).toBeTruthy();expect(screen.getByText('Every answer was correct.')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Back to attempts'}));}
 expect(within(screen.getByRole('list',{name:'Your attempts'})).getAllByRole('listitem')).toHaveLength(2);
});
it('an empty quiz cannot be started',()=>{render(<QuizPanel questionId={QID} slug="fixture" title="T" quiz={[]} account={undefined}/>);expect((screen.getByRole('button',{name:'Start quiz'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByText(/No quiz questions/)).toBeTruthy();});
it('signed-in attempts load from and save to the account, never to this browser, and a failed save can be retried',async()=>{
 m.loadAttempts.mockResolvedValue({ok:true,attempts:[{id:'old',score:2,total:3,created_at:'2026-11-01T10:00:00Z'}]});
 m.saveAttempt.mockResolvedValueOnce({ok:false,message:"Couldn't save this attempt."}).mockResolvedValueOnce({ok:true,attempt:{id:'new',score:1,total:3,created_at:'2026-11-23T10:00:00Z'}});
 render(panel('member-id'));await waitFor(()=>expect(within(screen.getByRole('list',{name:'Your attempts'})).getByText('2 / 3')).toBeTruthy());expect(screen.queryByText(/kept in this browser only/)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Start quiz'}));fireEvent.keyDown(document,{key:'2'});fireEvent.click(screen.getByRole('button',{name:'Next'}));fireEvent.click(screen.getByRole('button',{name:"Don't know"}));fireEvent.click(screen.getByRole('button',{name:'Next'}));fireEvent.keyDown(document,{key:'4'});fireEvent.click(screen.getByRole('button',{name:'See score'}));
 await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain("Couldn't save this attempt."));expect(m.saveAttempt).toHaveBeenCalledWith(QID,[1,null,3]);
 await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Retry saving'}));});await waitFor(()=>expect(screen.getByText('Attempt saved to your account.')).toBeTruthy());
 fireEvent.click(screen.getByRole('button',{name:'Back to attempts'}));expect(within(screen.getByRole('list',{name:'Your attempts'})).getAllByRole('listitem')).toHaveLength(2);expect(localStorage.getItem('jb.sd.quiz.v1.fixture')).toBeNull();
});
it('renders the solution with table-schema card, existing diagram component, heading ids from the TOC and no raw HTML',()=>{
 const toc=tocFromMarkdown(solution);const {container}=render(<SolutionView markdown={solution} toc={toc}/>);
 expect([...container.querySelectorAll('h2')].map(h=>h.id)).toEqual(['sd-overview','sd-data-model','sd-basic-design','sd-additional-discussion-points']);
 const card=container.querySelector('[data-table-schema="urls"]')!;expect(within(card as HTMLElement).getByText('long_url')).toBeTruthy();expect(within(card as HTMLElement).getByTitle('Primary key')).toBeTruthy();
 expect(container.querySelector('figure[data-project-diagram="true"]')).toBeTruthy();expect(container.querySelector('script')).toBeNull();
});
it('shows a visible note for malformed table-schema or diagram blocks',()=>{
 const md='## A\n```table-schema\nnope\n```\n```diagram\n{"title":1}\n```';render(<SolutionView markdown={md} toc={tocFromMarkdown(md)}/>);expect(screen.getAllByRole('note')).toHaveLength(2);
});
const page=()=><SystemDesignPage question={question} questions={list}/>;
it('solution tab: On this page lists the ## headings, highlights the section in view while scrolling, jumps on click and goes back to top',()=>{
 const scroller=document.createElement('div');scroller.style.overflowY='auto';scroller.scrollTo=vi.fn() as never;document.body.append(scroller);
 const {container}=render(page(),{container:scroller.appendChild(document.createElement('div'))});
 const aside=container.querySelector('.iv-sd-toc') as HTMLElement;const links=within(aside).getAllByRole('link');expect(links.map(l=>l.textContent)).toEqual(['Overview','Data Model','Basic design','Additional discussion points']);
 const tops:Record<string,number>={'sd-overview':20,'sd-data-model':600,'sd-basic-design':1200,'sd-additional-discussion-points':1800};
 const position=(shift:number)=>{for(const [id,top] of Object.entries(tops))document.getElementById(id)!.getBoundingClientRect=()=>({top:top-shift,bottom:0,left:0,right:0,width:0,height:0,x:0,y:0,toJSON(){}}) as DOMRect;};
 const current=()=>within(aside).getAllByRole('link').filter(l=>l.getAttribute('aria-current')==='location').map(l=>l.textContent);
 return (async()=>{
  position(0);await act(async()=>{scroller.dispatchEvent(new Event('scroll'));await new Promise(r=>requestAnimationFrame(()=>r(null)));});expect(current()).toEqual(['Overview']);
  position(1100);await act(async()=>{scroller.dispatchEvent(new Event('scroll'));await new Promise(r=>requestAnimationFrame(()=>r(null)));});expect(current()).toEqual(['Basic design']);
  position(1750);await act(async()=>{scroller.dispatchEvent(new Event('scroll'));await new Promise(r=>requestAnimationFrame(()=>r(null)));});expect(current()).toEqual(['Additional discussion points']);
  fireEvent.click(within(aside).getByRole('link',{name:'Data Model'}));expect(Element.prototype.scrollIntoView).toHaveBeenCalled();expect(current()).toEqual(['Data Model']);
  fireEvent.click(within(aside).getByRole('button',{name:/Back to top/}));expect(scroller.scrollTo).toHaveBeenCalledWith(expect.objectContaining({top:0}));
 })();
});
it('also renders a collapsible "On this page" for phones that closes after choosing a section',()=>{
 const {container}=render(page());const details=container.querySelector('details.iv-sd-toc-mobile') as HTMLDetailsElement;expect(within(details).getByText('On this page')).toBeTruthy();expect(details.open).toBe(false);
 details.open=true;fireEvent.click(within(details).getByRole('link',{name:'Overview'}));expect(details.open).toBe(false);
});
it('tabs follow the URL: quiz, whiteboard placeholder and an unknown tab falls back to the solution; TOC only on the solution',()=>{
 m.params=new URLSearchParams('tab=quiz');const {container,rerender}=render(page());expect(screen.getByRole('heading',{name:/Quiz · 3 Qs/})).toBeTruthy();expect(container.querySelector('.iv-sd-toc')).toBeNull();expect(screen.getByRole('link',{name:'Quiz'}).getAttribute('aria-current')).toBe('page');expect(screen.getByRole('link',{name:'Quiz'}).getAttribute('href')).toBe('/interview/system-design/fixture?tab=quiz');
 m.params=new URLSearchParams('tab=whiteboard');rerender(page());expect(screen.getByRole('heading',{name:'Whiteboard'})).toBeTruthy();
 m.params=new URLSearchParams('tab=bogus');rerender(page());expect(screen.getByRole('link',{name:'Solution'}).getAttribute('aria-current')).toBe('page');expect(container.querySelector('.iv-sd-toc')).toBeTruthy();
});
it('visitors see no flag or done controls; a question without solution text shows a friendly empty state',()=>{
 render(<SystemDesignPage question={{...question,solution:''}} questions={list}/>);expect(screen.queryByRole('button',{name:/Flag/})).toBeNull();expect(screen.queryByRole('button',{name:/Mark as done/})).toBeNull();expect(screen.getByText(/has not been written yet/)).toBeTruthy();expect(m.loadProgress).not.toHaveBeenCalled();
});
it('signed-in users flag and mark done using their own saved state',async()=>{
 m.viewer={status:'member',id:'member-id'};m.loadProgress.mockResolvedValue({ok:true,flagged:[],done:[QID]});
 render(page());const flag=await screen.findByRole('button',{name:'Flag Fixture Design'});await waitFor(()=>expect((flag as HTMLButtonElement).disabled).toBe(false));
 expect(screen.getByRole('button',{name:'✓ Done'}).getAttribute('aria-pressed')).toBe('true');
 await act(async()=>{fireEvent.click(flag);});expect(m.saveProgress).toHaveBeenCalledWith(QID,'flagged',true);await waitFor(()=>expect(screen.getByRole('button',{name:'Unflag Fixture Design'}).getAttribute('aria-pressed')).toBe('true'));
 await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'✓ Done'}));});expect(m.saveProgress).toHaveBeenLastCalledWith(QID,'done',false);await waitFor(()=>expect(screen.getByRole('button',{name:'Mark as done'}).getAttribute('aria-pressed')).toBe('false'));
});
it('a failed save leaves the control unchanged and shows an alert',async()=>{
 m.viewer={status:'owner',id:'owner-id'};m.saveProgress.mockResolvedValue({ok:false,message:"Couldn't save the change. Retry."});
 render(page());const done=await screen.findByRole('button',{name:'Mark as done'});await waitFor(()=>expect((done as HTMLButtonElement).disabled).toBe(false));await act(async()=>{fireEvent.click(done);});
 expect((await screen.findByRole('alert')).textContent).toContain("Couldn't save");expect(screen.getByRole('button',{name:'Mark as done'}).getAttribute('aria-pressed')).toBe('false');
});
