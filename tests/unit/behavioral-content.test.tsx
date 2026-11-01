// @vitest-environment jsdom
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import { render,screen,cleanup } from '@testing-library/react';
const m=vi.hoisted(()=>({server:vi.fn(),from:vi.fn(),allowed:vi.fn(),cv:vi.fn(),stories:vi.fn(),answers:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
vi.mock('@/components/behavioral/workspace',()=>({Behavioral:({items,initialStories,canEdit}:{items:unknown[];initialStories:unknown[];canEdit:boolean})=><div>{JSON.stringify({items,initialStories,canEdit})}</div>}));
import { BehavioralContent } from '@/app/desktop/behavioral-content';
beforeEach(()=>{vi.clearAllMocks();m.allowed.mockResolvedValue({data:{id:'behavioral'},error:null});m.cv.mockResolvedValue({data:[],error:null});m.stories.mockResolvedValue({data:[],error:null});m.answers.mockResolvedValue({data:[],error:null});m.from.mockImplementation(table=>table==='desktop_apps'?{select:()=>({eq:()=>({maybeSingle:m.allowed})})}:table==='behavioral_answers'?{select:()=>({order:m.answers})}:table==='experience_items'?{select:()=>({order:m.cv})}:{select:()=>({order:()=>({order:m.stories})})});m.server.mockResolvedValue({from:m.from});});afterEach(cleanup);
it('checks registry access before querying CV/stories, including otherwise public CV rows',async()=>{m.allowed.mockResolvedValue({data:null,error:null});render(await BehavioralContent());expect(screen.getByText("You don't have access to Behavioral.")).toBeTruthy();expect(m.from).toHaveBeenCalledTimes(1);});
it('renders successful empty reads and owner controls',async()=>{render(await BehavioralContent({canEdit:true}));expect(screen.queryByRole('alert')).toBeNull();expect(screen.getByText(/"canEdit":true/)).toBeTruthy();});
it('handles failed database reads as unavailable rather than an empty CV',async()=>{m.stories.mockResolvedValue({data:null,error:{message:'down'}});render(await BehavioralContent());expect(screen.getByRole('alert')).toBeTruthy();expect(screen.getByRole('link').getAttribute('href')).toBe('/behavioral');});
it('handles connection failures',async()=>{m.server.mockRejectedValue(new Error('offline'));render(await BehavioralContent());expect(screen.getByRole('alert')).toBeTruthy();});

it('reports unavailable when answer loading fails',async()=>{m.answers.mockResolvedValue({data:null,error:{message:'down'}});render(await BehavioralContent());expect(screen.getByRole('alert')).toBeTruthy();});
