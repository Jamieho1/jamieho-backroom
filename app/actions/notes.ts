"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { validateNoteEdit, type NoteEdit } from "@/lib/notes";

export type NoteSaveResult =
  | { ok: true; body: string; free: string; updated_at: string }
  | { ok: false; message: string };

/** Only edit text on an existing note; visual JSON and all other metadata stay intact. */
export async function saveNote(id: string, edit: NoteEdit): Promise<NoteSaveResult> {
  const invalid = validateNoteEdit(id, edit);
  if (invalid) return { ok: false, message: invalid };
  try {
    const viewer = await getViewer();
    if (viewer.role !== "owner") return { ok: false, message: "Only the owner can edit notes." };
    const sb = await supabaseServer();
    if (!sb) throw new Error("unconfigured");
    const { data, error } = await sb.from("notes")
      .update({ body: edit.body, free: edit.free, updated_at: new Date().toISOString() })
      .eq("id", id).select("body, free, updated_at").maybeSingle();
    if (error || !data) throw new Error("save failed");
    revalidatePath("/desktop");
    return { ok: true, body: data.body, free: data.free, updated_at: data.updated_at };
  } catch {
    return { ok: false, message: "Couldn't save. Your draft is still here — retry." };
  }
}
