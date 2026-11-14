// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
const m=vi.hoisted(()=>({path:'/interview/dsa/practice',viewer:{status:'anonymous',name:'Example'}}));
vi.mock('next/navigation',()=>({usePathname:()=>m.path}));
vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer,configured:false})}));
vi.mock('@/components/sign-in-button',()=>({SignInButton:()=> <button>Sign in</button>}));
import {InterviewShell,INTERVIEW_STORAGE} from '@/components/interview/shell';
import {InterviewIcon} from '@/components/interview/icons';
import {INTERVIEW_SECTIONS,interviewTopics,interviewSection} from '@/lib/interview/navigation';
import {TOPICS} from '@/lib/notes/topics';
import {SiteHeader} from '@/components/site-header';
beforeEach(()=>{vi.restoreAllMocks();localStorage.clear();m.path='/interview/dsa/practice';m.viewer={status:'anonymous',name:'Example'};vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('has the complete section taxonomy, 17 DSA topics and class design in LLD with a real colour',()=>{
 expect(INTERVIEW_SECTIONS).toHaveLength(11);expect(interviewTopics('dsa')).toHaveLength(17);expect(interviewTopics('low-level-design').map(t=>t.id)).toEqual(['class-design']);expect(TOPICS.at(-1)?.dot).toMatch(/^#[0-9A-F]{6}$/i);expect(interviewSection('/interview/dsa/notes/trees').id).toBe('dsa');expect(interviewSection('/interview/behavioral').id).toBe('behavioral');
 for(const topic of TOPICS){const {container,unmount}=render(<InterviewIcon name={topic.id}/>);expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe('1.7');expect(container.querySelector('svg')?.getAttribute('fill')).toBe('none');expect(container.querySelector('path')?.getAttribute('d')).toBeTruthy();unmount();}
});
it('renders links and active navigation while persisting both independent collapse states',async()=>{
 const {unmount}=render(<InterviewShell><h1>Fixture</h1></InterviewShell>);expect(screen.getByRole('link',{name:'Data Structures & Algorithms'}).getAttribute('aria-current')).toBe('page');
 fireEvent.click(screen.getByRole('button',{name:'Collapse section rail'}));fireEvent.click(screen.getByRole('button',{name:'Collapse topics'}));
 expect(localStorage.getItem(INTERVIEW_STORAGE.rail)).toBe('true');expect(localStorage.getItem(INTERVIEW_STORAGE.topics)).toBe('true');unmount();render(<InterviewShell><h1>Fixture</h1></InterviewShell>);
 await waitFor(()=>expect(document.querySelector('.iv-shell')?.getAttribute('data-rail-collapsed')).toBe('true'));expect(document.querySelector<HTMLButtonElement>('.iv-expand-topics')!).toBeTruthy();
 fireEvent.click(document.querySelector<HTMLButtonElement>('.iv-expand-topics')!);expect(localStorage.getItem(INTERVIEW_STORAGE.topics)).toBe('false');
});
it('collapsed links have tooltips on pointer hover and keyboard focus',()=>{
 localStorage.setItem(INTERVIEW_STORAGE.rail,'true');render(<InterviewShell>Fixture</InterviewShell>);
 const link=screen.getByRole('link',{name:'Finance'});fireEvent.focus(link);expect(screen.getByRole('tooltip').textContent).toBe('Finance');expect(link.getAttribute('aria-describedby')).toBe('iv-tooltip');fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('tooltip')).toBeNull();fireEvent.focus(link);fireEvent.blur(link);expect(screen.queryByRole('tooltip')).toBeNull();fireEvent.mouseEnter(link);expect(screen.getByRole('tooltip').textContent).toBe('Finance');fireEvent.mouseLeave(link);expect(screen.queryByRole('tooltip')).toBeNull();
});
it('storage exceptions do not break collapse controls',()=>{
 vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw Error('blocked')});vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('blocked')});render(<InterviewShell>Fixture</InterviewShell>);fireEvent.click(screen.getByRole('button',{name:'Collapse section rail'}));expect(document.querySelector('.iv-shell')?.getAttribute('data-rail-collapsed')).toBe('true');
});
it('the global top bar is excluded only at the Interview route boundary',()=>{
 m.path='/interview';const {container,rerender}=render(<SiteHeader/>);expect(container.innerHTML).toBe('');m.path='/interview/dsa/practice';rerender(<SiteHeader/>);expect(container.innerHTML).toBe('');m.path='/interviewer';rerender(<SiteHeader/>);expect(screen.getByRole('navigation',{name:'Site'})).toBeTruthy();
});
