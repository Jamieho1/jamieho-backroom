// @vitest-environment jsdom
import { afterEach,beforeEach,it,expect,vi } from 'vitest';
import { render as baseRender,screen,cleanup,waitFor } from '@testing-library/react';
const m=vi.hoisted(()=>({getApps:vi.fn(),log:vi.fn(),viewer:{status:'anonymous',name:undefined as string|undefined,id:undefined as string|undefined},configured:false,pathname:'/'}));
vi.mock('@/app/actions/desktop',()=>({getDesktopApps:m.getApps,logDesktopOpen:m.log}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer,configured:m.configured,editing:false,setEditing:vi.fn()})}));
vi.mock('next/link',()=>({default:({children,prefetch:_p,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('@/components/theme-toggle',()=>({ThemeToggle:()=>null}));
import { DesktopAppsProvider } from '@/components/desktop-apps-provider';
vi.mock('next/navigation',()=>({usePathname:()=>m.pathname}));
const render=(ui:React.ReactElement)=>baseRender(ui,{wrapper:DesktopAppsProvider});
import { Desktop } from '@/components/desktop';
import { FALLBACK_APPS } from '@/lib/projects';
beforeEach(()=>{vi.clearAllMocks();m.viewer={status:'anonymous',name:undefined,id:undefined};m.configured=false;m.pathname='/';m.getApps.mockResolvedValue([]);});afterEach(cleanup);
it('public Home opens without sign-in and is not recorded as a registry app launch',()=>{
 render(<Desktop apps={[]} initialApp="home" discoverApps content={<h1>Public landing</h1>} />);
 expect(screen.getByRole('region',{name:'About Me'})).toBeTruthy();expect(screen.getByRole('heading',{name:'Public landing'})).toBeTruthy();expect(screen.getAllByRole('link',{name:'Projects'}).every(a=>a.getAttribute('href')==='/projects')).toBe(true);expect(m.getApps).not.toHaveBeenCalled();expect(m.log).not.toHaveBeenCalled();
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

it('page remounts keep permitted icons visible while the new route revalidates them',async()=>{
 m.viewer={status:'member',name:'Example',id:'first'};m.getApps.mockResolvedValue([FALLBACK_APPS[0]]);
 const {rerender}=render(<Desktop key="home" apps={[]} initialApp="home" discoverApps content={<h1>Home content</h1>} />);
 await screen.findAllByRole('link',{name:'Notes'});
 let finish!:(apps:unknown[])=>void;m.getApps.mockReturnValue(new Promise(resolve=>{finish=resolve;}));m.pathname='/projects';
 rerender(<Desktop key="projects" apps={[]} initialApp="projects" discoverApps content={<h1>Project content</h1>} />);
 expect(screen.getAllByRole('link',{name:'Notes'})).toHaveLength(2);expect(screen.getByRole('heading',{name:'Project content'})).toBeTruthy();
 await waitFor(()=>expect(m.getApps).toHaveBeenCalledTimes(2));
 finish([]);await waitFor(()=>expect(screen.queryAllByRole('link',{name:'Notes'})).toHaveLength(0));
});

it('reveals all permitted icons together after discovery, including during initial viewer loading',async()=>{
 m.viewer={status:'loading',name:undefined,id:'first'};
 let finish!:(apps:unknown[])=>void; m.getApps.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 const {rerender}=render(<Desktop apps={[]} initialApp="home" discoverApps content={<h1>Public landing</h1>} />);
 expect(screen.getByRole('heading',{name:'Public landing'})).toBeTruthy();
 expect(screen.queryAllByRole('link',{name:'Projects'})).toHaveLength(0);
 expect(screen.queryAllByRole('link',{name:'Notes'})).toHaveLength(0);
 expect(screen.getByRole('navigation',{name:'Desktop apps'}).getAttribute('aria-busy')).toBe('true');
 await waitFor(()=>expect(m.getApps).toHaveBeenCalledTimes(1));
 m.viewer={status:'member',name:'Example',id:'first'};
 rerender(<Desktop apps={[]} initialApp="home" discoverApps content={<h1>Public landing</h1>} />);
 expect(m.getApps).toHaveBeenCalledTimes(1);
 finish([FALLBACK_APPS[0]]);
 await screen.findAllByRole('link',{name:'Notes'});
 expect(screen.getAllByRole('link',{name:'Projects'})).toHaveLength(2);
 expect(screen.getByRole('navigation',{name:'Desktop apps'}).getAttribute('aria-busy')).toBe('false');
});
it('places Settings on the right rail and in the session menu',async()=>{
 m.viewer={status:'owner',name:'Example',id:'first'};
 m.getApps.mockResolvedValue([{...FALLBACK_APPS[0],id:'settings',name:'Settings',icon:'gear',url:'/settings'}]);
 render(<Desktop apps={[]} initialApp="home" discoverApps />);
 const links=await screen.findAllByRole('link',{name:'Settings'});
 expect(links).toHaveLength(2);
 expect(links.some(link=>link.closest('.desktop-launcher-right'))).toBe(true);
 expect(links.some(link=>link.closest('.desktop-session'))).toBe(true);
});

it('closed desktop windows leave only wallpaper and app chrome',()=>{
 render(<Desktop apps={[]} />);
 expect(screen.queryByText('Your desktop')).toBeNull();
 expect(screen.queryByText('Choose an app to get started.')).toBeNull();
 expect(document.querySelector('.desktop-welcome')).toBeNull();
 expect(screen.getAllByRole('link',{name:'About Me'})).toHaveLength(2);
});
