#!/usr/bin/env node
// TKT-76: version every Home journey media file by content so browsers and the service worker can cache it for
// good. Run after encoding or replacing anything in public/home-media/, then upload the files and commit the JSON:
//   node scripts/home-media/manifest.mjs
// Writes lib/journey/media-manifest.json: { "<file>": { "v": "<8-char content hash>", "bytes": <size> } }.
// Pages request "<file>?v=<hash>", so a replaced file gets a new URL and stale copies are never served.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const dir = join(root, "public/home-media");
const out = join(root, "lib/journey/media-manifest.json");
const files = readdirSync(dir).filter((f) => /\.(mp4|jpg|png)$/.test(f)).sort();
const manifest = Object.fromEntries(files.map((f) => {
  const buf = readFileSync(join(dir, f));
  return [f, { v: createHash("sha256").update(buf).digest("hex").slice(0, 8), bytes: buf.length }];
}));
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(`${files.length} files -> lib/journey/media-manifest.json`);
