import { notFound } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { validateOperations } from "./allowlist";
import { reviewFields, type ContentChange, type ReviewDraft } from "./types";

/** Request-scoped only. Never read owner drafts through the public/cached content loader. */
export async function loadContentReview(): Promise<{ drafts: ReviewDraft[]; error?: string }> {
  const viewer = await getViewer();
  if (viewer.role !== "owner" || !viewer.id) notFound();
  const sb = await supabaseServer();
  if (!sb) notFound();
  const [sets, sections, items, bullets] = await Promise.all([
    sb.from("content_changes").select("id, summary, status, operations, photo_slots, created_at").eq("status", "draft").order("created_at", { ascending: false }),
    sb.from("site_sections").select("key, title, body"),
    sb.from("experience_items").select("*"),
    sb.from("experience_bullets").select("*"),
  ]);
  if (sets.error || sections.error || items.error || bullets.error) return { drafts: [], error: "Could not load content drafts and current live values. Try again." };
  const live = Object.fromEntries((sections.data ?? []).map(row => [row.key, { title: row.title ?? "", body: row.body ?? "" }]));
  const drafts = ((sets.data ?? []) as ContentChange[]).map(set => {
    const result = validateOperations(set.operations);
    const photos = !Array.isArray(set.photo_slots) || set.photo_slots.length !== 0;
    return { ...set, previewCv:result.ok && result.operations.some(op=>op.table!=="site_sections"), fields: result.ok ? reviewFields(result.operations, live, {experience_items:Object.fromEntries((items.data??[]).map(row=>[row.id,row])),experience_bullets:Object.fromEntries((bullets.data??[]).map(row=>[row.id,row]))}) : [],
      validationError: !result.ok ? result.message : photos ? "Photo slots are not supported in this slice." : undefined };
  });
  return { drafts };
}
