// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { PASSLOOP_FALLBACK_URL, resolvePassloopUrl, PASSLOOP_URL, PASSLOOP_PRIVACY_URL, PASSLOOP_DESCRIPTION } from "@/lib/passloop";
import nextConfig from "../../next.config";

afterEach(cleanup);

describe("PassLoop base URL (one helper)", () => {
  it("falls back when unset, blank or not an http(s) URL; trims trailing slashes", () => {
    expect(PASSLOOP_FALLBACK_URL).toBe("https://pass-loop.vercel.app");
    for (const bad of [undefined, "", "  ", "not a url", "javascript:alert(1)", "ftp://x.example"]) expect(resolvePassloopUrl(bad)).toBe(PASSLOOP_FALLBACK_URL);
    expect(resolvePassloopUrl("https://passloop.example/")).toBe("https://passloop.example");
    expect(resolvePassloopUrl(" https://passloop.example// ")).toBe("https://passloop.example");
    expect(PASSLOOP_PRIVACY_URL).toBe(`${PASSLOOP_URL}/privacy`);
  });
  it("is the only place that reads NEXT_PUBLIC_PASSLOOP_URL", () => {
    const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
    const readers = ["app", "components", "lib", "scripts"].flatMap(files).filter(f => /\.(tsx?|mjs)$/.test(f)).filter(f => readFileSync(f, "utf8").includes("NEXT_PUBLIC_PASSLOOP_URL"));
    expect(readers).toEqual(["lib/passloop.ts"]);
  });
});

describe("old addresses redirect to PassLoop with 308", () => {
  it("lists a separate bare /interview rule and the wildcard rule, permanently", async () => {
    const rules = await nextConfig.redirects!();
    const by = (source: string) => rules.filter(r => r.source === source);
    expect(by("/interview")).toEqual([{ source: "/interview", destination: `${PASSLOOP_URL}/`, permanent: true }]);
    expect(by("/interview/:path*")).toEqual([{ source: "/interview/:path*", destination: `${PASSLOOP_URL}/:path*`, permanent: true }]);
    expect(rules.findIndex(r => r.source === "/interview")).toBeLessThan(rules.findIndex(r => r.source === "/interview/:path*"));
    expect(rules.every(r => "permanent" in r && r.permanent === true)).toBe(true);
  });
  it("maps the retired desktop apps per PassLoop's routes table", async () => {
    const rules = await nextConfig.redirects!();
    const map = (source: string) => rules.filter(r => r.source === source && !("has" in r && r.has)).map(r => r.destination);
    expect(map("/notes")).toEqual([`${PASSLOOP_URL}/dsa/notes`]);
    expect(map("/practices")).toEqual([`${PASSLOOP_URL}/dsa/practice`]);
    expect(map("/practices/:problem")).toEqual([`${PASSLOOP_URL}/problems/:problem`]);
    expect(map("/behavioral")).toEqual([`${PASSLOOP_URL}/behavioral`]);
    const desktop = rules.filter(r => r.source === "/desktop").map(r => ({ to: r.destination.replace(PASSLOOP_URL, ""), app: (r.has as { key: string; value?: string }[]).find(h => h.key === "app")?.value }));
    expect(desktop).toEqual([{ to: "/problems/:problem", app: "practice" }, { to: "/dsa/practice", app: "practice" }, { to: "/dsa/notes", app: "notes" }, { to: "/behavioral", app: "behavioral" }]);
  });
  it("no longer serves the removed runner headers", async () => {
    const headers = await nextConfig.headers!();
    expect(headers.map(h => h.source)).not.toContain("/runner/:path*");
  });
});

vi.mock("next/navigation", () => ({ usePathname: () => "/projects" }));
vi.mock("@/components/viewer-provider", () => ({ useViewer: () => ({ viewer: { status: "anonymous" }, configured: false }) }));
vi.mock("@/components/feedback-button", () => ({ FeedbackButton: () => null }));
vi.mock("@/components/content-drafts/review-badge", () => ({ ContentReviewBadge: () => null }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/sign-in-button", () => ({ SignInButton: () => null }));
vi.mock("next/link", () => ({ default: ({ children, prefetch: _p, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => <a {...props}>{children}</a> }));

describe("PassLoop link and card", () => {
  it("the navigation links to PassLoop and no longer to Interview Prep", async () => {
    const { SiteNavigation } = await import("@/components/site-navigation");
    render(<SiteNavigation />);
    expect(screen.getByRole("link", { name: "PassLoop ↗" }).getAttribute("href")).toBe(PASSLOOP_URL);
    expect(screen.queryByRole("link", { name: "Interview Prep" })).toBeNull();
    expect(document.querySelector('a[href^="/interview"]')).toBeNull();
  });
  it("Projects shows a code-defined PassLoop card in plain English", async () => {
    vi.doMock("@/components/portfolio/manage-link", () => ({ ProjectManageLink: () => null }));
    const { ProjectsIndex } = await import("@/components/projects/projects-index");
    render(<ProjectsIndex projects={[]} />);
    const card = document.querySelector("[data-passloop-card]")!;
    expect(card.textContent).toContain("PassLoop — interview practice for coding, SQL, system design and behavioural questions.");
    expect(PASSLOOP_DESCRIPTION).toBe("Interview practice for coding, SQL, system design and behavioural questions.");
    expect(card.querySelector("a")!.getAttribute("href")).toBe(PASSLOOP_URL);
  });
});

describe("privacy page and export", () => {
  it("states PassLoop is separate, links its privacy page and no longer describes practice, notes or interview data", async () => {
    const Privacy = (await import("@/app/privacy/page")).default;
    vi.doMock("@/components/desktop", () => ({ Desktop: ({ content }: { content: React.ReactNode }) => <div>{content}</div> }));
    const { default: Page } = await import("@/app/privacy/page");
    expect(Privacy).toBeTypeOf("function");
    render(<Page />);
    expect(screen.getByRole("link", { name: "the PassLoop privacy policy" }).getAttribute("href")).toBe(`${PASSLOOP_URL}/privacy`);
    const text = document.body.textContent ?? "";
    expect(text).toContain("separate service with its own privacy page");
    for (const gone of ["Practice code", "System design questions", "Interview Resume", "Interview Behavioral", "Study Notes", "Web Speech"]) expect(text).not.toContain(gone);
    expect(text).toContain("Signing in with Google");
    expect(text).toContain("legacy CV");
  });
  it("keeps exporting every personal-only table", () => {
    const tables: string[] = JSON.parse(readFileSync("scripts/export-tables.json", "utf8"));
    for (const t of ["profiles", "signins", "app_opens", "apps", "invites", "site_sections", "experience_items", "experience_bullets", "messages", "ops_status", "behavioral_stories", "behavioral_answers", "articles", "projects", "article_pins", "guides", "content_changes", "about_photos"]) expect(tables).toContain(t);
    expect(tables).toHaveLength(18);
  });
});
