/**
 * Who is looking (TKT-52). The role comes from public.profiles, which only the database can set;
 * the client never decides it.
 */
import { supabaseServer } from "@/lib/supabase/server";

export type Role = "anonymous" | "member" | "owner";
export interface Viewer {
  role: Role;
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export async function getViewer(): Promise<Viewer> {
  const sb = await supabaseServer();
  if (!sb) return { role: "anonymous" };
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) return { role: "anonymous" };
  const { data: profile } = await sb.from("profiles").select("role, full_name, avatar_url").eq("id", user.id).maybeSingle();
  return {
    role: profile?.role === "owner" ? "owner" : "member",
    id: user.id,
    email: user.email ?? undefined,
    name: profile?.full_name ?? user.email ?? undefined,
    avatarUrl: profile?.avatar_url ?? undefined,
  };
}
