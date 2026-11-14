import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import { supabaseServer } from "@/lib/supabase/server";
import { NotesReader } from "@/components/notes/reader";
import type { NoteRow } from "@/lib/notes";

/** The desktop verifies app access first; RLS independently gates every row here. */
export async function NotesContent({ canEdit = false }: { canEdit?: boolean } = {}) {
  try {
    const sb = await supabaseServer();
    if (!sb) throw new Error("unconfigured");
    const { data, error } = await sb.from("notes").select("id, title, body, free, visual, sort, updated_at").order("sort").order("id");
    if (error) throw new Error("unavailable");
    const candidate=await getHomePreview();const preview=candidate?.appData?.notes?candidate:null;
    return <><NotesReader key={preview?.id??"live"} notes={(preview?.appData?.notes??data??[]) as NoteRow[]} canEdit={preview?false:canEdit} /><PagePreview preview={preview} page="/notes"/></>;
  } catch {
    return <div className="desktop-placeholder"><p role="alert">Can&apos;t reach the data right now.</p><a href="/notes">Try again</a></div>;
  }
}
