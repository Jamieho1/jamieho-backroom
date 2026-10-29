/** The app registry (TKT-53). Rows live in public.apps; only the owner can change them (RLS). */
export const VISIBILITIES = ["public", "signed_in", "invite_only", "owner_only"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: "Public",
  signed_in: "Signed-in",
  invite_only: "Invite-only",
  owner_only: "Only me",
};

export const VISIBILITY_HINT: Record<Visibility, string> = {
  public: "Anyone, no login",
  signed_in: "Anyone signed in with Google",
  invite_only: "Only emails on the invite list",
  owner_only: "Only you",
};

export interface AppRow {
  id: string;
  name: string;
  icon: string;
  kind: "internal" | "external";
  url: string;
  visibility: Visibility;
  screenshots: string[];
  tags: string[];
  description: string;
  sort: number;
  locked: boolean;
}

export function isVisibility(v: unknown): v is Visibility {
  return typeof v === "string" && (VISIBILITIES as readonly string[]).includes(v);
}

/** Same rule as public.can_view_app(); the database is the authority, this only decides what to show. */
export function canOpen(app: Pick<AppRow, "visibility">, viewer: { role: "anonymous" | "member" | "owner"; invited?: boolean }): boolean {
  if (viewer.role === "owner") return true;
  switch (app.visibility) {
    case "public":
      return true;
    case "signed_in":
      return viewer.role !== "anonymous";
    case "invite_only":
      return viewer.role !== "anonymous" && !!viewer.invited;
    default:
      return false;
  }
}

export function normaliseEmail(raw: string): string | null {
  const e = raw.trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : null;
}
