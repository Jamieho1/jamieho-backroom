// Self-host the Excalidraw fonts under /excalidraw-assets (same origin; the board never loads fonts from a CDN).
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The package does not export package.json, so the fonts are found by path.
const src = join(process.cwd(), "node_modules", "@excalidraw", "excalidraw", "dist", "prod", "fonts");
const dest = join(process.cwd(), "public", "excalidraw-assets", "fonts");
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
writeFileSync(join(dirname(dest), "NOTICE.txt"), "Fonts from @excalidraw/excalidraw 0.18.1 (MIT); individual fonts keep their own licences (SIL OFL and similar). Unmodified files from the npm package.\n");
console.log(`copied Excalidraw fonts to ${dest}`);
