"use client";
/**
 * Who's looking, decided in the browser so public pages stay pre-rendered (TKT-54).
 * Display only: every write is checked again on the server and by the database.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export interface ClientViewer {
  status: "loading" | "anonymous" | "member" | "owner";
  name?: string;
}
interface Ctx {
  viewer: ClientViewer;
  editing: boolean;
  setEditing(v: boolean): void;
  configured: boolean;
}
const ViewerContext = createContext<Ctx>({ viewer: { status: "anonymous" }, editing: false, setEditing: () => {}, configured: false });
export const useViewer = () => useContext(ViewerContext);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configured = !!(url && key);
  const [viewer, setViewer] = useState<ClientViewer>({ status: configured ? "loading" : "anonymous" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const sb = supabaseBrowser(url, key);
    let live = true;
    const load = async () => {
      const { data } = await sb.auth.getUser();
      const user = data.user;
      if (!user) return live && setViewer({ status: "anonymous" });
      const { data: p } = await sb.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
      if (live) setViewer({ status: p?.role === "owner" ? "owner" : "member", name: p?.full_name ?? user.email ?? undefined });
    };
    void load();
    const { data: sub } = sb.auth.onAuthStateChange(() => void load());
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, [configured, url, key]);

  const value = useMemo(() => ({ viewer, editing: editing && viewer.status === "owner", setEditing, configured }), [viewer, editing, configured]);
  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}
