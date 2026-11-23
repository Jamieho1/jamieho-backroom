// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,act,within} from '@testing-library/react';
const m=vi.hoisted(()=>({
 viewer:{status:'visitor' as string,id:undefined as string|undefined},
 load:vi.fn(),save:vi.fn(),reset:vi.fn(),list:vi.fn(),open:vi.fn(),saveAttempt:vi.fn(),del:vi.fn(),
 canvas:null as null|{scene:unknown;readOnly?:boolean;onSave:(s:unknown)=>void},
 api:{} as Record<string,unknown>,
}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer,configured:true})}));
vi.mock('@/app/actions/system-design-whiteboard',()=>({loadSdWhiteboard:m.load,saveSdWhiteboard:m.save,resetSdWhiteboard:m.reset}));
vi.mock('@/app/actions/system-design-history',()=>({listSdAttempts:m.list,loadSdAttempt:m.open,saveSdAttempt:m.saveAttempt,deleteSdAttempt:m.del}));
// The real canvas (Excalidraw) is exercised in the browser spec; here it is a probe that hands over a fake API.
vi.mock('next/dynamic',async()=>{const {useEffect}=await import('react');return {default:()=>(props:{scene:unknown;readOnly?:boolean;onSave:(s:unknown)=>void;onApi?:(a:unknown)=>void})=>{
 m.canvas=props;useEffect(()=>{props.onApi?.(m.api);return()=>props.onApi?.(null);},[]);
 return <div data-testid="canvas-probe" data-readonly={props.readOnly?'1':undefined}/>;}};});
import {SystemDesignWhiteboard} from '@/components/interview/sd-whiteboard';
import type {SdStep} from '@/lib/interview/sd-steps';
const QID='00000000-0000-4000-8000-000000000f11';
const steps:SdStep[]=[
 {id:'non-functional',title:'Non-functional',category:'Requirements',question:'What qualities matter most?',instruction:'Write your answer in the purple box on the whiteboard.',minutes:2,frame:'wb-non',how_to_answer:'Start with **latency** and availability.',model_answer:'Reads must be **fast** and the service highly available.',checklist:['Latency target','Availability target','Consistency choice'],clarifying:[{q:'How many users?',a:'About ten million daily.'},{q:'Is it global?',a:'Yes, worldwide.'}]},
 {id:'entities',title:'Core entities',category:'Data',question:'What are the core entities?',instruction:'Revise your design and explain.',minutes:3,frame:'wb-entities',how_to_answer:'List nouns.',model_answer:'A User and a Link.',checklist:['User','Link'],clarifying:[]},
 {id:'redirect-flow',title:'Redirect flow',category:'Deep dive',question:'How does a redirect work?',instruction:'Explain the read path.',minutes:3,frame:'wb-hld',how_to_answer:'',model_answer:'',checklist:[],clarifying:[]},
];
const question={id:QID,slug:'fixture',title:'Fixture Design',solution:'## Overview\nA fixture.',steps};
const frames=[{id:'wb-non',type:'frame',name:'Non-Functional Requirements'},{id:'wb-entities',type:'frame',name:'Core Entities'},{id:'wb-hld',type:'frame',name:'High-Level Design'}];
const scene={v:1 as const,elements:[{id:'a',type:'rectangle',link:null}]};
beforeEach(()=>{
 vi.clearAllMocks();localStorage.clear();m.canvas=null;m.viewer={status:'visitor',id:undefined};
 m.api={getSceneElements:()=>[...frames,{id:'a',type:'rectangle'}],getAppState:()=>({scrollX:3,scrollY:4,zoom:{value:0.8}}),scrollToContent:vi.fn(),updateScene:vi.fn()};
 m.load.mockResolvedValue({ok:true,scene:null});m.save.mockResolvedValue({ok:true});m.reset.mockResolvedValue({ok:true});
 window.matchMedia=((q:string)=>({matches:false,media:q,addEventListener:()=>{},removeEventListener:()=>{}})) as never;
 delete (window as unknown as Record<string,unknown>).SpeechRecognition;delete (window as unknown as Record<string,unknown>).webkitSpeechRecognition;
});
afterEach(()=>{cleanup();vi.useRealTimers();});
const mount=async(q=question)=>{const r=render(<SystemDesignWhiteboard question={q}/>);await screen.findByTestId('canvas-probe');return r;};
const answerBox=()=>screen.getByRole('textbox',{name:'Your answer'}) as HTMLTextAreaElement;
const scroll=()=>m.api.scrollToContent as ReturnType<typeof vi.fn>;

