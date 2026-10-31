// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
const server = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ supabaseServer: server }));
import { NotesContent } from "@/app/desktop/notes-content";
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("shows the data-unavailable message when the notes query fails", async () => {
  const order = vi.fn();
  order.mockReturnValueOnce({ order }).mockResolvedValueOnce({data:null,error:{message:"down"}});
  server.mockResolvedValue({from:()=>({select:()=>({order})})});
  render(await NotesContent());
  expect(screen.getByRole("alert").textContent).toMatch(/Can't reach the data right now/);
  expect(screen.getByRole("link", {name:"Try again"}).getAttribute("href")).toBe("/desktop?app=notes");
});
it("shows a true empty state after a successful read", async () => {
  const order = vi.fn();
  order.mockReturnValueOnce({ order }).mockResolvedValueOnce({data:[],error:null});
  server.mockResolvedValue({from:()=>({select:()=>({order})})});
  render(await NotesContent());
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByText("No notes have been added yet.")).toBeTruthy();
});
it("handles connection exceptions without throwing away the desktop", async () => {
  server.mockRejectedValue(new Error("offline"));
  render(await NotesContent());
  expect(screen.getByRole("alert")).toBeTruthy();
});
