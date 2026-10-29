#!/usr/bin/env node
/**
 * Decrypt a weekly export on your own Mac:
 *   npm run decrypt-export -- ~/Downloads/backroom-export-2026-11-01.json.enc
 * Asks for the passphrase (not echoed) and writes the .json next to it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { decrypt } from "./export-crypto.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: npm run decrypt-export -- <file.json.enc>");
  process.exit(1);
}
const ask = () =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = () => {}; // hide what's typed
    process.stdout.write("Export passphrase: ");
    rl.question("", (a) => (rl.close(), process.stdout.write("\n"), resolve(a)));
  });
const passphrase = process.env.EXPORT_PASSPHRASE || (await ask());
try {
  const out = file.replace(/\.enc$/, "") === file ? `${file}.json` : file.replace(/\.enc$/, "");
  writeFileSync(out, decrypt(readFileSync(file), passphrase));
  console.log(`Wrote ${out}`);
} catch {
  console.error("Couldn't decrypt: wrong passphrase or a damaged file.");
  process.exit(1);
}
