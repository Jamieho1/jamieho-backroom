// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
const m=vi.hoisted(()=>({save:vi.fn(),start:vi.fn(),viewer:{status:'member',id:'member-id'}}));
vi.mock('@/app/actions/resume',()=>({saveResume:m.save,startResume:m.start}));vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer})}));vi.mock('@/components/sign-in-button',()=>({SignInButton:()=> <button>Sign in to build your own</button>}));
import {ResumeWorkspace} from '@/components/interview/resume-editor';
const template={key:'default' as const,title:'Synthetic guide',content:{entries:[]}};
const initial={content:{entries:[{id:'00000000-0000-4000-8000-000000000121',kind:'role' as const,title:'Synthetic private role',org:'',dates:'',location:'',summary:'',sort:0,bullets:[]}]},revision:1,updated_at:'2026-01-01'};
afterEach(()=>{cleanup();vi.clearAllMocks();m.viewer={status:'member',id:'member-id'};});
it('failed save retains edits and Retry saves the same document with its original revision',async()=>{
 m.save.mockResolvedValueOnce({ok:false,message:'Could not save. Your edits are still here.'}).mockImplementationOnce(async(content)=>({ok:true,resume:{content,revision:2,updated_at:'2026-01-02'}}));
 render(<ResumeWorkspace initial={initial} template={template} userId="member-id" configured/>);fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Changed synthetic role'}});fireEvent.submit(screen.getByRole('form',{name:'Your resume'}));await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('edits are still here'));expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Changed synthetic role');fireEvent.click(screen.getByRole('button',{name:'Retry save'}));await waitFor(()=>expect(screen.getByRole('status').textContent).toBe('Saved.'));expect(m.save).toHaveBeenLastCalledWith(expect.objectContaining({entries:expect.arrayContaining([expect.objectContaining({title:'Changed synthetic role'})])}),1);
});
it('account changes hide the old resume before any refreshed data arrives',()=>{
 const {rerender,container}=render(<ResumeWorkspace initial={initial} template={template} userId="member-id" configured/>);expect(screen.getByRole('form',{name:'Your resume'})).toBeTruthy();m.viewer={status:'member',id:'other-id'};rerender(<ResumeWorkspace initial={initial} template={template} userId="member-id" configured/>);expect(screen.queryByRole('form',{name:'Your resume'})).toBeNull();expect(container.textContent).not.toContain('Synthetic private role');
});
