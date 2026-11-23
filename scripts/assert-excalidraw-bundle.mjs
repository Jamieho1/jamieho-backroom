// Fails the build check if Excalidraw code leaks into any bundle other than the whiteboard route's lazy chunks.
// Run after `next build`. Excalidraw chunks are found by their contents, then every route manifest is searched for them.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const chunks = ".next/static/chunks";
const MARKERS = /excalidraw__canvas|EXCALIDRAW_ASSET_PATH|excalidraw-assets|@excalidraw\//;
const WHITEBOARD_ROUTE = "interview/[section]/[mode]/[[...topic]]/page";
if (!existsSync(chunks)) { console.error("No .next build output found; run `next build` first."); process.exit(1); }
const excalidraw = readdirSync(chunks).filter((f) => /\.(js|css)$/.test(f) && MARKERS.test(readFileSync(join(chunks, f), "utf8")));
if (!excalidraw.length) { console.error("Found no Excalidraw chunks in the build; the bundle check cannot prove anything. Has the whiteboard route been removed?"); process.exit(1); }

const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const manifests = walk(".next/server/app").filter((f) => /(client-reference-manifest\.js|build-manifest\.json|react-loadable-manifest\.json)$/.test(f));
const names = (f) => { const text = readFileSync(f, "utf8"); return excalidraw.filter((c) => text.includes(c)); };
const rel = (f) => f.slice(".next/server/app/".length);

const leaks = [];
const loadable = [];
for (const f of manifests) {
  const hit = names(f);
  if (!hit.length) continue;
  if (f.endsWith("react-loadable-manifest.json") && rel(f).startsWith(WHITEBOARD_ROUTE + "/")) loadable.push(...hit);
  else leaks.push(`${rel(f)} references ${hit.join(", ")}`);
}
for (const f of ["build-manifest.json", "app-build-manifest.json", "fallback-build-manifest.json"]) {
  const p = join(".next", f);
  if (existsSync(p) && names(p).length) leaks.push(`${f} references ${names(p).join(", ")}`);
}
// Chunks that are not Excalidraw's own may only point at them through a dynamic import (the whiteboard host/loader modules).
const loaders = readdirSync(chunks).filter((f) => !excalidraw.includes(f) && /\.js$/.test(f) && excalidraw.some((c) => readFileSync(join(chunks, f), "utf8").includes(c)));
const missing = excalidraw.filter((c) => /\.js$/.test(c) && !loadable.includes(c) && !loaders.some((l) => readFileSync(join(chunks, l), "utf8").includes(c)));

if (leaks.length || !loadable.length || missing.length) {
  if (leaks.length) console.error(`Excalidraw chunks reach other routes:\n  ${leaks.join("\n  ")}`);
  if (!loadable.length) console.error(`The whiteboard route (${WHITEBOARD_ROUTE}) does not declare the Excalidraw chunks as lazy.`);
  if (missing.length) console.error(`Excalidraw chunks not reachable from the whiteboard route: ${missing.join(", ")}`);
  process.exit(1);
}
const kb = (f) => Math.round(statSync(join(chunks, f)).size / 1024);
console.log(`Excalidraw: ${excalidraw.length} chunks (${excalidraw.reduce((n, f) => n + kb(f), 0)} KB), referenced only by the whiteboard route's lazy loader; ${manifests.length} route manifests and the root build manifests are free of them`);
