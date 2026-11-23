// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,act} from '@testing-library/react';
const m=vi.hoisted(()=>({viewer:{status:'visitor' as string,id:undefined as string|undefined},load:vi.fn(),save:vi.fn(),reset:vi.fn(),phone:false,canvas:null as null|{template:{frames:{name:string}[]};scene:unknown;onSave:(s:unknown)=>void;onReset:()=>void}}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer,configured:true})}));
vi.mock('@/app/actions/system-design-whiteboard',()=>({loadSdWhiteboard:m.load,saveSdWhiteboard:m.save,resetSdWhiteboard:m.reset}));
// The real canvas (Excalidraw) is exercised in the browser spec; here it is a probe that exposes its props.
vi.mock('next/dynamic',()=>({default:()=>(props:NonNullable<typeof m.canvas>)=>{m.canvas=props;return <div data-testid="canvas-probe">{props.template.frames.map(f=>f.name).join('|')}</div>;}}));
import {SystemDesignWhiteboard} from '@/components/interview/sd-whiteboard';
const QID='00000000-0000-4000-8000-000000000f11';
const question={id:QID,slug:'fixture',title:'Fixture Design',solution:'## Overview\nA fixture.\n\n## Requirements\n- Users can add a note'};
const scene={v:1 as const,elements:[{id:'a',type:'rectangle'}]};
beforeEach(()=>{
 vi.clearAllMocks();vi.useRealTimers();localStorage.clear();m.canvas=null;m.viewer={status:'visitor',id:undefined};m.phone=false;
 m.load.mockResolvedValue({ok:true,scene:null});m.save.mockResolvedValue({ok:true});m.reset.mockResolvedValue({ok:true});
 window.matchMedia=((q:string)=>({matches:m.phone&&q.includes('768'),media:q,addEventListener:()=>{},removeEventListener:()=>{}})) as never;
});
afterEach(()=>{cleanup();vi.useRealTimers();});
it('shows the top bar, the placeholder side panel, a keyboard-resizable divider and the canvas from question data',async()=>{
 render(<SystemDesignWhiteboard question={question}/>);
 expect(screen.getByRole('heading',{level:1,name:'Fixture Design'})).toBeTruthy();expect(screen.getByRole('link',{name:'Back to the question'}).getAttribute('href')).toBe('/interview/system-design/fixture');expect(screen.getByRole('link',{name:'All questions'}).getAttribute('href')).toBe('/interview/system-design/practice');
 expect((screen.getByRole('button',{name:'History'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByRole('complementary',{name:'Interview steps'})).toBeTruthy();
 expect((await screen.findByTestId('canvas-probe')).textContent).toBe('Functional Requirements|Non-Functional Requirements|Core Entities|API Design|High-Level Design');
 const sep=screen.getByRole('separator');expect(sep.getAttribute('aria-valuenow')).toBe('340');
 fireEvent.keyDown(sep,{key:'ArrowRight'});expect(sep.getAttribute('aria-valuenow')).toBe('356');fireEvent.keyDown(sep,{key:'ArrowLeft'});fireEvent.keyDown(sep,{key:'ArrowLeft'});expect(sep.getAttribute('aria-valuenow')).toBe('324');
 for(let i=0;i<20;i++)fireEvent.keyDown(sep,{key:'ArrowLeft'});expect(sep.getAttribute('aria-valuenow')).toBe('240');expect(localStorage.getItem('jb.sd.board.panel.v1')).toBe('240');
});
it('timer starts, pauses, resumes and resets',async()=>{
 vi.useFakeTimers();render(<SystemDesignWhiteboard question={question}/>);
 const time=()=>screen.getByRole('timer').textContent;expect(time()).toBe('00:00');
 fireEvent.click(screen.getByRole('button',{name:'Start'}));act(()=>{vi.advanceTimersByTime(3200);});expect(time()).toBe('00:03');
 fireEvent.click(screen.getByRole('button',{name:'Pause'}));act(()=>{vi.advanceTimersByTime(5000);});expect(time()).toBe('00:03');
 fireEvent.click(screen.getByRole('button',{name:'Resume'}));act(()=>{vi.advanceTimersByTime(2000);});expect(Number(time()!.slice(3))).toBeGreaterThanOrEqual(5);
 fireEvent.click(screen.getByRole('button',{name:'Reset timer'}));expect(time()).toBe('00:00');expect(screen.getByRole('button',{name:'Start'})).toBeTruthy();
});
it('visitors autosave to localStorage, reload the saved board and reset removes it; the server is never called',async()=>{
 const first=render(<SystemDesignWhiteboard question={question}/>);await screen.findByTestId('canvas-probe');expect(m.canvas!.scene).toBeNull();
 await act(async()=>{m.canvas!.onSave(scene);});
 await waitFor(()=>expect(screen.getByText('Saved')).toBeTruthy());expect(JSON.parse(localStorage.getItem('jb.sd.board.v1.fixture')!)).toEqual(scene);
 first.unmount();render(<SystemDesignWhiteboard question={question}/>);await screen.findByTestId('canvas-probe');expect(m.canvas!.scene).toEqual({...scene,elements:[{id:'a',type:'rectangle',link:null}]});
 act(()=>m.canvas!.onReset());expect(localStorage.getItem('jb.sd.board.v1.fixture')).toBeNull();expect(m.load).not.toHaveBeenCalled();expect(m.save).not.toHaveBeenCalled();expect(m.reset).not.toHaveBeenCalled();
});
it('ignores corrupt or oversized stored boards and keeps working when storage throws',async()=>{
 localStorage.setItem('jb.sd.board.v1.fixture','{bad');render(<SystemDesignWhiteboard question={question}/>);await screen.findByTestId('canvas-probe');expect(m.canvas!.scene).toBeNull();
 const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});
 await act(async()=>{m.canvas!.onSave(scene);});await waitFor(()=>expect(screen.getByText("This browser can't store the board.")).toBeTruthy());spy.mockRestore();
 await act(async()=>{m.canvas!.onSave({v:1,elements:[{id:'b',type:'text',text:'x'.repeat(1_000_000)}]});});await waitFor(()=>expect(screen.getByText(/too large to save/)).toBeTruthy());
});
it('signed-in users load, save and reset through their account only',async()=>{
 m.viewer={status:'member',id:'u1'};m.load.mockResolvedValue({ok:true,scene});
 render(<SystemDesignWhiteboard question={question}/>);await screen.findByTestId('canvas-probe');
 expect(m.load).toHaveBeenCalledWith(QID);expect(m.canvas!.scene).toEqual(scene);expect(screen.getByText('Autosaves to your account')).toBeTruthy();
 await act(async()=>{m.canvas!.onSave(scene);});expect(m.save).toHaveBeenCalledWith(QID,scene);await waitFor(()=>expect(screen.getByText('Saved')).toBeTruthy());expect(localStorage.length).toBe(0);
 m.save.mockResolvedValue({ok:false,message:"Couldn't save your board. Retry."});await act(async()=>{m.canvas!.onSave(scene);});await waitFor(()=>expect(screen.getByText("Couldn't save your board. Retry.")).toBeTruthy());
 act(()=>m.canvas!.onReset());expect(m.reset).toHaveBeenCalledWith(QID);
});
it('a failed load shows a retry and does not mount the canvas, so a saved board cannot be overwritten',async()=>{
 m.viewer={status:'member',id:'u1'};m.load.mockResolvedValueOnce({ok:false,message:"Couldn't load your board. Retry."});
 render(<SystemDesignWhiteboard question={question}/>);expect((await screen.findByRole('alert')).textContent).toContain("Couldn't load your board");expect(screen.queryByTestId('canvas-probe')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Retry'}));expect(await screen.findByTestId('canvas-probe')).toBeTruthy();expect(m.load).toHaveBeenCalledTimes(2);
});
it('serialises saves: a newer scene replaces one that is waiting',async()=>{
 m.viewer={status:'member',id:'u1'};let release:(v:{ok:true})=>void=()=>{};m.save.mockImplementationOnce(()=>new Promise(r=>{release=r as never;}));
 render(<SystemDesignWhiteboard question={question}/>);await screen.findByTestId('canvas-probe');
 const s=(id:string)=>({v:1 as const,elements:[{id,type:'line'}]});
 await act(async()=>{m.canvas!.onSave(s('1'));m.canvas!.onSave(s('2'));m.canvas!.onSave(s('3'));});expect(m.save).toHaveBeenCalledTimes(1);
 await act(async()=>{release({ok:true});});await waitFor(()=>expect(m.save).toHaveBeenCalledTimes(2));expect(m.save.mock.calls[1][1]).toEqual(s('3'));
});
it('phones get a "Best on a larger screen" note with a read-only template preview until they continue anyway',async()=>{
 m.phone=true;render(<SystemDesignWhiteboard question={question}/>);
 expect(screen.getByRole('heading',{name:'Best on a larger screen'})).toBeTruthy();expect(screen.getByRole('img',{name:'Preview of the starting board'})).toBeTruthy();
 expect(screen.getByText('Functional Requirements')).toBeTruthy();expect(screen.queryByTestId('canvas-probe')).toBeNull();expect(m.load).not.toHaveBeenCalledWith('x');
 fireEvent.click(screen.getByRole('button',{name:'Continue anyway'}));expect(await screen.findByTestId('canvas-probe')).toBeTruthy();expect(screen.queryByRole('heading',{name:'Best on a larger screen'})).toBeNull();
});
