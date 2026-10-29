import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FREE_LIMITS, opsWarnings, usageOf, warnRatio, type OpsRow } from "@/lib/ops";
// @ts-expect-error plain JS module used by the GitHub Action
import { encrypt, decrypt } from "../../scripts/export-crypto.mjs";

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
  it("names every table the migrations create in public", () => {
    const sql = ["20261029100000_auth_roles", "20261029150000_app_registry", "20261029170000_site_sections", "20261029180000_experience", "20261029190000_messages", "20261029200000_app_opens", "20261029210000_ops"]
      .map((f) => readFileSync(`supabase/migrations/${f}.sql`, "utf8"))
      .join("\n");
    const created = [...sql.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]).sort();
    expect(JSON.parse(readFileSync("scripts/export-tables.json", "utf8")).sort()).toEqual(created);
  });
});
