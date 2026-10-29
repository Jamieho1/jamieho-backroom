/** Settings > Visitors (TKT-58): who signed in, when, and which apps they opened. Pure, so it's easy to test. */
export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "owner" | "member";
  created_at: string;
}
export interface SigninRow {
  user_id: string;
  at: string;
}
export interface OpenRow {
  user_id: string;
  app_id: string;
}
export interface Visitor {
  id: string;
  name: string;
  email: string;
  firstVisit: string;
  lastVisit: string;
  signins: number;
  apps: string[];
}

/** Members only (the owner's own visits are left out), most recent visit first. */
export function buildVisitors(profiles: ProfileRow[], signins: SigninRow[], opens: OpenRow[], appNames: Record<string, string>): Visitor[] {
  const byUser = new Map<string, string[]>();
  for (const s of signins) byUser.set(s.user_id, [...(byUser.get(s.user_id) ?? []), s.at]);
  const appsByUser = new Map<string, Set<string>>();
  for (const o of opens) appsByUser.set(o.user_id, (appsByUser.get(o.user_id) ?? new Set()).add(appNames[o.app_id] ?? o.app_id));

  return profiles
    .filter((p) => p.role !== "owner")
    .map((p) => {
      const times = (byUser.get(p.id) ?? []).sort();
      return {
        id: p.id,
        name: p.full_name || p.email,
        email: p.email,
        firstVisit: times[0] ?? p.created_at,
        lastVisit: times[times.length - 1] ?? p.created_at,
        signins: times.length,
        apps: [...(appsByUser.get(p.id) ?? [])].sort(),
      };
    })
    .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}
