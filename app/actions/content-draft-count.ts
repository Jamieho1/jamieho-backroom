"use server";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";

/** Request-scoped count only; no draft content is sent to navigation clients. RLS checks ownership too. */
export async function getContentDraftCount(): Promise<number | null> {
  try {
    const viewer = await getViewer();
    if (viewer.role !== "owner" || !viewer.id) return null;
    const sb = await supabaseServer();
    if (!sb) return null;
    const { count, error } = await sb.from("content_changes").select("id", { count: "exact", head: true }).eq("status", "draft");
    return !error && Number.isSafeInteger(count) && count! >= 0 ? count : null;
  } catch { return null; }
}