it('shows the first step with category, interviewer question, instruction and target time',async()=>{
 await mount();
 const panel=screen.getByRole('complementary',{name:'Interview steps'});
 expect(within(panel).getByText('Requirements')).toBeTruthy();expect(within(panel).getByRole('heading',{level:3,name:'Non-functional'})).toBeTruthy();
 expect(within(panel).getByText('What qualities matter most?')).toBeTruthy();expect(within(panel).getByText(/purple box on the whiteboard/)).toBeTruthy();expect(within(panel).getByText('Spend ~2 minutes in a real interview.')).toBeTruthy();
 expect(within(panel).getByText('Step 1 of 3')).toBeTruthy();expect((screen.getByRole('button',{name:'Previous step'}) as HTMLButtonElement).disabled).toBe(true);
 expect(screen.getByRole('button',{name:'Step 1: Non-functional'}).getAttribute('aria-current')).toBe('step');
});
it('navigates with arrows and dots and focuses the linked canvas frame',async()=>{
 await mount();
 fireEvent.click(screen.getByRole('button',{name:'Next step'}));
 expect(screen.getByRole('heading',{level:3,name:'Core entities'})).toBeTruthy();expect(scroll()).toHaveBeenCalledWith(frames[1],expect.objectContaining({fitToViewport:true}));
 expect(m.api.updateScene).toHaveBeenLastCalledWith({appState:{selectedElementIds:{'wb-entities':true}}});
 fireEvent.click(screen.getByRole('button',{name:'Step 3: Redirect flow'}));expect(scroll()).toHaveBeenLastCalledWith(frames[2],expect.anything());expect((screen.getByRole('button',{name:'Next step'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Previous step'}));expect(screen.getByRole('heading',{level:3,name:'Core entities'})).toBeTruthy();expect(scroll()).toHaveBeenLastCalledWith(frames[1],expect.anything());
});
it('keeps a text answer per step and restores answers, step and timer after a reload (this browser only)',async()=>{
 vi.useFakeTimers({shouldAdvanceTime:true});
 const first=await mount();
 fireEvent.change(answerBox(),{target:{value:'Fast reads, 99.9% uptime'}});
 fireEvent.click(screen.getByRole('button',{name:'Start'}));act(()=>{vi.advanceTimersByTime(7200);});fireEvent.click(screen.getByRole('button',{name:'Pause'}));
 fireEvent.click(screen.getByRole('button',{name:'Next step'}));expect(answerBox().value).toBe('');fireEvent.change(answerBox(),{target:{value:'User and Link'}});
 fireEvent.click(screen.getByRole('button',{name:'Previous step'}));expect(answerBox().value).toBe('Fast reads, 99.9% uptime');
 act(()=>{vi.advanceTimersByTime(600);});
 const stored=JSON.parse(localStorage.getItem('jb.sd.attempt.v1.visitor:fixture')!);expect(stored.answers).toEqual({'non-functional':'Fast reads, 99.9% uptime',entities:'User and Link'});expect(stored.seconds).toBeGreaterThanOrEqual(7);
 first.unmount();
 await mount();expect(answerBox().value).toBe('Fast reads, 99.9% uptime');expect(Number(screen.getByRole('timer').textContent!.slice(3))).toBeGreaterThanOrEqual(7);
 expect(m.save).not.toHaveBeenCalled();expect(m.saveAttempt).not.toHaveBeenCalled();
});
it('compare with model answer reveals the model answer and a checklist; ticking shows "You covered X of Y" with no grading',async()=>{
 await mount();
 expect(screen.queryByTestId('sd-compare')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Compare with model answer'}));
 const box=within(screen.getByTestId('sd-compare'));expect(box.getByText('fast').tagName).toBe('STRONG');
 expect(box.getByText('You covered 0 of 3')).toBeTruthy();
 fireEvent.click(box.getByRole('checkbox',{name:'Latency target'}));fireEvent.click(box.getByRole('checkbox',{name:'Consistency choice'}));
 expect(box.getByText('You covered 2 of 3')).toBeTruthy();expect((box.getByRole('checkbox',{name:'Latency target'}) as HTMLInputElement).checked).toBe(true);
 fireEvent.click(box.getByRole('checkbox',{name:'Latency target'}));expect(box.getByText('You covered 1 of 3')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Hide model answer'}));expect(screen.queryByTestId('sd-compare')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Next step'}));fireEvent.click(screen.getByRole('button',{name:'Compare with model answer'}));expect(screen.getByText('You covered 0 of 2')).toBeTruthy();
});
it("shows How to answer by default and reveals the interviewer's pre-written answer for a clarifying question",async()=>{
 await mount();
 expect(screen.getByRole('tab',{name:'How to answer',selected:true})).toBeTruthy();expect(screen.getByText('latency').tagName).toBe('STRONG');
 fireEvent.click(screen.getByRole('tab',{name:'Ask clarifying questions'}));
 expect(screen.queryByText('About ten million daily.')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'How many users?'}));expect(screen.getByText('About ten million daily.')).toBeTruthy();expect(screen.queryByText('Yes, worldwide.')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'How many users?'}));expect(screen.queryByText('About ten million daily.')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Next step'}));fireEvent.click(screen.getByRole('tab',{name:'Ask clarifying questions'}));expect(screen.getByText(/No common clarifying questions/)).toBeTruthy();
});
it('visitors: finish saves a snapshot in this browser; history opens it read-only and Restore puts it back on the board',async()=>{
 await mount();
 fireEvent.change(answerBox(),{target:{value:'Fast reads'}});
 fireEvent.click(screen.getByRole('button',{name:'Compare with model answer'}));fireEvent.click(screen.getByRole('checkbox',{name:'Latency target'}));fireEvent.click(screen.getByRole('checkbox',{name:'Availability target'}));
 fireEvent.click(screen.getByRole('button',{name:'Finish attempt'}));
 await waitFor(()=>expect(screen.getByText(/Attempt saved/)).toBeTruthy());
 const local=JSON.parse(localStorage.getItem('jb.sd.history.v1.fixture')!);expect(local).toHaveLength(1);
 expect(local[0]).toMatchObject({answers:{'non-functional':'Fast reads'},checks:{'non-functional':[0,1]},covered:2,total:5,seconds:0,scene:{v:1,view:{scrollX:3,scrollY:4,zoom:0.8}}});
 expect(m.saveAttempt).not.toHaveBeenCalled();
 expect(answerBox().value).toBe('');
 fireEvent.click(screen.getByRole('button',{name:'History'}));
 const drawer=within(screen.getByRole('dialog',{name:'Attempt history'}));expect(drawer.getByText('Covered 2 of 5 · 00:00',{exact:false})).toBeTruthy();
 fireEvent.click(drawer.getByRole('button',{name:'Open'}));
 expect(screen.getByText('Viewing a saved attempt (read only)')).toBeTruthy();expect(screen.getByTestId('canvas-probe').getAttribute('data-readonly')).toBe('1');
 const review=within(screen.getByRole('complementary',{name:'Saved attempt (read only)'}));expect(review.getByText('Fast reads')).toBeTruthy();expect(review.getByText('You covered 2 of 5',{exact:false})).toBeTruthy();
 expect(screen.queryByRole('button',{name:'Finish attempt'})).toBeNull();
 fireEvent.click(review.getByRole('button',{name:'Restore to board'}));fireEvent.click(review.getByRole('button',{name:'Restore'}));
 expect(screen.queryByText('Viewing a saved attempt (read only)')).toBeNull();expect(screen.getByTestId('canvas-probe').getAttribute('data-readonly')).toBeNull();
 expect((m.canvas!.scene as {v:number;elements:{id:string}[]}).v).toBe(1);expect((m.canvas!.scene as {elements:{id:string}[]}).elements.map(e=>e.id)).toContain('a');expect(answerBox().value).toBe('Fast reads');
 await waitFor(()=>expect(JSON.parse(localStorage.getItem('jb.sd.board.v1.fixture')!)).toMatchObject({v:1}));
});
it('opening a saved attempt then going back leaves the live board unchanged; delete removes it',async()=>{
 localStorage.setItem('jb.sd.history.v1.fixture',JSON.stringify([{id:'h1',created_at:'2026-11-20T09:00:00.000Z',seconds:61,covered:0,total:0,answers:{},checks:{},scene}]));
 await mount();fireEvent.click(screen.getByRole('button',{name:'History'}));fireEvent.click(screen.getByRole('button',{name:'Open'}));
 fireEvent.click(screen.getByRole('button',{name:'Back to my board'}));expect(screen.getByRole('complementary',{name:'Interview steps'})).toBeTruthy();expect(screen.getByTestId('canvas-probe').getAttribute('data-readonly')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'History'}));fireEvent.click(screen.getByRole('button',{name:/Delete attempt/}));
 await waitFor(()=>expect(screen.getByText(/No finished attempts yet/)).toBeTruthy());expect(JSON.parse(localStorage.getItem('jb.sd.history.v1.fixture')!)).toEqual([]);
});
it('signed-in users finish, list and open attempts through their account only',async()=>{
 m.viewer={status:'member',id:'u1'};
 const item={id:'00000000-0000-4000-8000-0000000000a1',created_at:'2026-11-21T09:00:00.000Z',seconds:90,covered:1,total:5};
 m.saveAttempt.mockResolvedValue({ok:true,item});m.list.mockResolvedValue({ok:true,items:[item]});
 m.open.mockResolvedValue({ok:true,attempt:{...item,answers:{entities:'User and Link'},checks:{},scene}});
 await mount();fireEvent.change(answerBox(),{target:{value:'Mine'}});
 fireEvent.click(screen.getByRole('button',{name:'Finish attempt'}));await waitFor(()=>expect(m.saveAttempt).toHaveBeenCalledTimes(1));
 expect(m.saveAttempt).toHaveBeenCalledWith(QID,expect.objectContaining({answers:{'non-functional':'Mine'},total:5,scene:expect.objectContaining({v:1})}));
 expect(localStorage.getItem('jb.sd.history.v1.fixture')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'History'}));await waitFor(()=>expect(m.list).toHaveBeenCalledWith(QID));
 fireEvent.click(await screen.findByRole('button',{name:'Open'}));await waitFor(()=>expect(m.open).toHaveBeenCalledWith(QID,item.id));
 expect(await screen.findByText('Viewing a saved attempt (read only)')).toBeTruthy();
});
it('a failed finish keeps the answers and says so',async()=>{
 m.viewer={status:'member',id:'u1'};m.saveAttempt.mockResolvedValue({ok:false,message:"Couldn't save your attempt. Retry."});
 await mount();fireEvent.change(answerBox(),{target:{value:'Keep me'}});fireEvent.click(screen.getByRole('button',{name:'Finish attempt'}));
 await waitFor(()=>expect(screen.getByText("Couldn't save your attempt. Retry.")).toBeTruthy());expect(answerBox().value).toBe('Keep me');
});
it('hides voice mode and its notice when SpeechRecognition is absent',async()=>{
 await mount();
 expect(screen.queryByRole('button',{name:'Use voice'})).toBeNull();expect(screen.queryByText(/speech service/)).toBeNull();expect(screen.queryByRole('button',{name:/dictation/})).toBeNull();expect(answerBox()).toBeTruthy();
});
it('offers voice dictation where supported: live transcript in the text box, notice, switch to text mode',async()=>{
 const inst:{current:null|{onresult:(e:unknown)=>void;started:boolean;stopped:boolean}}={current:null};
 (window as unknown as {webkitSpeechRecognition:unknown}).webkitSpeechRecognition=class{continuous=false;interimResults=false;lang='';started=false;stopped=false;onresult:(e:unknown)=>void=()=>{};onerror=null;onend:()=>void=()=>{};start(){this.started=true;inst.current=this as never;}stop(){this.stopped=true;}abort(){}};
 await mount();fireEvent.change(answerBox(),{target:{value:'Existing'}});
 fireEvent.click(screen.getByRole('button',{name:'Use voice'}));
 expect(screen.getByText(/Voice uses your browser's speech service/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Start dictation'}));expect(inst.current!.started).toBe(true);expect(screen.getByRole('button',{name:'Stop dictation'}).getAttribute('aria-pressed')).toBe('true');
 act(()=>inst.current!.onresult({results:[{isFinal:true,0:{transcript:'redirect via cache'}},{isFinal:false,0:{transcript:'then database'}}]}));
 expect(answerBox().value).toBe('Existing redirect via cache then database');
 fireEvent.click(screen.getByRole('button',{name:'Switch to text mode'}));expect(inst.current!.stopped).toBe(true);expect(screen.getByRole('button',{name:'Use voice'})).toBeTruthy();expect(screen.queryByText(/speech service/)).toBeNull();
 fireEvent.change(answerBox(),{target:{value:'typed again'}});expect(answerBox().value).toBe('typed again');
});
it('a question with no steps still shows the board with a note and Finish attempt',async()=>{
 await mount({...question,steps:[]});expect(screen.getByText(/no interview steps yet/)).toBeTruthy();expect(screen.getByRole('button',{name:'Finish attempt'})).toBeTruthy();expect(screen.queryByRole('button',{name:'Next step'})).toBeNull();
});
