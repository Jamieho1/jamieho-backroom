// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
let editing = false;
vi.mock("@/components/viewer-provider", () => ({ useViewer: () => ({ editing }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh() {} }) }));
import { HomeEditableStop } from "@/components/home/content";
import { EditableSection } from "@/components/editable-section";
afterEach(() => { cleanup(); editing = false; });
it("keeps empty interests unpublished and lets the owner reach its editor", () => {
  const section = { key: "interests" as const, title: "Interests", body: "" };
  const { rerender } = render(<HomeEditableStop section={section} />);
  expect(screen.queryByRole("heading", { name: "Interests" })).toBeNull();
  editing = true; rerender(<HomeEditableStop section={section} />);
  fireEvent.click(screen.getByRole("button", { name: "Edit Interests" }));
  expect(screen.getByLabelText("Text (Markdown)")).toBeTruthy();
});
it("shows public interests only when database text exists", () => {
  render(<HomeEditableStop section={{ key: "interests", title: "Interests", body: "Example **topic**" }} />);
  expect(screen.getByText("topic").tagName).toBe("STRONG");
  expect(screen.queryByRole("button")).toBeNull();
});
it("restores automatic technology evidence immediately when the owner clears custom text", async () => {
  editing = true;
  render(<EditableSection sectionKey="technology" title="Technology" body="Custom text" emptyContent={<p>Automatic project tools</p>} save={async () => ({ ok: true, message: "Saved." })} />);
  fireEvent.click(screen.getByRole("button", { name: "Edit Technology" }));
  fireEvent.change(screen.getByLabelText("Text (Markdown)"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByText("Automatic project tools")).toBeTruthy();
});
