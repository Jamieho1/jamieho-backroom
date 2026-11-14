"use server";
import { cookies, draftMode } from "next/headers";
import { loadOwnerPreview, getHomePreview, PREVIEW_COOKIE } from "@/lib/content-drafts/preview";
import { approveContentChange, discardContentChange } from "./content-drafts";
import type { DraftResult } from "@/lib/content-drafts/types";

export async function startContentPreview(id: string, target: "/" | "/behavioral" = "/"): Promise<DraftResult> {
  try {
    const preview = await loadOwnerPreview(id);
    if (!preview) return { ok: false, message: "Preview unavailable. Sign in as the owner and choose a valid pending draft." };
    if (target !== "/" && (target !== "/behavioral" || !preview.experience)) return {ok:false,message:"This set has no CV preview."};
    const store = await cookies();
    store.set(PREVIEW_COOKIE, preview.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 3600 });
    (await draftMode()).enable();
    return { ok: true, message: "Preview ready." };
  } catch { return { ok: false, message: "Could not open preview. Try again." }; }
}

/** Anyone may clear their own preview cookies. This never reads or changes content. */
export async function exitContentPreview(): Promise<DraftResult> {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  return { ok: true, message: "Preview ended." };
}

async function reviewPreview(approve: boolean): Promise<DraftResult> {
  const preview = await getHomePreview();
  if (!preview) return { ok: false, message: "Preview unavailable. Return to the review list." };
  const result = await (approve ? approveContentChange(preview.id) : discardContentChange(preview.id));
  if (result.ok) {
    try { await exitContentPreview(); }
    catch { return { ...result, message: `${result.message} Preview could not close automatically; return to the review list.` }; }
  }
  return result;
}
export async function approvePreviewChange(): Promise<DraftResult> { return reviewPreview(true); }
export async function discardPreviewChange(): Promise<DraftResult> { return reviewPreview(false); }
