"use server";
import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { PROJECT_SELECT, projectHref, projectSchema, type Project, type ProjectSave } from "@/lib/portfolio-core";

/** Every page that shows projects: the list, the journey showcase and the homepage (when the journey moves there). */
function refresh(...slugs: (string | undefined)[]) {
  revalidatePath("/projects");
  revalidatePath("/journey");
  revalidatePath("/");
  for (const s of new Set(slugs)) if (s) revalidatePath(projectHref(s));
}

/** TKT-86: owner-only create/update of a project. RLS refuses anyone else even if this check were bypassed. */
export async function saveProject(input: unknown): Promise<ProjectSave> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Add a name and a valid, unique URL slug; links must start with https:// and fields must fit their limits." };
  try {
    if ((await getViewer()).role !== "owner") return { ok: false, message: "Only the owner can edit projects." };
    const sb = await supabaseServer();
    if (!sb) throw new Error("unavailable");
    const previous = await sb.from("projects").select("slug").eq("id", parsed.data.id).maybeSingle();
    if (previous.error) throw new Error("unavailable");
    const { data, error } = await sb.from("projects").upsert(parsed.data, { onConflict: "id" }).select(PROJECT_SELECT).single();
    if (error?.code === "23505") return { ok: false, message: "That slug is already in use. Choose another one." };
    if (error || !data) throw new Error("unavailable");
    refresh(data.slug, previous.data?.slug);
    return { ok: true, project: data as Project };
  } catch {
    return { ok: false, message: "Couldn't save. Your changes are still here — retry." };
  }
}

export async function deleteProject(id: string): Promise<{ ok: boolean; message: string }> {
  try {
    if ((await getViewer()).role !== "owner") return { ok: false, message: "Only the owner can delete projects." };
    const sb = await supabaseServer();
    if (!sb) throw new Error("unavailable");
    const { data, error } = await sb.from("projects").delete().eq("id", id).select("slug");
    if (error || !data?.length) throw new Error("unavailable");
    refresh(data[0].slug);
    return { ok: true, message: "Deleted." };
  } catch {
    return { ok: false, message: "Couldn't delete. Try again." };
  }
}
