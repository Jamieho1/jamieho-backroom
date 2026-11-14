"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { affectedRoutes, validateOperations } from "@/lib/content-drafts/allowlist";
import {loadPublishingPreview} from "@/lib/content-drafts/publishing-overlay";
import type { ContentChange, DraftResult } from "@/lib/content-drafts/types";

const idSchema = z.uuid();
const denied = (): DraftResult => ({ ok: false, message: "Only the owner can review content drafts." });

/** One authenticated UPDATE invokes private.apply_content_change; no public RPC or service key. */
export async function approveContentChange(id: string): Promise<DraftResult> {
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid change set ID." };
  try {
    const viewer = await getViewer();
    if (viewer.role !== "owner" || !viewer.id) return denied();
    const sb = await supabaseServer();
    if (!sb) return { ok: false, message: "Content drafts are not configured." };
    const loaded = await sb.from("content_changes").select("id, summary, status, operations, photo_slots, created_at").eq("id", id).maybeSingle();
    if (loaded.error) return { ok: false, message: "Could not load this change set. Try again." };
    const set = loaded.data as ContentChange | null;
    if (!set || set.status !== "draft") return { ok: false, message: "This change set is missing or already reviewed." };
    const result = validateOperations(set.operations);
    if (!result.ok) return result;
    if (!Array.isArray(set.photo_slots) || set.photo_slots.length !== 0) return { ok: false, message: "Photo slots are not supported in this slice." };
    try { await loadPublishingPreview(sb,result.operations); } catch(error) {return {ok:false,message:error instanceof Error?error.message:"Invalid publishing draft."};}
    // Re-check the verified session immediately before the mutation; SQL independently checks ownership.
    const current = await getViewer();
    if (current.role !== "owner" || current.id !== viewer.id) return denied();
    const saved = await sb.from("content_changes").update({ status: "approved" }).eq("id", id).eq("status", "draft")
      .filter("operations", "eq", JSON.stringify(set.operations)).select("id,previous");
    if (saved.error) return { ok: false, message: saved.error.code === "22023" || saved.error.code === "42501"
      ? saved.error.message : "Approval failed. No content changes were applied. Try again." };
    if (!saved.data?.length) return { ok: false, message: "This draft changed or was already reviewed. Reload the review list." };
    // The database has committed. A cache failure must never be reported as a content rollback.
    try {
      for (const route of affectedRoutes(result.operations,saved.data[0].previous)) revalidatePath(route);
      revalidatePath("/manage/review");
    } catch {
      return { ok: true, applied: true, message: "Approved and saved, but page refresh failed. Do not approve again; ask for a cache refresh." };
    }
    return { ok: true, applied: true, message: "Approved. The live content is updated." };
  } catch {
    return { ok: false, message: "Could not complete approval. Reload to check the set’s status before retrying." };
  }
}

export async function discardContentChange(id: string): Promise<DraftResult> {
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid change set ID." };
  try {
    const viewer = await getViewer();
    if (viewer.role !== "owner" || !viewer.id) return denied();
    const sb = await supabaseServer();
    if (!sb) return { ok: false, message: "Content drafts are not configured." };
    const { data, error } = await sb.from("content_changes").update({ status: "discarded" }).eq("id", id).eq("status", "draft").select("id");
    if (error) return { ok: false, message: "Could not discard this draft. Try again." };
    if (!data?.length) return { ok: false, message: "This change set is missing or already reviewed." };
    try { revalidatePath("/manage/review"); } catch { /* Discard already committed; router refresh can reload the list. */ }
    return { ok: true, message: "Discarded. Live content was not changed." };
  } catch {
    return { ok: false, message: "Could not complete discard. Reload to check the set’s status." };
  }
}
