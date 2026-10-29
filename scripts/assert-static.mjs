// Fails the build check if a page that must be pre-rendered (fast, works when Supabase is down) became dynamic.
import { readFileSync } from "node:fs";
const MUST_BE_STATIC = ["/", "/privacy", "/projects"];
const routes = Object.keys(JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8")).routes);
const missing = MUST_BE_STATIC.filter((r) => !routes.includes(r));
if (missing.length) {
  console.error(`These pages are no longer pre-rendered: ${missing.join(", ")}. Something in them reads cookies/headers or searchParams on the server.`);
  process.exit(1);
}
console.log(`pre-rendered: ${MUST_BE_STATIC.join(", ")}`);
