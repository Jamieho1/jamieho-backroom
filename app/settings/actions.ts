"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { isVisibility, normaliseEmail } from "@/lib/apps";

export interface ActionResult {
  ok: boolean;
  message: string;
}

async function ownerClient() {
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role !== "owner" || !sb) return null; // the database refuses non-owners too; this just fails early
  return sb;
}

export async function setVisibility(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const sb = await ownerClient();
  if (!sb) return { ok: false, message: "Only the owner can change this." };
  const id = String(form.get("id") ?? "");
  const visibility = form.get("visibility");
  if (!isVisibility(visibility)) return { ok: false, message: "Unknown visibility." };
  const { data, error } = await sb.from("apps").update({ visibility }).eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, message: error?.message.includes("fixed") ? "This app's visibility is fixed." : "Couldn't save. Try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}

export async function addInvite(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const sb = await ownerClient();
  if (!sb) return { ok: false, message: "Only the owner can change this." };
  const email = normaliseEmail(String(form.get("email") ?? ""));
  if (!email) return { ok: false, message: "That doesn't look like an email address." };
  const note = String(form.get("note") ?? "").slice(0, 200);
  const { error } = await sb.from("invites").upsert({ email, note }, { onConflict: "email" });
  if (error) return { ok: false, message: "Couldn't save. Try again." };
  revalidatePath("/settings");
  return { ok: true, message: `Invited ${email}.` };
}

export async function removeInvite(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const sb = await ownerClient();
  if (!sb) return { ok: false, message: "Only the owner can change this." };
  const email = String(form.get("email") ?? "");
  const { error } = await sb.from("invites").delete().eq("email", email);
  if (error) return { ok: false, message: "Couldn't remove. Try again." };
  revalidatePath("/settings");
  return { ok: true, message: `Removed ${email}.` };
}

export async function setMessageRead(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const sb = await ownerClient();
  if (!sb) return { ok: false, message: "Only the owner can change this." };
  const read = form.get("read") === "true";
  const { data, error } = await sb.from("messages").update({ read }).eq("id", String(form.get("id") ?? "")).select("id");
  if (error || !data?.length) return { ok: false, message: "Couldn't update. Try again." };
  revalidatePath("/settings");
  return { ok: true, message: read ? "Marked read." : "Marked unread." };
}

export async function deleteMessage(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const sb = await ownerClient();
  if (!sb) return { ok: false, message: "Only the owner can change this." };
  const { data, error } = await sb.from("messages").delete().eq("id", String(form.get("id") ?? "")).select("id");
  if (error || !data?.length) return { ok: false, message: "Couldn't delete. Try again." };
  revalidatePath("/settings");
  return { ok: true, message: "Deleted." };
}
