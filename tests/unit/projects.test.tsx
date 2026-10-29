// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, within, fireEvent, cleanup } from "@testing-library/react";
import { openState } from "@/components/project-card";
import { parseTags, parseLines, validateCard, FALLBACK_APPS } from "@/lib/projects";
import type { AppRow } from "@/lib/apps";

const ctx = vi.hoisted(() => ({ value: { viewer: { status: "anonymous", name: null }, editing: false, setEditing: () => {}, configured: false } as Record<string, unknown> }));
vi.mock("@/components/viewer-provider", () => ({ useViewer: () => ctx.value }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));
const { ProjectGrid } = await import("@/components/project-grid");

const app = (o: Partial<AppRow>): AppRow => ({ ...FALLBACK_APPS[0], ...o });

describe("openState", () => {
  it("external apps are always a visit link", () => expect(openState(app({ kind: "external", url: "https://x.dev" }), "anonymous", true)).toBe("visit"));
  it("desktop apps say coming soon until the desktop ships", () => expect(openState(app({}), "owner", false)).toBe("soon"));
  it("signed-out visitors are asked to sign in", () => {
    expect(openState(app({ visibility: "signed_in" }), "anonymous", true)).toBe("sign-in");
    expect(openState(app({ visibility: "invite_only" }), "anonymous", true)).toBe("invite-only");
  });
  it("public apps and the owner open directly", () => {
    expect(openState(app({ visibility: "public" }), "anonymous", true)).toBe("open");
    expect(openState(app({ visibility: "invite_only" }), "owner", true)).toBe("open");
    expect(openState(app({ visibility: "signed_in" }), "member", true)).toBe("open");
  });
});

describe("card edits", () => {
  it("parses tags and screenshot lines", () => {
    expect(parseTags(" a, b ,, a")).toEqual(["a", "b"]);
    expect(parseLines("https://a\n\n https://b ")).toEqual(["https://a", "https://b"]);
  });
  it("rejects bad screenshot links and empty names", () => {
    const ok = { name: "N", description: "", tags: [], screenshots: ["https://x.dev/a.png"] };
    expect(validateCard(ok)).toBeNull();
    expect(validateCard({ ...ok, screenshots: ["http://x.dev/a.png"] })).toMatch(/https/);
    expect(validateCard({ ...ok, screenshots: ["javascript:alert(1)"] })).toMatch(/https/);
    expect(validateCard({ ...ok, name: " " })).toMatch(/name/);
  });
});

describe("ProjectGrid", () => {
  afterEach(cleanup);
  it("renders one window per registry row, so a new row is a new card", () => {
    const rows = [...FALLBACK_APPS, app({ id: "new", name: "Brand New", kind: "external", url: "https://new.dev", visibility: "public", tags: ["Go"] })];
    render(<ProjectGrid apps={rows} />);
    expect(screen.getAllByRole("article")).toHaveLength(4);
    const card = screen.getByRole("article", { name: "Brand New" });
    expect(within(card).getByRole("link", { name: "Visit ↗" }).getAttribute("rel")).toBe("noopener noreferrer");
    expect(within(screen.getByRole("article", { name: "Behavioral" })).getByText("Invite-only")).toBeTruthy();
  });
  it("shows an Edit button only in edit mode, and the editor checks links", () => {
    ctx.value = { ...ctx.value, viewer: { status: "owner", name: "J" }, editing: true };
    render(<ProjectGrid apps={[FALLBACK_APPS[0]]} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Notes card" }));
    fireEvent.change(screen.getByLabelText(/Screenshot links/), { target: { value: "ftp://nope" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("status").textContent).toMatch(/https/);
  });
});
