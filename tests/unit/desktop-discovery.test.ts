import { beforeEach,it,expect,vi } from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),order:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import { getDesktopApps } from '@/app/actions/desktop';
beforeEach(()=>{vi.clearAllMocks();m.viewer.mockResolvedValue({role:'member'});m.order.mockResolvedValue({data:[{id:'notes'}],error:null});m.server.mockResolvedValue({from:()=>({select:()=>({order:()=>({order:m.order})})})});});
it('anonymous navigation never reads the registry view',async()=>{m.viewer.mockResolvedValue({role:'anonymous'});expect(await getDesktopApps()).toEqual([]);expect(m.server).not.toHaveBeenCalled();});
it('returns the RLS-filtered view rows and surfaces read failures',async()=>{expect(await getDesktopApps()).toEqual([{id:'notes'}]);m.order.mockResolvedValue({data:null,error:{message:'down'}});await expect(getDesktopApps()).rejects.toThrow('unavailable');});
