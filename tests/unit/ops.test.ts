import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { FREE_LIMITS, opsWarnings, usageOf, warnRatio, type OpsRow } from "@/lib/ops";
// @ts-expect-error plain JS module used by the GitHub Action
import { encrypt, decrypt } from "../../scripts/export-crypto.mjs";
import { PASSLOOP_TABLES } from "../support/passloop-tables";

const NOW = new Date("2026-11-02T12:00:00Z").getTime();
const ping = (detail: Record<string, unknown> = {}, ran_at = "2026-11-02T05:23:00Z", ok = true): OpsRow => ({
  job: "ping", ran_at, ok, detail: { db_bytes: 20e6, messages_today: 0, messages_month: 3, ...detail },
});
const exp = (ran_at = "2026-11-01T05:47:00Z", ok = true): OpsRow => ({ job: "export", ran_at, ok, detail: {} });

describe("opsWarnings", () => {
  it("is quiet when both jobs ran recently and usage is low", () => {
    expect(opsWarnings([ping(), exp()], NOW, 0.8)).toEqual([]);
  });
  it("flags jobs that never ran, failed, or went stale", () => {
    expect(opsWarnings([], NOW, 0.8)).toHaveLength(2);
    expect(opsWarnings([ping({}, undefined, false), exp()], NOW, 0.8)[0]).toMatch(/ping failed/);
    expect(opsWarnings([ping({}, "2026-10-28T05:23:00Z"), exp("2026-10-20T05:47:00Z")], NOW, 0.8)).toEqual([
      expect.stringMatching(/ping hasn't run since 2026-10-28/),
      expect.stringMatching(/export hasn't run since 2026-10-20/),
    ]);
  });
  it("warns near the free limits", () => {
    const w = opsWarnings([ping({ db_bytes: FREE_LIMITS.db_bytes * 0.85, messages_today: 90, messages_month: 2500 }), exp()], NOW, 0.8);
    expect(w).toEqual([expect.stringMatching(/85% of the free 500 MB/), expect.stringMatching(/100 emails a day/), expect.stringMatching(/3,000/)]);
  });
  it("a tiny test threshold shows the banner on purpose", () => {
    expect(opsWarnings([ping(), exp()], NOW, warnRatio("0.0001"))[0]).toMatch(/Database is at/);
    expect(warnRatio("nonsense")).toBe(0.8);
    expect(warnRatio(undefined)).toBe(0.8);
  });
  it("ignores usage from a failed ping", () => {
    expect(usageOf(ping({}, undefined, false))).toBeNull();
  });
});

describe("export encryption", () => {
  it("round-trips with the passphrase and refuses a wrong one", () => {
    const blob = encrypt(Buffer.from('{"a":1}'), "correct horse battery staple");
    expect(blob.toString("utf8")).not.toContain('"a"');
    expect(decrypt(blob, "correct horse battery staple").toString()).toBe('{"a":1}');
    expect(() => decrypt(blob, "wrong passphrase!!")).toThrow();
  });
});

describe("export table list", () => {
  it("names every personal-site table; PassLoop's tables are exported by PassLoop, never both", () => {
    const sql = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"))
      .map((f) => readFileSync(`supabase/migrations/${f}`, "utf8"))
      .join("\n");
    const created = [...sql.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]).sort();
    const manifest: string[] = JSON.parse(readFileSync("scripts/export-tables.json", "utf8"));
    expect(manifest.filter((t) => (PASSLOOP_TABLES as readonly string[]).includes(t))).toEqual([]);
    expect([...manifest, ...PASSLOOP_TABLES].sort()).toEqual(created);
    for (const table of ["profiles", "messages", "articles", "projects", "guides", "about_photos", "experience_items", "behavioral_stories", "behavioral_answers", "content_changes"]) expect(manifest).toContain(table);
  });
});

it('encrypted practice backups retain multiple user IDs and private rows without plaintext disclosure',()=>{
 const tables={practice_cases:[{user_id:'account-a',problem:217,cases:[{id:'custom:00000000-0000-4000-8000-000000000001',inputs:['[4,4]']}]}],practice_code:[{user_id:'account-a',problem:217,code:'Synthetic A'},{user_id:'account-b',problem:217,code:'Synthetic B'}],practice_stars:[{user_id:'account-b',problem:1}],practice_attempts:[{user_id:'account-a',problem:217,mode:'submit',status:'ok',passed:2,total:2}]};
 const encrypted=encrypt(Buffer.from(JSON.stringify({tables})),'synthetic export passphrase');expect(encrypted.toString('utf8')).not.toContain('Synthetic A');expect(JSON.parse(decrypt(encrypted,'synthetic export passphrase').toString('utf8'))).toEqual({tables});
});

it('encrypted Interview backups include private resumes, custom questions, answers and import archives for every account',()=>{
 const tables={user_resumes:[{user_id:'account-a',content:{entries:[]}},{user_id:'account-b',content:{entries:[]}}],resume_templates:[{key:'default',content:{entries:[]}}],interview_behavioral_themes:[{id:'conflict'}],interview_behavioral_questions:[{id:'synthetic-question'}],interview_behavioral_custom_questions:[{user_id:'account-a',prompt:'Synthetic private prompt'}],interview_behavioral_answers:[{user_id:'account-b',question_id:'synthetic-question',situation:'Synthetic private STAR',legacy_source:{outline:'Synthetic source archive'}}]};
 const encrypted=encrypt(Buffer.from(JSON.stringify({tables})),'synthetic export passphrase');expect(encrypted.toString('utf8')).not.toContain('Synthetic private');expect(JSON.parse(decrypt(encrypted,'synthetic export passphrase').toString('utf8'))).toEqual({tables});
});
