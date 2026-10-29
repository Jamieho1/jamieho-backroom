/**
 * Public Supabase settings. Jamie sets these in Vercel himself (TKT-51); they are never committed.
 * Only the publishable (anon) key is used in the browser; row-level security does the protecting.
 */
export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function readSupabaseEnv(env: Record<string, string | undefined> = process.env): SupabaseEnv | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/+$/, ""), anonKey };
}
