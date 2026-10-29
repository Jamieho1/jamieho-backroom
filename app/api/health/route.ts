import { readSupabaseEnv } from "@/lib/env";
import { checkHealth } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkHealth(readSupabaseEnv());
  return Response.json(health, { status: health.ok ? 200 : 503, headers: { "cache-control": "no-store" } });
}
