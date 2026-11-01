// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within,waitFor} from '@testing-library/react';
const m=vi.hoisted(()=>({load:vi.fn(),save:vi.fn()}));
vi.mock('@/app/actions/practice-stars',()=>({loadPracticeStars:m.load,savePracticeStar:m.save}));
vi.mock('@/app/actions/practice',()=>({loadPracticeData:vi.fn(async()=>({ok:true,data:{note:'',code:null,attempts:[]}})),savePracticeCode:vi.fn(),savePracticeAttempt:vi.fn(),saveQuestionNotes:vi.fn()}));
vi.mock('@/lib/practice/runner',()=>({PythonRunner:class{warmUp=async()=>{};dispose(){}}}));
vi.mock('@/components/practice/code-editor',()=>({CodeEditor:()=>null}));
import {PracticeArena} from '@/components/practice/arena';
beforeEach(()=>{vi.clearAllMocks();m.load.mockResolvedValue({ok:true,problems:[217]});m.save.mockResolvedValue({ok:true});});afterEach(cleanup);
it('shows difficulty and NeetCode tags, clear search placeholder and no private controls for visitors',()=>{
 render(<PracticeArena viewerKey="member" initialProblem={217} />);
 const problem=screen.getByRole('region',{name:'Contains Duplicate'});expect(within(problem).getByText('Easy').getAttribute('data-difficulty')).toBe('easy');expect(within(problem).getByText('NeetCode 150')).toBeTruthy();
 fireEvent.change(screen.getByPlaceholderText('Search questions…'),{target:{value:'217'}});expect(within(screen.getByRole('navigation',{name:'Practice problems'})).getAllByRole('button')).toHaveLength(1);expect(screen.queryByRole('button',{name:/for later/})).toBeNull();expect(m.load).not.toHaveBeenCalled();
});
it('owner loads the saved list; failed unstar keeps it intact and Retry removes it',async()=>{
 m.save.mockRejectedValueOnce(new Error('offline'));render(<PracticeArena viewerKey="owner" initialProblem={217} canEdit />);
 const filter=await screen.findByRole('button',{name:'★ Starred (1)'});fireEvent.click(filter);
 expect(within(screen.getByRole('navigation',{name:'Practice problems'})).getAllByRole('button')).toHaveLength(1);
 fireEvent.click(screen.getByRole('button',{name:'Unstar Contains Duplicate for later'}));await screen.findByRole('button',{name:'Retry saving star'});expect(screen.getByRole('button',{name:'★ Starred (1)'})).toBeTruthy();expect(screen.getByRole('button',{name:'Unstar Contains Duplicate for later'}).getAttribute('aria-pressed')).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'Retry saving star'}));await screen.findByRole('button',{name:'★ Starred (0)'});expect(m.save).toHaveBeenNthCalledWith(2,217,false);expect(screen.getByText(/No starred questions match/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Star Contains Duplicate for later'}));await screen.findByRole('button',{name:'★ Starred (1)'});expect(m.save).toHaveBeenLastCalledWith(217,true);
});
it('load failures disable toggles until Retry; a retried save retains the original problem after selection changes',async()=>{
 m.load.mockResolvedValueOnce({ok:false,message:'Unavailable'});m.save.mockResolvedValueOnce({ok:false,message:'Not saved'});render(<PracticeArena viewerKey="owner" initialProblem={217} canEdit />);
 await screen.findByRole('button',{name:'Retry loading stars'});expect((screen.getByRole('button',{name:'Star Contains Duplicate for later'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Retry loading stars'}));await screen.findByRole('button',{name:'★ Starred (1)'});
 fireEvent.click(screen.getByRole('button',{name:'Unstar Contains Duplicate for later'}));await screen.findByRole('button',{name:'Retry saving star'});
 const nav=screen.getByRole('navigation',{name:'Practice problems'});fireEvent.click(within(nav).getByRole('button',{name:/^Two SumEasy|^Two Sum Easy/}));
 fireEvent.click(screen.getByRole('button',{name:'Retry saving star'}));await waitFor(()=>expect(m.save).toHaveBeenNthCalledWith(2,217,false));
});
