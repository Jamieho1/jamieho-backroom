// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Desktop } from "@/components/desktop";
import { FALLBACK_APPS } from "@/lib/projects";
const log = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@/app/actions/desktop", () => ({ logDesktopOpen: log }));
vi.mock("next/link", () => ({ default: ({ children, prefetch: _prefetch, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => <a {...props}>{children}</a> }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => <button>Theme</button> }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("renders and records deep-linked resource pages without window controls", () => {
  const { container } = render(<Desktop apps={FALLBACK_APPS.slice(0, 2)} initialApp="notes" content={<h1>Note content</h1>} />);
  expect(screen.getByRole("main", { name: "Notes" })).toBeTruthy();
  expect(log).toHaveBeenCalledWith("notes");
  expect(screen.getByRole("heading", { name: "Note content" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Maximise window" })).toBeNull();
  expect(screen.queryByRole("link", { name: "Close window" })).toBeNull();
  expect(container.querySelector(".desktop-window, .desktop-backdrop")).toBeNull();
});
it("never renders or records an inaccessible deep link", () => {
  render(<Desktop apps={FALLBACK_APPS.slice(0, 2)} initialApp="behavioral" />);
  expect(screen.queryByRole("region", { name: "Behavioral" })).toBeNull();
  expect(screen.getByRole("status").textContent).toMatch(/don't have access/);
  expect(log).not.toHaveBeenCalled();
});
it("renders Projects as a plain page without duplicate site navigation", () => {
  render(<Desktop apps={[]} initialApp="projects" content={<h1>Projects content</h1>} />);
  expect(screen.queryByRole("navigation", { name: "Desktop apps" })).toBeNull();
  expect(screen.getByRole("main", { name: "Projects" })).toBeTruthy();
  expect(screen.queryByRole("banner")).toBeNull();
  expect(screen.queryByRole("link", { name: "Close window" })).toBeNull();
});

it("renders built-in server content in its window without an iframe", () => {
  const settings = { ...FALLBACK_APPS[0], id: "settings", name: "Settings", url: "/settings", visibility: "owner_only" as const };
  const { container } = render(<Desktop apps={[settings]} initialApp="settings" content={<h2>Visitors</h2>} />);
  expect(screen.getByRole("region", { name: "Settings" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Visitors" })).toBeTruthy();
  expect(container.querySelector("iframe")).toBeNull();
});
