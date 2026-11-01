// @vitest-environment jsdom
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import { render,screen,cleanup,act,fireEvent } from '@testing-library/react';
const m=vi.hoisted(()=>({getUser:vi.fn(),profile:vi.fn(),unsubscribe:vi.fn(),refresh:vi.fn(),callback:undefined as undefined|((event:string,session?:{user:{id:string}})=>void)}));
vi.mock('@/lib/supabase/browser',()=>({
 supabaseBrowser:()=>({
  auth:{getUser:m.getUser,onAuthStateChange:(cb:typeof m.callback)=>{m.callback=cb;return {data:{subscription:{unsubscribe:m.unsubscribe}}};}},
  from:()=>({select:()=>({eq:()=>({maybeSingle:m.profile})})}),
 }),
}));
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:m.refresh})}));
import { ViewerProvider,useViewer } from '@/components/viewer-provider';
function Probe(){const {viewer,editing,setEditing}=useViewer();return <><output>{viewer.status}:{viewer.id??''}:{String(editing)}</output><button onClick={()=>setEditing(true)}>Edit</button></>;}
const user=(id:string)=>({data:{user:{id,email:'example@example.com'}}});
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','test-public-placeholder');m.getUser.mockResolvedValue(user('owner'));m.profile.mockResolvedValue({data:{role:'owner',full_name:'Example'}});});
afterEach(()=>{cleanup();vi.unstubAllEnvs();});
it('a late owner profile cannot restore owner controls after sign-out',async()=>{
 let finish!:(v:unknown)=>void;m.profile.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 render(<ViewerProvider><Probe /></ViewerProvider>);await act(async()=>{});
 act(()=>m.callback?.('SIGNED_OUT'));expect(m.refresh).toHaveBeenCalledTimes(1);expect(screen.getByText('anonymous::false')).toBeTruthy();
 await act(async()=>{finish({data:{role:'owner',full_name:'Example'}});});expect(screen.getByText('anonymous::false')).toBeTruthy();
});
it('account switches clear edit mode and ignore the older profile response even with identical names',async()=>{
 render(<ViewerProvider><Probe /></ViewerProvider>);await screen.findByText('owner:owner:false');fireEvent.click(screen.getByRole('button',{name:'Edit'}));expect(screen.getByText('owner:owner:true')).toBeTruthy();
 let finish!:(v:unknown)=>void;m.profile.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
 act(()=>m.callback?.('TOKEN_REFRESHED',{user:{id:'owner'}}));await act(async()=>{});
 m.getUser.mockResolvedValue(user('member'));m.profile.mockResolvedValue({data:{role:'member',full_name:'Example'}});
 act(()=>m.callback?.('SIGNED_IN',{user:{id:'member'}}));await screen.findByText('member:member:false');expect(m.refresh).toHaveBeenCalledTimes(1);
 await act(async()=>{finish({data:{role:'owner',full_name:'Example'}});});expect(screen.getByText('member:member:false')).toBeTruthy();
});
it('network exceptions do not leave stale editing controls or unhandled rejections',async()=>{
 m.getUser.mockRejectedValue(new Error('offline'));render(<ViewerProvider><Probe /></ViewerProvider>);await screen.findByText('anonymous::false');
});
