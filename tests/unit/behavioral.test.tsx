// @vitest-environment jsdom
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import { render,screen,fireEvent,cleanup,waitFor } from '@testing-library/react';
const save=vi.hoisted(()=>vi.fn());vi.mock('@/app/actions/behavioral',()=>({saveStory:save,saveAnswer:vi.fn()}));
vi.mock('@/app/actions/experience',()=>({saveItem:vi.fn(),deleteItem:vi.fn(),moveItem:vi.fn()}));
import { Behavioral } from '@/components/behavioral/workspace';
import type { Item } from '@/lib/experience';
import type { Story } from '@/lib/behavioral';
const bullet='00000000-0000-4000-8000-000000000001';
const items:Item[]=[{id:'role',kind:'role',title:'Example role',org:'Example org',dates:'',location:'',summary:'',public:false,bullets:[{id:bullet,text:'Example bullet',public:false}]}];
const story:Story={id:'00000000-0000-4000-8000-000000000002',bullet_id:bullet,title:'Example story',situation:'Context',task:'Goal',action:'Steps',result:'Outcome',skills:'Ownership',numbers:'Two improvements',updated_at:'2026-11-01T00:00:00Z'};
beforeEach(()=>{save.mockReset();save.mockImplementation(async s=>({ok:true,story:{...s,updated_at:'now'}}));});afterEach(cleanup);
it('shows hidden CV bullets and story badges; viewers read but cannot edit',()=>{
 render(<Behavioral items={items} initialStories={[story]} />);
 fireEvent.click(screen.getByRole('button',{name:'1 story for Example bullet'}));
 expect(screen.getByRole('article',{name:'Selected STAR story'}).textContent).toContain('Two improvements');
 expect(screen.queryByRole('button',{name:'Add story'})).toBeNull();expect(screen.queryByRole('button',{name:'Edit story'})).toBeNull();expect(save).not.toHaveBeenCalled();
});
it('owner creates a linked story; failed retry keeps every field and stable ID',async()=>{
 save.mockRejectedValueOnce(new Error('offline'));
 render(<Behavioral items={items} initialStories={[]} canEdit />);
 fireEvent.click(screen.getByRole('button',{name:'0 stories for Example bullet'}));
 fireEvent.click(screen.getByRole('button',{name:'Add story'}));
 fireEvent.change(screen.getByLabelText('Title'),{target:{value:'New example'}});
 fireEvent.change(screen.getByLabelText('Situation'),{target:{value:'Draft context'}});
 fireEvent.change(screen.getByLabelText('Numbers'),{target:{value:'Three changes'}});
 fireEvent.click(screen.getByRole('button',{name:'Save story'}));await screen.findByRole('button',{name:'Retry'});
 expect((screen.getByLabelText('Situation') as HTMLTextAreaElement).value).toBe('Draft context');
 expect((screen.getByRole('button',{name:'0 stories for Example bullet'}) as HTMLButtonElement).disabled).toBe(true);
 const first=save.mock.calls[0][0];expect(first.bullet_id).toBe(bullet);
 fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByRole('article',{name:'Selected STAR story'});
 expect(save.mock.calls[1][0]).toEqual(first);expect(screen.getByRole('button',{name:'1 story for Example bullet'})).toBeTruthy();
});
it('owner edits and unlinks; a rejected save keeps its draft; cancel discards',async()=>{
 save.mockResolvedValueOnce({ok:false,message:'Offline'});
 render(<Behavioral items={items} initialStories={[story]} canEdit />);
 fireEvent.click(screen.getByRole('button',{name:'1 story for Example bullet'}));fireEvent.click(screen.getByRole('button',{name:'Edit story'}));
 fireEvent.change(screen.getByLabelText('Result'),{target:{value:'New outcome'}});fireEvent.change(screen.getByLabelText('Linked CV bullet'),{target:{value:''}});
 fireEvent.click(screen.getByRole('button',{name:'Save story'}));await screen.findByText('Offline');
 fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByRole('article',{name:'Selected STAR story'});
 expect(save.mock.calls[1][0]).toMatchObject({id:story.id,bullet_id:null,result:'New outcome'});
 expect(screen.getByRole('button',{name:'0 stories for Example bullet'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Edit story'}));fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Discard'}});fireEvent.click(screen.getByRole('button',{name:'Cancel'}));
 await waitFor(()=>expect(screen.queryByRole('form')).toBeNull());expect(screen.queryByText('Discard')).toBeNull();
});
it('empty views explain missing experience/stories without exposing an editor to readers',()=>{
 render(<Behavioral items={[]} initialStories={[]} />);expect(screen.getAllByText('No entries yet.')).toHaveLength(5);expect(screen.queryByRole('region',{name:'STAR stories'})).toBeNull();
});
