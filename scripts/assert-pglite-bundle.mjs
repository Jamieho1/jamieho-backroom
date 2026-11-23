// Fails the build check if PGlite (or the SQL worker that imports it) leaks outside the SQL practice route.
// Run after `next build`. PGlite chunks are found by their contents; chunks that point at them (the worker, and the
// SQL page's loader that spawns it) are added; every route's first-load chunk list and manifest is then searched.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const chunks = ".next/static/chunks";
const SQL_ROUTE = "/interview/sql/problems/[lc]";
const SQL_MANIFEST_DIR = "interview/sql/problems/[lc]/";
const MARKERS = /PGlite|pglite\.(wasm|data)|initdb\.wasm|@electric-sql\/pglite/;
if (!existsSync(chunks)) { console.error("No .next build output found; run `next build` first."); process.exit(1); }
const fail = (lines) => { console.error(lines.join("\n")); process.exit(1); };

for (const f of ["pglite.wasm", "pglite.data", "initdb.wasm"]) if (!existsSync(join("public", "pglite", f))) fail([`public/pglite/${f} is missing; run \`node scripts/copy-pglite.mjs\` (the prebuild step does).`]);

const all = readdirSync(chunks).filter((f) => /\.js$/.test(f));
// The Turbopack runtime chunks hold a registry of every chunk name; they are not routes and are ignored.
const isRuntime = (f) => /^turbopack-/.test(f);
const text = new Map(all.map((f) => [f, readFileSync(join(chunks, f), "utf8")]));
const library = all.filter((f) => !isRuntime(f) && MARKERS.test(text.get(f)));
if (!library.length) fail(["Found no PGlite chunks in the build; the bundle check cannot prove anything. Has the SQL route been removed?"]);

// Grow the set with chunks that name a member (loaders), until stable.
const group = new Set(library);
for (let grew = true; grew;) {
  grew = false;
  for (const f of all) if (!isRuntime(f) && !group.has(f) && [...group].some((g) => text.get(f).includes(g))) { group.add(f); grew = true; }
}
const loaders = [...group].filter((f) => !library.includes(f));

const leaks = [];
// 1. First-load chunk lists per route (Next's own bundle report).
const statsFile = ".next/diagnostics/route-bundle-stats.json";
let routes = 0;
if (existsSync(statsFile)) {
  for (const r of JSON.parse(readFileSync(statsFile, "utf8"))) {
    routes++;
    const names = (r.firstLoadChunkPaths ?? []).map((p) => p.split("/").pop());
    const hit = names.filter((n) => group.has(n));
    if (r.route !== SQL_ROUTE && hit.length) leaks.push(`${r.route} first-loads ${hit.join(", ")}`);
    if (r.route === SQL_ROUTE) {
      const eager = names.filter((n) => library.includes(n));
      if (eager.length) leaks.push(`${r.route} first-loads PGlite chunks directly (${eager.join(", ")}); PGlite must load only inside the worker`);
      if (!names.some((n) => loaders.includes(n))) leaks.push(`${r.route} does not reference the SQL worker loader`);
    }
  }
}
if (!routes) leaks.push(`${statsFile} is missing; run a production build with Next 16 to get per-route chunk lists.`);
// 2. Per-route client manifests and the root build manifests.
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const manifests = walk(".next/server/app").filter((f) => /(client-reference-manifest\.js|build-manifest\.json|react-loadable-manifest\.json)$/.test(f));
const names = (f) => [...group].filter((c) => readFileSync(f, "utf8").includes(c));
const rel = (f) => f.slice(".next/server/app/".length);
for (const f of manifests) {
  const hit = names(f);
  if (hit.length && !rel(f).startsWith(SQL_MANIFEST_DIR)) leaks.push(`${rel(f)} references ${hit.join(", ")}`);
}
for (const f of ["build-manifest.json", "app-build-manifest.json", "fallback-build-manifest.json"]) {
  const p = join(".next", f);
  if (existsSync(p) && names(p).length) leaks.push(`${f} references ${names(p).join(", ")}`);
}
// 3. Nothing outside the group may name a PGlite chunk (other than the runtime registry).
for (const f of all) if (!group.has(f) && !isRuntime(f) && library.some((c) => text.get(f).includes(c))) leaks.push(`chunk ${f} references PGlite chunks`);
// 4. The worker must point at the self-hosted assets.
if (!library.some((f) => text.get(f).includes("/pglite") && /pglite\.wasm/.test(text.get(f)))) leaks.push("The worker chunk does not reference /pglite/pglite.wasm.");

if (leaks.length) fail([`PGlite reaches routes other than ${SQL_ROUTE}:`, ...leaks.map((l) => `  ${l}`)]);
const kb = (f) => Math.round(statSync(join(chunks, f)).size / 1024);
console.log(`PGlite: ${library.length} chunks (${library.reduce((n, f) => n + kb(f), 0)} KB) plus ${loaders.length} loader chunk${loaders.length === 1 ? "" : "s"}, first-loaded only by ${SQL_ROUTE} (as the worker loader); ${routes} route bundle lists and ${manifests.length} route manifests are free of them`);
