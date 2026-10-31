// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Desktop } from "@/components/desktop";
import { FALLBACK_APPS } from "@/lib/projects";
const log = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@/app/actions/desktop", () => ({ logDesktopOpen: log }));
vi.mock("next/link", () => ({ default: ({ children, prefetch: _prefetch, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => <a {...props}>{children}</a> }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => <button>Theme</button> }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("opens and records deep-linked internal apps, with maximise and close controls", () => {
  render(<Desktop apps={FALLBACK_APPS.slice(0, 2)} initialApp="notes" />);
  expect(screen.getByRole("region", { name: "Notes" })).toBeTruthy();
  expect(log).toHaveBeenCalledWith("notes");
  fireEvent.click(screen.getByRole("button", { name: "Maximise window" }));
  expect(screen.getByRole("button", { name: "Restore window" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Close window" }).getAttribute("href")).toBe("/desktop");
});
it("never renders or records an inaccessible deep link", () => {
  render(<Desktop apps={FALLBACK_APPS.slice(0, 2)} initialApp="behavioral" />);
  expect(screen.queryByRole("region", { name: "Behavioral" })).toBeNull();
  expect(screen.getByRole("status").textContent).toMatch(/don't have access/);
  expect(log).not.toHaveBeenCalled();
});
it("external apps open a new tab and record the click", () => {
  const external = { ...FALLBACK_APPS[0], id: "external", name: "Outside", kind: "external" as const, url: "https://example.com" };
  render(<Desktop apps={[external]} />);
  const link = screen.getAllByRole("link", { name: "Outside ↗" })[0];
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  fireEvent.click(link);
  expect(log).toHaveBeenCalledWith("external");
});

it("renders built-in server content in its window without an iframe", () => {
  const settings = { ...FALLBACK_APPS[0], id: "settings", name: "Settings", url: "/settings", visibility: "owner_only" as const };
  const { container } = render(<Desktop apps={[settings]} initialApp="settings" content={<h2>Visitors</h2>} />);
  expect(screen.getByRole("region", { name: "Settings" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Visitors" })).toBeTruthy();
  expect(container.querySelector("iframe")).toBeNull();
});
