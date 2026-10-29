import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

/** Google → Supabase → here: swap the code for a session, log the sign-in, go back where they were. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const sb = await supabaseServer();
  if (!code || !sb) return NextResponse.redirect(new URL("/?auth=error", url.origin));
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/?auth=error", url.origin));
  await sb.rpc("record_signin"); // best effort: a failed log never blocks sign-in
  return NextResponse.redirect(new URL(next, url.origin));
}
