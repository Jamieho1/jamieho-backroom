// @vitest-environment jsdom
import {afterEach,it,expect,vi} from 'vitest';
import {renderToString} from 'react-dom/server';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
const actions=vi.hoisted(()=>({approve:vi.fn(),discard:vi.fn(),exit:vi.fn()}));
vi.mock('@/app/actions/content-preview',()=>({approvePreviewChange:actions.approve,discardPreviewChange:actions.discard,exitContentPreview:actions.exit}));
import {ContentPreviewBar} from '@/components/content-drafts/preview-bar';
afterEach(()=>{cleanup();vi.resetAllMocks();});
it('server-rendered controls cannot accept clicks before their handlers hydrate',()=>{
 const html=renderToString(<ContentPreviewBar summary="Review CV" page="/behavioral" experience/>);
 const doc=new DOMParser().parseFromString(html,'text/html');expect([...doc.querySelectorAll('button')].every(button=>button.disabled)).toBe(true);
 expect(doc.querySelector('a')?.getAttribute('href')).toBe('/');
});
it('a failed CV approval stays in preview and displays the engine explanation',async()=>{
 actions.approve.mockResolvedValue({ok:false,message:'Bullet parent item does not exist.'});
 render(<ContentPreviewBar summary="Review CV" page="/behavioral" experience/>);
 const approve=screen.getByRole('button',{name:'Approve'});await waitFor(()=>expect((approve as HTMLButtonElement).disabled).toBe(false));fireEvent.click(approve);
 await waitFor(()=>expect(screen.getByRole('alert').textContent).toBe('Bullet parent item does not exist.'));
 expect(actions.approve).toHaveBeenCalledOnce();expect(actions.discard).not.toHaveBeenCalled();expect(screen.getByRole('link',{name:'Preview homepage'}).getAttribute('href')).toBe('/');
});
