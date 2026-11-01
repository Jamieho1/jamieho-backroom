// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),order:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
vi.mock('@/components/desktop',()=>({Desktop:({content,initialApp}:{content:React.ReactNode;initialApp:string})=><div data-testid={initialApp}>{content}</div>}));
vi.mock('@/components/sign-in-button',()=>({SignInButton:({next}:{next:string})=><a href={next}>Sign in</a>}));
vi.mock('@/app/desktop/notes-content',()=>({NotesContent:({canEdit}:{canEdit:boolean})=><div>Notes editing: {String(canEdit)}</div>}));
vi.mock('@/app/desktop/behavioral-content',()=>({BehavioralContent:({canEdit}:{canEdit:boolean})=><div>Behavioral editing: {String(canEdit)}</div>}));
vi.mock('@/app/settings/content',()=>({SettingsContent:()=>null}));
vi.mock('@/components/practice/arena',()=>({PracticeArena:({initialProblem}:{initialProblem:number})=><div>Practice problem: {initialProblem}</div>}));
import {AppPage} from '@/app/desktop/app-page';
beforeEach(()=>{vi.clearAllMocks();m.viewer.mockResolvedValue({role:'member',id:'example'});m.order.mockResolvedValue({data:[],error:null});m.server.mockResolvedValue({from:()=>({select:()=>({order:()=>({order:m.order})})})});});afterEach(cleanup);
it('anonymous clean-route sign-in returns to that route, including the problem path',async()=>{
 m.viewer.mockResolvedValue({role:'anonymous'});
 for(const [app,problem,path] of [['notes',undefined,'/notes'],['practice','217','/practices/217'],['behavioral',undefined,'/behavioral']] as const){render(await AppPage({app,problem}));expect(screen.getByRole('link',{name:'Sign in'}).getAttribute('href')).toBe(path);cleanup();}
 expect(m.order).not.toHaveBeenCalled();
});
it('unpermitted apps never render protected content',async()=>{
 render(await AppPage({app:'notes'}));expect(screen.queryByText(/Notes editing/)).toBeNull();
});
it('permitted members get read-only Notes and canonical practice selection',async()=>{
 m.order.mockResolvedValue({data:[{id:'notes',kind:'internal'},{id:'practice',kind:'internal'}],error:null});render(await AppPage({app:'notes'}));expect(screen.getByText('Notes editing: false')).toBeTruthy();cleanup();render(await AppPage({app:'practice',problem:'217'}));expect(screen.getByText('Practice problem: 217')).toBeTruthy();
});
it('failed app reads provide a retry to the canonical route without rendering app data',async()=>{
 m.order.mockResolvedValue({data:null,error:{message:'unavailable'}});render(await AppPage({app:'behavioral'}));expect(screen.getByRole('alert')).toBeTruthy();expect(screen.getByRole('link',{name:'Try again'}).getAttribute('href')).toBe('/behavioral');
});
