// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
let editing = true;
vi.mock("@/components/viewer-provider", () => ({ useViewer: () => ({ editing, viewer: { status: editing ? "owner" : "anonymous" } }) }));

import { EditableSection } from "@/components/editable-section";
import { Markdown } from "@/components/markdown";

afterEach(() => {
  cleanup();
  refresh.mockReset();
  editing = true;
});

describe("EditableSection", () => {
  it("visitors see the text and no edit controls", () => {
    editing = false;
    render(<EditableSection sectionKey="about" title="About" body="Hello **world**" />);
    expect(screen.getByRole("heading", { name: "About" })).toBeTruthy();
    expect(screen.getByText("world").tagName).toBe("STRONG");
    expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
  });

  it("a failed save keeps the draft on screen and offers Retry, which then succeeds", async () => {
    const save = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: "Couldn't save. Your text is still here, try again." })
      .mockResolvedValueOnce({ ok: true, message: "Saved." });
    render(<EditableSection sectionKey="about" title="About" body="old" save={save} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit About" }));
    fireEvent.change(screen.getByLabelText("Text (Markdown)"), { target: { value: "my new words" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    // Wait for the save to finish (button re-enabled as "Retry"), not just for the message: on a slow
    // machine the message renders a moment before the transition ends.
    const retry = await screen.findByRole("button", { name: "Retry" });
    expect(screen.getByText(/Couldn't save/)).toBeTruthy();
    expect((screen.getByLabelText("Text (Markdown)") as HTMLTextAreaElement).value).toBe("my new words");
    fireEvent.click(retry);
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save).toHaveBeenLastCalledWith("about", "About", "my new words");
    await screen.findByText("my new words");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("a thrown error (e.g. offline) is treated like a failed save", async () => {
    const save = vi.fn().mockRejectedValue(new Error("offline"));
    render(<EditableSection sectionKey="contact" title="Contact" body="x" save={save} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Contact" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByRole("button", { name: "Retry" });
  });

  it("Cancel restores the saved text", () => {
    render(<EditableSection sectionKey="about" title="About" body="keep me" save={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit About" }));
    fireEvent.change(screen.getByLabelText("Text (Markdown)"), { target: { value: "throw away" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("keep me")).toBeTruthy();
  });
});

describe("Markdown is safe", () => {
  it("never renders raw HTML or images from the text", () => {
    const { container } = render(<Markdown text={'<script>alert(1)</script>\n\nHi <b>x</b> ![a](https://evil.example/p.png) and [site](https://example.com)'} />);
    expect(container.querySelector("script, b, img")).toBeNull();
    const a = container.querySelector("a")!;
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.getAttribute("target")).toBe("_blank");
  });
});
