// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
const m=vi.hoisted(()=>({save:vi.fn(),create:vi.fn(),viewer:{status:'member',id:'member-id'}}));
vi.mock('@/app/actions/interview-behavioral',()=>({saveBehavioralAnswer:m.save,createBehavioralQuestion:m.create}));vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer})}));vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn(),refresh:vi.fn()})}));vi.mock('@/components/sign-in-button',()=>({SignInButton:()=> <button>Sign in</button>}));
import {BehavioralWorkspace} from '@/components/interview/behavioral';
import {blankAnswer} from '@/lib/interview/behavioral';
const id='12200000-0000-4000-8000-000000000001';
const data={userId:'member-id',configured:true,themes:[{id:'conflict',title:'Conflict',color:'#123456',sort:0}],questions:[{id,theme_id:'conflict',prompt:'Synthetic question',looking_for:'Synthetic guide',talk_about:'',star:'',mistakes:'',followups:'',sample:'',sort:0,published:true}],custom:[],answers:[{...blankAnswer(id),situation:'Synthetic private situation'}],roles:[]};
afterEach(()=>{cleanup();vi.clearAllMocks();m.viewer={status:'member',id:'member-id'};});
it('preserves STAR edits on failure and retries the same fields',async()=>{
 m.save.mockResolvedValueOnce({ok:false,message:'Your edits are still here.'}).mockImplementationOnce(async(value)=>({ok:true,value}));render(<BehavioralWorkspace data={data} questionId={id}/>);fireEvent.change(screen.getByLabelText('Action'),{target:{value:'Changed synthetic action'}});fireEvent.submit(screen.getByRole('form',{name:'Your private STAR answer'}));await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('edits are still here'));expect((screen.getByLabelText('Action') as HTMLTextAreaElement).value).toBe('Changed synthetic action');fireEvent.click(screen.getByRole('button',{name:'Retry save'}));await waitFor(()=>expect(screen.getByRole('status').textContent).toBe('Saved.'));expect(m.save).toHaveBeenLastCalledWith(expect.objectContaining({action:'Changed synthetic action',situation:'Synthetic private situation'}));
});
it('hides previous account questions, answers and preview children immediately on identity change',()=>{
 const {rerender,container}=render(<BehavioralWorkspace data={data} questionId={id}><p>Synthetic draft summary</p></BehavioralWorkspace>);expect(screen.getByRole('form',{name:'Your private STAR answer'})).toBeTruthy();m.viewer={status:'member',id:'other-id'};rerender(<BehavioralWorkspace data={data} questionId={id}><p>Synthetic draft summary</p></BehavioralWorkspace>);expect(screen.queryByRole('form',{name:'Your private STAR answer'})).toBeNull();expect(container.textContent).not.toContain('Synthetic private');expect(container.textContent).not.toContain('Synthetic draft');
});
