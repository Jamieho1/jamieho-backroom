// @vitest-environment jsdom
import { afterEach,beforeEach,it,expect,vi } from 'vitest';
import { render,screen,cleanup,waitFor } from '@testing-library/react';
const m=vi.hoisted(()=>({getApps:vi.fn(),log:vi.fn(),viewer:{status:'anonymous',name:undefined as string|undefined,id:undefined as string|undefined},configured:false}));
vi.mock('@/app/actions/desktop',()=>({getDesktopApps:m.getApps,logDesktopOpen:m.log}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer,configured:m.configured,editing:false,setEditing:vi.fn()})}));
vi.mock('next/link',()=>({default:({children,prefetch:_p,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('@/components/theme-toggle',()=>({ThemeToggle:()=>null}));
import { Desktop } from '@/components/desktop';
import { FALLBACK_APPS } from '@/lib/projects';
beforeEach(()=>{vi.clearAllMocks();m.viewer={status:'anonymous',name:undefined,id:undefined};m.configured=false;m.getApps.mockResolvedValue([]);});afterEach(cleanup);
it('public Home opens without sign-in and is not recorded as a registry app launch',()=>{
 render(<Desktop apps={[]} initialApp="home" discoverApps content={<h1>Public landing</h1>} />);
 expect(screen.getByRole('region',{name:'Home'})).toBeTruthy();expect(screen.getByRole('heading',{name:'Public landing'})).toBeTruthy();expect(screen.getAllByRole('link',{name:'Projects'}).every(a=>a.getAttribute('href')==='/projects')).toBe(true);expect(m.getApps).not.toHaveBeenCalled();expect(m.log).not.toHaveBeenCalled();
});
it('signed-in public navigation displays only the server-filtered registry apps',async()=>{
 m.viewer={status:'member',name:'Example',id:'first'};m.getApps.mockResolvedValue([FALLBACK_APPS[0]]);
 render(<Desktop apps={[]} initialApp="projects" discoverApps content={<h1>Public projects</h1>} />);
 await screen.findAllByRole('link',{name:FALLBACK_APPS[0].name});
 expect(m.getApps).toHaveBeenCalledTimes(1);expect(screen.queryAllByRole('link',{name:'Behavioral'})).toHaveLength(0);expect(m.log).not.toHaveBeenCalled();
});
it('logout clears discovered app icons',async()=>{
 m.viewer={status:'member',name:'Example',id:'first'};m.getApps.mockResolvedValue([FALLBACK_APPS[0]]);
 const {rerender}=render(<Desktop apps={[]} initialApp="home" discoverApps />);
 await waitFor(()=>expect(screen.getAllByRole('link',{name:FALLBACK_APPS[0].name}).length).toBe(2));
 m.viewer={status:'anonymous',name:undefined,id:undefined};rerender(<Desktop apps={[]} initialApp="home" discoverApps />);
 await waitFor(()=>expect(screen.queryAllByRole('link',{name:FALLBACK_APPS[0].name})).toHaveLength(0));
});
it('failed app discovery leaves the public window available and never guesses private icons',async()=>{
 m.viewer={status:'member',name:'Example',id:'first'};m.getApps.mockRejectedValue(new Error('offline'));
 render(<Desktop apps={[]} initialApp="home" discoverApps content={<h1>Public landing</h1>} />);
 await screen.findByRole('status');expect(screen.getByRole('heading',{name:'Public landing'})).toBeTruthy();expect(screen.queryAllByRole('link',{name:'Behavioral'})).toHaveLength(0);
});

it('same-name account switches reload the allowed icons for the new user ID',async()=>{
 m.viewer={status:'member',name:'Example',id:'first'};m.getApps.mockResolvedValue([FALLBACK_APPS[0]]);
 const {rerender}=render(<Desktop apps={[]} initialApp="home" discoverApps />);
 await screen.findAllByRole('link',{name:FALLBACK_APPS[0].name});
 m.viewer={status:'member',name:'Example',id:'second'};m.getApps.mockResolvedValue([FALLBACK_APPS[1]]);
 rerender(<Desktop apps={[]} initialApp="home" discoverApps />);
 await screen.findAllByRole('link',{name:FALLBACK_APPS[1].name});
 expect(screen.queryAllByRole('link',{name:FALLBACK_APPS[0].name})).toHaveLength(0);expect(m.getApps).toHaveBeenCalledTimes(2);
});
