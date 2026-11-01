// @vitest-environment jsdom
import { afterEach,beforeEach,expect,it,vi } from "vitest";
import { cleanup,render,screen,fireEvent,waitFor } from "@testing-library/react";
const mocks=vi.hoisted(()=>({warm:vi.fn(),run:vi.fn(),dispose:vi.fn()}));
vi.mock('@/app/actions/practice-stars',()=>({loadPracticeStars:vi.fn(),savePracticeStar:vi.fn()}));
vi.mock('@/app/actions/practice',()=>({loadPracticeData:vi.fn(async()=>({ok:true,data:{note:"",code:null,attempts:[]}})),savePracticeCode:vi.fn(),savePracticeAttempt:vi.fn(),saveQuestionNotes:vi.fn()}));
vi.mock('@/lib/practice/runner',()=>({PythonRunner:class {warmUp=mocks.warm;run=mocks.run;dispose=mocks.dispose;}}));
vi.mock('@/components/practice/code-editor',()=>({CodeEditor:({initial,onChange,label}:{initial:string;onChange(s:string):void;label:string})=><textarea aria-label={label} defaultValue={initial} onChange={e=>onChange(e.target.value)} />}));
import { PracticeArena } from '@/components/practice/arena';
import { codeKey } from '@/lib/practice/storage';
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();mocks.warm.mockResolvedValue(undefined);mocks.run.mockResolvedValue({status:'ok',results:[],passed:0,total:0,stdout:''});});
afterEach(cleanup);
it('keeps code in this browser under the viewer and problem, and restores it on reload',async()=>{
 const first=render(<PracticeArena viewerKey="member" initialProblem={217} />);
 fireEvent.change(screen.getByRole('textbox',{name:'Python code'}),{target:{value:'my code'}});
 expect(localStorage.getItem(codeKey('member',217))).toBe('my code');first.unmount();
 render(<PracticeArena viewerKey="member" initialProblem={217} />);
 expect((screen.getByRole('textbox',{name:'Python code'}) as HTMLTextAreaElement).value).toBe('my code');
});
it('does not load another signed-in viewer\'s code',()=>{
 localStorage.setItem(codeKey('other',217),'private code');render(<PracticeArena viewerKey="member" initialProblem={217} />);
 expect((screen.getByRole('textbox',{name:'Python code'}) as HTMLTextAreaElement).value).not.toBe('private code');
});
it('disables Run/Submit if Python fails, while Solution stays readable',async()=>{
 mocks.warm.mockRejectedValue(new Error('offline'));render(<PracticeArena viewerKey="member" initialProblem={217} />);
 await screen.findByRole('alert');expect((screen.getByRole('button',{name:'Run'}) as HTMLButtonElement).disabled).toBe(true);
 expect((screen.getByRole('button',{name:'Submit'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('tab',{name:'Solution'}));expect(screen.getByRole('heading',{name:'Reference code'})).toBeTruthy();
});
it('passes the selected mode to the browser runner and displays the result',async()=>{
 render(<PracticeArena viewerKey="member" initialProblem={217} />);
 await waitFor(()=>expect((screen.getByRole('button',{name:'Run'}) as HTMLButtonElement).disabled).toBe(false));
 fireEvent.click(screen.getByRole('button',{name:'Submit'}));
 await screen.findByRole('region',{name:'Test results'});
 expect(mocks.run).toHaveBeenCalledWith(expect.objectContaining({lc:217}),expect.any(String),'submit');
});
