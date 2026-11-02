// @vitest-environment jsdom
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
const m=vi.hoisted(()=>({save:vi.fn(),remove:vi.fn(),move:vi.fn()}));
vi.mock('@/app/actions/experience',()=>({saveItem:m.save,deleteItem:m.remove,moveItem:m.move}));
import {Behavioral} from '@/components/behavioral/workspace';
import type {Item} from '@/lib/experience';
const item:Item={id:'example',kind:'role',title:'Example entry',org:'',dates:'',location:'',summary:'',public:false,bullets:[{id:'bullet',text:'Original bullet',public:false}]};
beforeEach(()=>{m.save.mockReset();m.remove.mockReset();m.move.mockReset()});afterEach(cleanup);
it('adds a private certificate with pasted lines, preserves failed draft and saves on retry',async()=>{
 m.save.mockResolvedValueOnce({ok:false,message:'Offline'}).mockImplementationOnce(async entry=>({ok:true,items:[{...entry,id:'new'}]}));
 render(<Behavioral items={[]} initialStories={[]} canEdit />);
 expect(screen.getByRole('heading',{name:'Resume & Stories'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Add certificate'}));
 expect((screen.getByRole('tab',{name:'Questions'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Example certificate'}});
 fireEvent.click(screen.getByRole('button',{name:'Add bullet'}));
 fireEvent.change(screen.getByLabelText('Bullet 1',{exact:true}),{target:{value:'A pasted line\nwith supporting detail'}});
 fireEvent.click(screen.getByRole('button',{name:'Save'}));await screen.findByText('Offline');
 expect((screen.getByLabelText('Bullet 1',{exact:true}) as HTMLTextAreaElement).value).toContain('with supporting detail');
 fireEvent.click(await screen.findByRole('button',{name:'Retry'}));await screen.findByRole('heading',{name:'Example certificate'});
 expect(m.save.mock.calls[1][0]).toMatchObject({kind:'certificate',public:false,bullets:[{text:'A pasted line\nwith supporting detail',public:false}]});
});
it('edits existing bullets without changing their IDs and removes an entry only after confirmation',async()=>{
 m.save.mockImplementation(async entry=>({ok:true,items:[entry]}));m.remove.mockResolvedValue({ok:true,items:[]});
 render(<Behavioral items={[item]} initialStories={[]} canEdit />);
 fireEvent.click(screen.getByRole('button',{name:'Edit Example entry'}));
 fireEvent.change(screen.getByLabelText('Bullet 1',{exact:true}),{target:{value:'Revised pasted line'}});
 fireEvent.click(screen.getByRole('button',{name:'Save'}));await screen.findByRole('button',{name:'Edit Example entry'});
 expect(m.save.mock.calls[0][0].bullets[0]).toMatchObject({id:'bullet',text:'Revised pasted line'});
 fireEvent.click(screen.getByRole('button',{name:'Edit Example entry'}));
 fireEvent.click(screen.getByRole('button',{name:'Delete'}));expect(m.remove).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Click again to delete'}));await screen.findByRole('button',{name:'Add experience'});
 expect(m.remove).toHaveBeenCalledWith('example');
 await waitFor(()=>expect(screen.queryByRole('heading',{name:'Example entry'})).toBeNull());
});
it('readers see separated sections without resume editing controls or an All stories sidebar',()=>{
 render(<Behavioral items={[item]} initialStories={[]} />);
 for(const name of ['Professional experience','Projects','Education','Certificates','Skills'])expect(screen.getByRole('region',{name})).toBeTruthy();
 expect(screen.queryByRole('button',{name:/Add experience|Edit Example entry|Delete/})).toBeNull();
 expect(screen.queryByRole('region',{name:'STAR stories'})).toBeNull();
});
