import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),revalidate:vi.fn(),update:vi.fn(),eq:vi.fn(),select:vi.fn(),single:vi.fn()}));
vi.mock("@/lib/viewer",()=>({getViewer:mocks.viewer}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:mocks.server}));
vi.mock("next/cache",()=>({revalidatePath:mocks.revalidate}));
import { saveNote } from "@/app/actions/notes";
beforeEach(()=>{
 vi.clearAllMocks(); mocks.viewer.mockResolvedValue({role:"owner"});
 mocks.server.mockResolvedValue({from:()=>({update:mocks.update})});
 mocks.update.mockReturnValue({eq:mocks.eq}); mocks.eq.mockReturnValue({select:mocks.select}); mocks.select.mockReturnValue({maybeSingle:mocks.single});
 mocks.single.mockResolvedValue({data:{body:"new",free:"free",updated_at:"now"},error:null});
});
it("refuses anonymous and member calls before writing",async()=>{
 for(const role of ["anonymous","member"]){mocks.viewer.mockResolvedValue({role});expect((await saveNote("sample",{body:"new",free:"free"})).ok).toBe(false);}
 expect(mocks.update).not.toHaveBeenCalled();
});
it("updates only the existing note's text and timestamp",async()=>{
 expect((await saveNote("sample",{body:"new",free:"free"})).ok).toBe(true);
 expect(mocks.update).toHaveBeenCalledWith({body:"new",free:"free",updated_at:expect.any(String)});
 expect(mocks.eq).toHaveBeenCalledWith("id","sample");
 expect(mocks.revalidate).toHaveBeenCalledWith("/desktop");
});
it("reports denied, missing or failed saves instead of pretending they succeeded",async()=>{
 for(const outcome of [{data:null,error:null},{data:null,error:{message:"RLS"}}]){
  mocks.single.mockResolvedValue(outcome);
  const result=await saveNote("sample",{body:"new",free:"free"});
  expect(result.ok).toBe(false);
 }
 mocks.single.mockRejectedValue(new Error("offline"));
 expect((await saveNote("sample",{body:"new",free:"free"})).ok).toBe(false);
});
it("rejects bad input before attempting a database write",async()=>{
 expect((await saveNote("../bad",{body:"new",free:"free"})).ok).toBe(false);
 expect(mocks.update).not.toHaveBeenCalled();
});
