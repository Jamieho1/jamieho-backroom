import { describe, expect, it, vi } from "vitest";
import { buildVisitors, type ProfileRow } from "@/lib/visitors";
import { recordAppOpen } from "@/lib/app-opens";

const p = (id: string, role: "owner" | "member" = "member", full_name: string | null = id.toUpperCase()): ProfileRow => ({
  id, email: `${id}@example.com`, full_name, role, created_at: "2026-10-01T00:00:00Z",
});

describe("buildVisitors", () => {
  it("lists members with first and last visit, sign-in count and apps, newest first", () => {
    const v = buildVisitors(
      [p("me", "owner"), p("ann"), p("bob", "member", null)],
      [
        { user_id: "ann", at: "2026-10-20T10:00:00Z" },
        { user_id: "ann", at: "2026-10-05T10:00:00Z" },
        { user_id: "bob", at: "2026-10-25T10:00:00Z" },
        { user_id: "me", at: "2026-10-29T10:00:00Z" },
      ],
      [{ user_id: "ann", app_id: "notes" }, { user_id: "ann", app_id: "practice" }, { user_id: "ann", app_id: "notes" }],
      { notes: "Notes", practice: "Practice" },
    );
    expect(v.map((x) => x.id)).toEqual(["bob", "ann"]); // owner left out
    expect(v[1]).toMatchObject({ name: "ANN", firstVisit: "2026-10-05T10:00:00Z", lastVisit: "2026-10-20T10:00:00Z", signins: 2, apps: ["Notes", "Practice"] });
    expect(v[0]).toMatchObject({ name: "bob@example.com", apps: [] });
  });
  it("falls back to the profile date when no sign-in was logged", () => {
    expect(buildVisitors([p("ann")], [], [], {})[0]).toMatchObject({ firstVisit: "2026-10-01T00:00:00Z", signins: 0 });
  });
});

describe("recordAppOpen", () => {
  it("inserts only the app id and treats 'already recorded today' as fine", async () => {
    const insert = vi.fn(async () => ({ error: { code: "23505" } }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await recordAppOpen({ from: () => ({ insert }) } as never, "notes");
    expect(insert).toHaveBeenCalledWith({ app_id: "notes" });
    expect(warn).not.toHaveBeenCalled();
    insert.mockResolvedValueOnce({ error: { code: "42501" } });
    await recordAppOpen({ from: () => ({ insert }) } as never, "behavioral");
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("analytics events", async () => {
  const { tidyEvent } = await import("@/components/site-analytics");
  it("drops owner and sign-in pages and strips query strings", () => {
    expect(tidyEvent({ type: "pageview", url: "https://x.app/settings#inbox" })).toBeNull();
    expect(tidyEvent({ type: "pageview", url: "https://x.app/auth/callback?code=1" })).toBeNull();
    expect(tidyEvent({ type: "pageview", url: "https://x.app/projects?next=%2Fdesktop" })?.url).toBe("https://x.app/projects");
  });
});
