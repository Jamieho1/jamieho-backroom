#!/usr/bin/env node
/**
 * TKT-59 ops, run by .github/workflows/ops.yml (never by the website).
 *   node scripts/ops.mjs ping            daily: a real database query (keeps the free project awake) + usage numbers
 *   node scripts/ops.mjs export <file>   weekly: every table as JSON, encrypted with EXPORT_PASSPHRASE
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (GitHub secrets Jamie sets). Prints no secrets and no row data.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { encrypt } from "./export-crypto.mjs";

const TABLES = JSON.parse(readFileSync(new URL("./export-tables.json", import.meta.url), "utf8"));
const PAGE = 1000;

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (GitHub → Settings → Secrets).");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function record(sb, job, ok, detail) {
  const { error } = await sb.from("ops_status").upsert({ job, ok, detail, ran_at: new Date().toISOString() });
  if (error) console.error(`could not record ${job} status: ${error.message}`);
}

async function ping(sb) {
  const { data, error } = await sb.rpc("ops_usage");
  if (error) throw new Error(`ops_usage failed: ${error.message}`);
  await record(sb, "ping", true, data);
  console.log(`ping ok: ${(data.db_bytes / 1e6).toFixed(1)} MB, ${data.users} users, ${data.messages_month} messages this month`);
}

async function dumpTable(sb, table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(table).select("*").range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

async function exportAll(sb, file) {
  const passphrase = process.env.EXPORT_PASSPHRASE;
  if (!passphrase || passphrase.length < 16) throw new Error("EXPORT_PASSPHRASE must be set (16+ characters).");
  const tables = {};
  for (const t of TABLES) tables[t] = await dumpTable(sb, t);
  const counts = Object.fromEntries(Object.entries(tables).map(([t, r]) => [t, r.length]));
  const json = JSON.stringify({ app: "jamieho-backroom", exported_at: new Date().toISOString(), tables }, null, 2);
  writeFileSync(file, encrypt(Buffer.from(json), passphrase));
  await record(sb, "export", true, { counts, bytes: json.length });
  console.log(`export ok: ${Object.entries(counts).map(([t, n]) => `${t}=${n}`).join(" ")}`);
}

const [job, file] = process.argv.slice(2);
let sb;
try {
  sb = client();
  if (job === "ping") await ping(sb);
  else if (job === "export" && file) await exportAll(sb, file);
  else throw new Error("usage: ops.mjs ping | export <file>");
} catch (e) {
  if (sb && (job === "ping" || job === "export")) await record(sb, job, false, { error: String(e.message).slice(0, 300) });
  console.error(e.message);
  process.exit(1);
}
