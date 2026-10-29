/** TKT-59: what Settings shows about the scheduled ping/export and free-tier usage. Pure, so it's testable. */
export interface OpsRow {
  job: "ping" | "export";
  ran_at: string;
  ok: boolean;
  detail: Record<string, unknown>;
}
export interface Usage {
  db_bytes: number;
  messages_today: number;
  messages_month: number;
}

/** Free-plan limits this site can hit: Supabase database size and Resend's daily / monthly email caps. */
export const FREE_LIMITS = { db_bytes: 500 * 1024 * 1024, emails_day: 100, emails_month: 3000 } as const;
const DAY = 24 * 60 * 60 * 1000;
export const STALE_AFTER = { ping: 3 * DAY, export: 9 * DAY } as const;

/** Warn at this share of a limit. FREE_TIER_WARN_AT (e.g. 0.0001) lets Jamie see the banner on purpose. */
export function warnRatio(raw = process.env.FREE_TIER_WARN_AT): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.8;
}

export function usageOf(ping: OpsRow | undefined): Usage | null {
  const d = ping?.ok ? ping.detail : null;
  if (!d || typeof d.db_bytes !== "number") return null;
  return { db_bytes: d.db_bytes, messages_today: Number(d.messages_today ?? 0), messages_month: Number(d.messages_month ?? 0) };
}

const pct = (n: number, of: number) => `${Math.round((n / of) * 100)}%`;
const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;

/** Plain-English warnings for the Settings banner; empty when all is well. */
export function opsWarnings(rows: OpsRow[], now = Date.now(), ratio = warnRatio()): string[] {
  const out: string[] = [];
  const by = Object.fromEntries(rows.map((r) => [r.job, r])) as Partial<Record<OpsRow["job"], OpsRow>>;
  for (const job of ["ping", "export"] as const) {
    const r = by[job];
    const what = job === "ping" ? "The daily keep-alive ping" : "The weekly export";
    if (!r) out.push(`${what} hasn't run yet. Check the Ops workflow in GitHub → Actions.`);
    else if (!r.ok) out.push(`${what} failed on its last run. See GitHub → Actions → Ops.`);
    else if (now - new Date(r.ran_at).getTime() > STALE_AFTER[job]) out.push(`${what} hasn't run since ${r.ran_at.slice(0, 10)}. GitHub may have paused the schedule.`);
  }
  const u = usageOf(by.ping);
  if (u) {
    if (u.db_bytes >= FREE_LIMITS.db_bytes * ratio) out.push(`Database is at ${mb(u.db_bytes)}, ${pct(u.db_bytes, FREE_LIMITS.db_bytes)} of the free 500 MB.`);
    if (u.messages_today >= FREE_LIMITS.emails_day * ratio) out.push(`${u.messages_today} messages today: near Resend's free 100 emails a day.`);
    if (u.messages_month >= FREE_LIMITS.emails_month * ratio) out.push(`${u.messages_month} messages this month: near Resend's free 3,000 emails a month.`);
  }
  return out;
}

export { mb as formatMB };
