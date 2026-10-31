import { supabaseServer } from "@/lib/supabase/server";
import { NotesReader } from "@/components/notes/reader";
import type { NoteRow } from "@/lib/notes";

/** The desktop verifies app access first; RLS independently gates every row here. */
export async function NotesContent() {
  try {
    const sb = await supabaseServer();
    if (!sb) throw new Error("unconfigured");
    const { data, error } = await sb.from("notes").select("id, title, body, visual, sort, updated_at").order("sort").order("id");
    if (error) throw new Error("unavailable");
    return <NotesReader notes={(data ?? []) as NoteRow[]} />;
  } catch {
    return <div className="desktop-placeholder"><p role="alert">Can&apos;t reach the data right now.</p><a href="/desktop?app=notes">Try again</a></div>;
  }
}
