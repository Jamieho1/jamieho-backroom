// @vitest-environment jsdom
import { afterEach,beforeEach,it,expect,vi } from 'vitest';
import { render as baseRender,screen,cleanup,waitFor } from '@testing-library/react';
const m=vi.hoisted(()=>({getApps:vi.fn(),viewer:{status:'anonymous',name:undefined as string|undefined,id:undefined as string|undefined},configured:false,pathname:'/resources'}));
vi.mock('@/app/actions/desktop',()=>({getDesktopApps:m.getApps}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer,configured:m.configured,editing:false,setEditing:vi.fn()})}));
vi.mock('next/link',()=>({default:({children,prefetch:_p,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('next/navigation',()=>({usePathname:()=>m.pathname}));
import { DesktopAppsProvider } from '@/components/desktop-apps-provider';
import { ResourceCatalog } from '@/components/resource-catalog';
import { FALLBACK_APPS } from '@/lib/projects';
const render=(ui:React.ReactElement)=>baseRender(ui,{wrapper:DesktopAppsProvider});
beforeEach(()=>{vi.clearAllMocks();m.viewer={status:'anonymous',name:undefined,id:undefined};m.getApps.mockResolvedValue([]);});
afterEach(cleanup);
it('shows only generic blurred resource previews before sign-in',()=>{
 render(<ResourceCatalog/>);
 expect(screen.getAllByText('Sign in to unlock')).toHaveLength(3);
 expect(screen.queryByRole('link',{name:'Open Notes'})).toBeNull();
 expect(document.querySelectorAll('.resource-card.is-locked')).toHaveLength(3);
 expect(m.getApps).not.toHaveBeenCalled();
});
it('opens only the resources returned by the server permission filter',async()=>{
 m.viewer={status:'member',name:'Example',id:'first'};m.getApps.mockResolvedValue([FALLBACK_APPS[0]]);
 render(<ResourceCatalog/>);
 expect((await screen.findByRole('link',{name:'Open Notes'})).getAttribute('href')).toBe('/notes');
 expect(screen.queryByRole('link',{name:'Open Practice'})).toBeNull();
 expect(screen.queryByRole('link',{name:'Open Resume & Stories'})).toBeNull();
 expect(screen.getAllByText('Membership access required')).toHaveLength(2);
});
it('locks resources immediately after logout',async()=>{
 m.viewer={status:'member',name:'Example',id:'first'};m.getApps.mockResolvedValue([FALLBACK_APPS[0]]);
 const {rerender}=render(<ResourceCatalog/>);await screen.findByRole('link',{name:'Open Notes'});
 m.viewer={status:'anonymous',name:undefined,id:undefined};rerender(<ResourceCatalog/>);
 expect(screen.queryByRole('link',{name:'Open Notes'})).toBeNull();expect(screen.getAllByText('Sign in to unlock')).toHaveLength(3);
});
it('does not expose the previous account’s unlocks while the next account loads',async()=>{
 m.viewer={status:'member',name:'First',id:'first'};m.getApps.mockResolvedValueOnce([FALLBACK_APPS[0]]);
 const {rerender}=render(<ResourceCatalog/>);await screen.findByRole('link',{name:'Open Notes'});
 let finish!:(apps:unknown[])=>void;m.getApps.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve}));
 m.viewer={status:'member',name:'Second',id:'second'};rerender(<ResourceCatalog/>);
 expect(screen.queryByRole('link',{name:'Open Notes'})).toBeNull();
 await waitFor(()=>expect(m.getApps).toHaveBeenCalledTimes(2));finish([FALLBACK_APPS[1]]);
 await screen.findByRole('link',{name:'Open Practice'});expect(screen.queryByRole('link',{name:'Open Notes'})).toBeNull();
});
it('keeps owner administration accessible from Resources',async()=>{
 m.viewer={status:'owner',name:'Owner',id:'owner'};render(<ResourceCatalog/>);
 await screen.findByRole('link',{name:'Settings'});expect(screen.getByRole('button',{name:'Edit site'})).toBeTruthy();
});
