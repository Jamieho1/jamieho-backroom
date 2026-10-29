"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { validateCard, type CardEdit } from "@/lib/projects";

export interface CardResult {
  ok: boolean;
  message: string;
}

/** Owner-only edit of a project card's words, tags and screenshots (visibility lives in Settings). */
export async function saveCard(id: string, card: CardEdit): Promise<CardResult> {
  const invalid = validateCard(card);
  if (invalid) return { ok: false, message: invalid };
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role !== "owner" || !sb) return { ok: false, message: "Only the owner can edit the site." };
  const { data, error } = await sb
    .from("apps")
    .update({ name: card.name.trim(), description: card.description.trim(), tags: card.tags, screenshots: card.screenshots })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { ok: false, message: "Couldn't save. Your changes are still here, try again." };
  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true, message: "Saved." };
}
