import { cookies, draftMode } from "next/headers";
import { z } from "zod";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { SELECT, type ExperienceRow } from "@/lib/experience";
import { overlayExperience } from "./experience-overlay";
import { validateOperations } from "./allowlist";
import {loadPublishingPreview,publishingTargets} from "./publishing-overlay";
import type { HomePreview } from "./types";

export const PREVIEW_COOKIE = "jb.content-preview";

/** Query drafts only after a verified owner session; neither a URL nor a cookie grants permission. */
export async function loadOwnerPreview(id: string): Promise<HomePreview | null> {
  const viewer = await getViewer();
  if (viewer.role !== "owner" || !viewer.id || !z.uuid().safeParse(id).success) return null;
  const sb = await supabaseServer();
  if (!sb) return null;
  const { data, error } = await sb.from("content_changes").select("id, summary, status, operations, photo_slots, created_at")
    .eq("id", id).eq("status", "draft").maybeSingle();
  if (error || !data || data.status !== "draft" || !Array.isArray(data.photo_slots) || data.photo_slots.length !== 0) return null;
  const result = validateOperations(data.operations);
  if (!result.ok) return null;
  let experience:ExperienceRow[]|undefined;
  if (result.operations.some(op=>op.table==="experience_items"||op.table==="experience_bullets")) {
    const rows=await sb.from("experience_items").select(SELECT).order("sort");
    if(rows.error)return null;
    try {experience=overlayExperience((rows.data??[]) as ExperienceRow[],result.operations);} catch {return null;}
  }
  let publishing;
  try {publishing=await loadPublishingPreview(sb,result.operations);} catch {return null;}
  return { ...(Object.keys(publishing).length?{publishing,targets:publishingTargets(result.operations)}:{}), id: data.id, summary: data.summary, operations: result.operations, ...(experience ? {experience} : {}) };
}

/** Draft Mode is false at prerender time. Only its enabled branch reads request cookies/auth. */
export async function getHomePreview(): Promise<HomePreview | null> {
  if (!(await draftMode()).isEnabled) return null;
  const id = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!id) return null;
  return loadOwnerPreview(id);
}
