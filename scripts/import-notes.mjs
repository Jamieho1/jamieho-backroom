#!/usr/bin/env node
/**
 * TKT-63: load the coding notes copied from the Interview Prep artifact into public.notes.
 *   npm run import-notes -- "../imports/2026-11-02/notes.json"            (dry run: shows what would change)
 *   npm run import-notes -- "../imports/2026-11-02/notes.json" --apply    (writes)
 * Safe to re-run: a note edited on the website after the copy (newer updated_at) is never overwritten.
 * Reads the project URL from .env.local; asks for the Supabase service_role key (not echoed, never saved).
 * The JSON holds personal notes: keep it outside git.
 */
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";
import { planNotes, validateNote } from "./import-notes-plan.mjs";

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error('usage: npm run import-notes -- <notes.json> [--apply]');
  process.exit(1);
}
const apply = flag === "--apply";
const rows = JSON.parse(readFileSync(file, "utf8"));
const problems = rows.flatMap((r) => validateNote(r).map((p) => `${r.id ?? "?"}: ${p}`));
if (problems.length) {
  console.error(`The file has problems, nothing written:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) {
  console.error("No Supabase URL: set NEXT_PUBLIC_SUPABASE_URL in .env.local.");
  process.exit(1);
}
const ask = (q) =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = () => {};
    process.stdout.write(q);
    rl.question("", (a) => (rl.close(), process.stdout.write("\n"), resolve(a.trim())));
  });
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || (await ask("Supabase service_role key (hidden): "));
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: existing, error } = await sb.from("notes").select("id, updated_at");
if (error) {
  console.error(`Couldn't read notes: ${error.message}`);
  process.exit(1);
}
const plan = planNotes(rows, existing);
for (const p of plan) console.log(`${p.action.padEnd(6)} ${p.row.id.padEnd(16)} ${p.why}`);
const writes = plan.filter((p) => p.action !== "skip");
if (!apply) {
  console.log(`\nDry run: ${writes.length} to write, ${plan.length - writes.length} skipped. Add --apply to write.`);
  process.exit(0);
}
for (const p of writes) {
  const { id, title, body, free, visual, sort, updated_at } = p.row;
  const { error: e } = await sb.from("notes").upsert({ id, title, body, free, visual, sort, updated_at });
  if (e) {
    console.error(`${id}: ${e.message}. Stopped; re-run to continue (finished notes are skipped).`);
    process.exit(1);
  }
  console.log(`wrote  ${id}`);
}
const { count } = await sb.from("notes").select("id", { count: "exact", head: true });
console.log(`\nDone: ${writes.length} written. The notes table now has ${count} notes.`);
