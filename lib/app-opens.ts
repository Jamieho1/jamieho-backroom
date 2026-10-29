/**
 * Note that the signed-in viewer opened an app (TKT-58). Called by the desktop (TKT-60).
 * At most one row per person, app and day; the database fills in who and when.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function recordAppOpen(sb: Pick<SupabaseClient, "from">, appId: string): Promise<void> {
  const { error } = await sb.from("app_opens").insert({ app_id: appId });
  // 23505 = already recorded today. Anything else (signed out, no access) is ignored: this is only a visit log.
  if (error && error.code !== "23505") console.warn(`app open not recorded: ${error.code ?? "error"}`);
}
