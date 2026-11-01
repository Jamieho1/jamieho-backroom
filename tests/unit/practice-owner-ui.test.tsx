// @vitest-environment jsdom
import { beforeEach,afterEach,expect,it,vi } from 'vitest';
import { cleanup,render,screen,fireEvent,waitFor,within,act } from '@testing-library/react';
const mocks=vi.hoisted(()=>({load:vi.fn(),saveCode:vi.fn(),saveAttempt:vi.fn(),saveNotes:vi.fn(),run:vi.fn(),warm:vi.fn()}));
vi.mock('@/app/actions/practice-stars',()=>({loadPracticeStars:vi.fn(async()=>({ok:true,problems:[]})),savePracticeStar:vi.fn(async()=>({ok:true}))}));
vi.mock('@/app/actions/practice',()=>({loadPracticeData:mocks.load,savePracticeCode:mocks.saveCode,savePracticeAttempt:mocks.saveAttempt,saveQuestionNotes:mocks.saveNotes}));
vi.mock('@/lib/practice/runner',()=>({PythonRunner:class{warmUp=mocks.warm;run=mocks.run;dispose(){}}}));
vi.mock('@/components/practice/code-editor',()=>({CodeEditor:({initial,onChange,label}:{initial:string;onChange(s:string):void;label:string})=><textarea aria-label={label} defaultValue={initial} onChange={e=>onChange(e.target.value)} />}));
import { PracticeArena } from '@/components/practice/arena';
import { codeKey } from '@/lib/practice/storage';
beforeEach(()=>{
 vi.clearAllMocks();localStorage.clear();mocks.warm.mockResolvedValue(undefined);
 mocks.load.mockResolvedValue({ok:true,data:{note:'Shared note',code:'Server code',attempts:[]}});
 mocks.saveCode.mockResolvedValue({ok:true});mocks.saveAttempt.mockResolvedValue({ok:true});mocks.saveNotes.mockResolvedValue({ok:true});
 mocks.run.mockResolvedValue({status:'ok',passed:1,total:1,results:[{id:'example',visible:true,status:'pass',got:'True',expected:'True'}],stdout:''});
});
afterEach(cleanup);
it('loads server code on another device and offers the browser draft without replacing the saved version',async()=>{
 localStorage.setItem(codeKey('owner',217),'Browser draft');render(<PracticeArena viewerKey="owner" initialProblem={217} canEdit />);
 const editor=await screen.findByRole('textbox',{name:'Python code'});
 expect((editor as HTMLTextAreaElement).value).toBe('Server code');
 fireEvent.click(screen.getByRole('button',{name:'Restore browser draft'}));
 expect((screen.getByRole('textbox',{name:'Python code'}) as HTMLTextAreaElement).value).toBe('Browser draft');
 expect(mocks.saveCode).not.toHaveBeenCalled();
});
it('a failed code save keeps the current draft and Retry saves it',async()=>{
 mocks.saveCode.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ok:true});
 render(<PracticeArena viewerKey="owner" initialProblem={217} canEdit />);
 fireEvent.change(await screen.findByRole('textbox',{name:'Python code'}),{target:{value:'New draft'}});
 fireEvent.click(screen.getByRole('button',{name:'Save code'}));
 await screen.findByRole('button',{name:'Retry saving code'});
 expect((screen.getByRole('textbox',{name:'Python code'}) as HTMLTextAreaElement).value).toBe('New draft');
 fireEvent.click(screen.getByRole('button',{name:'Retry saving code'}));
 await screen.findByText('Saved across devices');
 expect(mocks.saveCode).toHaveBeenLastCalledWith(217,'New draft');
});
it('owner runs save an attempt snapshot, with an idempotent Retry on failure',async()=>{
 mocks.saveAttempt.mockResolvedValueOnce({ok:false,message:'Not saved'}).mockResolvedValueOnce({ok:true});
 render(<PracticeArena viewerKey="owner" initialProblem={217} canEdit />);
 await screen.findByRole('textbox',{name:'Python code'});
 await waitFor(()=>expect((screen.getByRole('button',{name:'Submit'}) as HTMLButtonElement).disabled).toBe(false));
 fireEvent.click(screen.getByRole('button',{name:'Submit'}));
 await screen.findByRole('button',{name:'Retry saving attempt'});
 await waitFor(()=>expect((within(screen.getByRole('navigation',{name:'Practice problems'})).getAllByRole('button')[0] as HTMLButtonElement).disabled).toBe(true));
 const first=mocks.saveAttempt.mock.calls[0][0];expect(first).toMatchObject({problem:217,code:'Server code',mode:'submit',passed:1,total:1});
 fireEvent.click(screen.getByRole('button',{name:'Retry saving attempt'}));
 await screen.findByText('Recent attempts');expect(mocks.saveAttempt).toHaveBeenNthCalledWith(2,first);
});
it('question-note edits survive save failure and block switching until Save or Cancel',async()=>{
 mocks.saveNotes.mockResolvedValueOnce({ok:false,message:'Offline'}).mockResolvedValueOnce({ok:true});
 render(<PracticeArena viewerKey="owner" initialProblem={217} canEdit />);
 fireEvent.click(screen.getByRole('tab',{name:'Notes'}));
 fireEvent.click(await screen.findByRole('button',{name:'Edit question notes'}));
 fireEvent.change(screen.getByLabelText('Question notes (Markdown)'),{target:{value:'Draft explanation'}});
 expect((screen.getByRole('tab',{name:'Solution'}) as HTMLButtonElement).disabled).toBe(true);
 const form=within(screen.getByRole('form',{name:'Edit question notes'}));
 await act(async()=>{fireEvent.click(form.getByRole('button',{name:'Save notes'}));});
 expect(form.getByRole('button',{name:'Retry'})).toBeTruthy();
 expect((screen.getByLabelText('Question notes (Markdown)') as HTMLTextAreaElement).value).toBe('Draft explanation');
 await act(async()=>{fireEvent.click(form.getByRole('button',{name:'Retry'}));});
 await screen.findByText('Draft explanation');expect(mocks.saveNotes).toHaveBeenLastCalledWith(217,'Draft explanation');
});
it('visitors read question notes but never get edit/save controls or upload attempts',async()=>{
 mocks.load.mockResolvedValue({ok:true,data:{note:'Shared note',code:null,attempts:[]}});
 render(<PracticeArena viewerKey="member" initialProblem={217} />);
 fireEvent.click(screen.getByRole('tab',{name:'Notes'}));await screen.findByText('Shared note');
 expect(screen.queryByRole('button',{name:'Edit question notes'})).toBeNull();expect(screen.queryByRole('button',{name:'Save code'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Submit'}));await screen.findByRole('region',{name:'Test results'});
 expect(mocks.saveAttempt).not.toHaveBeenCalled();expect(mocks.saveCode).not.toHaveBeenCalled();
});

it('failed initial load blocks saving unseen remote code; Retry preserves typing and exposes explicit saved-code recovery',async()=>{
 mocks.load.mockRejectedValueOnce(new Error('offline'));
 localStorage.setItem(codeKey('owner',217),'Initial browser draft');
 render(<PracticeArena viewerKey="owner" initialProblem={217} canEdit />);
 const editor=await screen.findByRole('textbox',{name:'Python code'});
 fireEvent.change(editor,{target:{value:'Draft typed offline'}});
 expect((screen.getByRole('button',{name:'Save code'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Retry loading saved data'}));
 await screen.findByRole('button',{name:'Load saved code'});
 expect((screen.getByRole('textbox',{name:'Python code'}) as HTMLTextAreaElement).value).toBe('Draft typed offline');
 fireEvent.click(screen.getByRole('button',{name:'Load saved code'}));
 expect((screen.getByRole('textbox',{name:'Python code'}) as HTMLTextAreaElement).value).toBe('Server code');
 expect(localStorage.getItem(codeKey('owner',217))).toBe('Draft typed offline');
 fireEvent.click(screen.getByRole('button',{name:'Restore browser draft'}));
 expect((screen.getByRole('textbox',{name:'Python code'}) as HTMLTextAreaElement).value).toBe('Draft typed offline');expect(mocks.saveCode).not.toHaveBeenCalled();
});
