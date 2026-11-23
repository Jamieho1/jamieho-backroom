// Self-host PGlite's WebAssembly Postgres under /pglite (same origin, so the SQL worker never loads code or data from a CDN).
// Loaded only by the SQL practice worker: wasm, initdb and the file bundle are fetched there and passed to PGlite explicitly.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
// The package does not export package.json, so it is read next to the resolved dist folder.
const dist = dirname(require.resolve("@electric-sql/pglite"));
const { version } = JSON.parse(readFileSync(join(dist, "..", "package.json"), "utf8"));
const dest = join(process.cwd(), "public", "pglite");
mkdirSync(dest, { recursive: true });
for (const f of ["pglite.wasm", "pglite.data", "initdb.wasm"]) copyFileSync(join(dist, f), join(dest, f));
writeFileSync(join(dest, "NOTICE.txt"), `@electric-sql/pglite ${version}: Apache-2.0 (PostgreSQL itself: PostgreSQL License). Unmodified wasm and data files from the npm package. Source: https://github.com/electric-sql/pglite .\n`);
console.log(`copied PGlite ${version} runtime to ${dest}`);
