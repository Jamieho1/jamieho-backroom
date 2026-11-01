"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { recordAppOpen } from "@/lib/app-opens";

/** RLS validates the current user and app access; logging never blocks launching. */
export async function logDesktopOpen(appId: string): Promise<void> {
  try {
    const sb = await supabaseServer();
    if (sb) await recordAppOpen(sb, appId);
  } catch {
    console.warn("app open not recorded: unavailable");
  }
}

/** Client-side public-page navigation only; cookies never enter the prerendered pages. */
export async function getDesktopApps():Promise<import('@/lib/apps').AppRow[]>{
 const {getViewer}=await import('@/lib/viewer');
 if((await getViewer()).role==='anonymous')return [];
 const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
 const {data,error}=await sb.from('desktop_apps').select('*').order('sort').order('id');
 if(error)throw new Error('unavailable');
 return data??[];
}
