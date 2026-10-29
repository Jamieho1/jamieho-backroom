import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readSupabaseEnv } from "@/lib/env";

/** Supabase client for Server Components, Route Handlers and Server Actions. Null when not configured. */
export async function supabaseServer() {
  const env = readSupabaseEnv();
  if (!env) return null;
  const store = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component: cookies are read-only there; proxy.ts refreshes the session.
        }
      },
    },
  });
}
