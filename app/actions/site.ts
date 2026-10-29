"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { isSectionKey, MAX_BODY, MAX_TITLE } from "@/lib/sections";

export interface SaveResult {
  ok: boolean;
  message: string;
}

/** Owner-only. The database refuses anyone else as well (RLS); this check only fails early. */
export async function saveSection(key: string, title: string, body: string): Promise<SaveResult> {
  if (!isSectionKey(key)) return { ok: false, message: "Unknown section." };
  if (title.length > MAX_TITLE || body.length > MAX_BODY) return { ok: false, message: "That's too long to save." };
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role !== "owner" || !sb) return { ok: false, message: "Only the owner can edit the site." };
  const { data, error } = await sb.from("site_sections").update({ title, body }).eq("key", key).select("key");
  if (error || !data?.length) return { ok: false, message: "Couldn't save. Your text is still here, try again." };
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}
