"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { fromRows, SELECT, validateItem, type Item } from "@/lib/experience";

export interface ExpResult {
  ok: boolean;
  message: string;
  items?: Item[];
}

async function owner() {
  const viewer = await getViewer();
  const sb = await supabaseServer();
  return viewer.role === "owner" && sb ? sb : null; // the database refuses everyone else too (RLS)
}
const FAIL = "Couldn't save. Your changes are still here, try again.";

async function all(sb: NonNullable<Awaited<ReturnType<typeof owner>>>): Promise<Item[]> {
  const { data } = await sb.from("experience_items").select(SELECT).order("sort");
  return fromRows((data ?? []) as never);
}

/** Save one item and its bullets (in the order given). Bullets missing from the list are deleted. */
export async function saveItem(item: Item): Promise<ExpResult> {
  const sb = await owner();
  if (!sb) return { ok: false, message: "Only the owner can edit the site." };
  const invalid = validateItem(item);
  if (invalid) return { ok: false, message: invalid };
  const fields = { kind: item.kind, title: item.title.trim(), org: item.org.trim(), dates: item.dates.trim(), location: item.location.trim(), summary: item.summary.trim(), public: item.public };

  let id = item.id;
  if (id) {
    const { error } = await sb.from("experience_items").update(fields).eq("id", id);
    if (error) return { ok: false, message: FAIL };
  } else {
    const { data: last } = await sb.from("experience_items").select("sort").order("sort", { ascending: false }).limit(1);
    const { data, error } = await sb.from("experience_items").insert({ ...fields, sort: (last?.[0]?.sort ?? 0) + 10 }).select("id").single();
    if (error || !data) return { ok: false, message: FAIL };
    id = data.id;
  }

  const keep = item.bullets.filter((b) => b.text.trim());
  const existing = keep.filter((b) => b.id).map((b) => b.id!);
  const del = sb.from("experience_bullets").delete().eq("item_id", id);
  const { error: delError } = existing.length ? await del.not("id", "in", `(${existing.join(",")})`) : await del;
  if (delError) return { ok: false, message: FAIL };
  for (const [i, b] of keep.entries()) {
    const row = { item_id: id, text: b.text.trim(), public: b.public, sort: (i + 1) * 10 };
    const { error } = b.id ? await sb.from("experience_bullets").update(row).eq("id", b.id) : await sb.from("experience_bullets").insert(row);
    if (error) return { ok: false, message: FAIL };
  }

  revalidatePath("/");
  return { ok: true, message: "Saved.", items: await all(sb) };
}

export async function deleteItem(id: string): Promise<ExpResult> {
  const sb = await owner();
  if (!sb) return { ok: false, message: "Only the owner can edit the site." };
  const { error } = await sb.from("experience_items").delete().eq("id", id);
  if (error) return { ok: false, message: "Couldn't delete. Try again." };
  revalidatePath("/");
  return { ok: true, message: "Deleted.", items: await all(sb) };
}

/** Move an item one place up (-1) or down (+1), then renumber everything 10, 20, 30… */
export async function moveItem(id: string, direction: -1 | 1): Promise<ExpResult> {
  const sb = await owner();
  if (!sb) return { ok: false, message: "Only the owner can edit the site." };
  const items = await all(sb);
  const i = items.findIndex((x) => x.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= items.length) return { ok: true, message: "", items };
  [items[i], items[j]] = [items[j], items[i]];
  for (const [k, it] of items.entries()) {
    const sort = (k + 1) * 10;
    if (it.sort !== sort) {
      const { error } = await sb.from("experience_items").update({ sort }).eq("id", it.id!);
      if (error) return { ok: false, message: "Couldn't reorder. Try again." };
    }
  }
  revalidatePath("/");
  return { ok: true, message: "", items: await all(sb) };
}
