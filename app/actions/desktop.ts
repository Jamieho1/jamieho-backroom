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
