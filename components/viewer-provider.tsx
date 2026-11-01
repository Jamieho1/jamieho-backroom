"use client";
/**
 * Who's looking, decided in the browser so public pages stay pre-rendered (TKT-54).
 * Display only: every write is checked again on the server and by the database.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export interface ClientViewer {
  status: "loading" | "anonymous" | "member" | "owner";
  name?: string;
  id?: string;
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
  const {refresh}=useRouter();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configured = !!(url && key);
  const [viewer, setViewer] = useState<ClientViewer>({ status: configured ? "loading" : "anonymous" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const sb = supabaseBrowser(url, key);
    let live = true;
    let generation=0;
    let currentUserId:string|undefined;
    const reset=()=>{setViewer({status:'anonymous'});setEditing(false);currentUserId=undefined;};
    const load = async () => {
      const request=++generation;
      try{
        const { data } = await sb.auth.getUser();
        if(!live||generation!==request)return;
        const user = data.user;
        if (!user) return reset();
        if(currentUserId!==user.id){if(currentUserId)refresh();currentUserId=user.id;setEditing(false);setViewer({status:'loading'});}
        const { data: p } = await sb.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
        if (live&&generation===request) setViewer({ status: p?.role === "owner" ? "owner" : "member", id:user.id, name: p?.full_name ?? user.email ?? undefined });
      }catch{if(live&&generation===request)reset();}
    };
    void load();
    const { data: sub } = sb.auth.onAuthStateChange((event,session) => {
      if(event==='SIGNED_OUT'){++generation;if(live){const hadUser=!!currentUserId;reset();if(hadUser)refresh();}return;}
      if(session?.user.id&&session.user.id!==currentUserId){setViewer({status:'loading'});setEditing(false);}
      void load();
    });
    return () => {
      live = false;
      ++generation;
      sub.subscription.unsubscribe();
    };
  }, [configured, url, key, refresh]);

  const value = useMemo(() => ({ viewer, editing: editing && viewer.status === "owner", setEditing, configured }), [viewer, editing, configured]);
  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}
