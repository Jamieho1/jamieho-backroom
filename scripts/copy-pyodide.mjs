// Self-host the Pyodide runtime under /pyodide (same origin, so the worker CSP can stay 'self').
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const src = dirname(require.resolve("pyodide/package.json"));
const dest = join(process.cwd(), "public", "pyodide");
mkdirSync(dest, { recursive: true });
for (const f of ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]) copyFileSync(join(src, f), join(dest, f));
console.log(`copied Pyodide runtime to ${dest}`);

writeFileSync(join(dest, "NOTICE.txt"), "Pyodide 314.0.7: MPL-2.0. Unmodified runtime files from the pyodide npm package. Source and license: https://github.com/pyodide/pyodide . Python standard library: https://docs.python.org/3/license.html .\n");
