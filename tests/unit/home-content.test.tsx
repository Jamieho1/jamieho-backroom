// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
let editing = false;
vi.mock("@/components/viewer-provider", () => ({ useViewer: () => ({ editing }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh() {} }) }));
import { EditableSection } from "@/components/editable-section";
afterEach(() => { cleanup(); editing = false; });
it("restores automatic technology evidence immediately when the owner clears custom text", async () => {
  editing = true;
  render(<EditableSection sectionKey="technology" title="Technology" body="Custom text" emptyContent={<p>Automatic project tools</p>} save={async () => ({ ok: true, message: "Saved." })} />);
  fireEvent.click(screen.getByRole("button", { name: "Edit Technology" }));
  fireEvent.change(screen.getByLabelText("Text (Markdown)"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByText("Automatic project tools")).toBeTruthy();
});
