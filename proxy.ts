import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readSupabaseEnv } from "@/lib/env";

/** Keeps the Supabase session cookie fresh on every page request (TKT-52). */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = readSupabaseEnv();
  if (!env) return response;
  const sb = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  await sb.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
