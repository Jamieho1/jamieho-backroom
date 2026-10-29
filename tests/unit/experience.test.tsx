// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
let editing = true;
vi.mock("@/components/viewer-provider", () => ({ useViewer: () => ({ editing }) }));

import { ExperienceSection, type ExperienceApi } from "@/components/experience-section";
import { validateItem, emptyItem, type Item } from "@/lib/experience";

const ROLE: Item = { id: "r1", kind: "role", title: "Software Engineer", org: "Acme", dates: "2024 – now", location: "London", summary: "", public: true, sort: 10, bullets: [{ id: "b1", text: "Built a thing", public: true }] };

function fakeApi(overrides: Partial<ExperienceApi> = {}): ExperienceApi {
  return {
    load: vi.fn().mockResolvedValue([ROLE]),
    save: vi.fn().mockImplementation(async (item: Item) => ({ ok: true, message: "Saved.", items: [{ ...item, id: item.id ?? "new1" }] })),
    remove: vi.fn().mockResolvedValue({ ok: true, message: "Deleted.", items: [] }),
    move: vi.fn().mockResolvedValue({ ok: true, message: "", items: [ROLE] }),
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  refresh.mockReset();
  editing = true;
});

describe("Experience for visitors", () => {
  it("shows the public list, and nothing at all when there is no public experience", () => {
    editing = false;
    const { rerender } = render(<ExperienceSection items={[ROLE]} />);
    expect(screen.getByRole("heading", { name: "Experience" })).toBeTruthy();
    expect(screen.getByText("Built a thing")).toBeTruthy();
    rerender(<ExperienceSection items={[]} />);
    expect(screen.queryByRole("heading", { name: "Experience" })).toBeNull();
  });
});

describe("Experience editor", () => {
  it("a new role and its new bullets start hidden", async () => {
    const api = fakeApi({ load: vi.fn().mockResolvedValue([]) });
    render(<ExperienceSection items={[]} api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Add role / project" }));
    const card = screen.getByRole("article", { name: "Experience: new item" });
    expect(within(card).getByText("Hidden")).toBeTruthy();
    expect((within(card).getByLabelText("Show this on the landing page") as HTMLInputElement).checked).toBe(false);
    fireEvent.change(within(card).getByLabelText("Title"), { target: { value: "Engineer" } });
    fireEvent.click(within(card).getByRole("button", { name: "Add bullet" }));
    expect((within(card).getByLabelText("Bullet 1 public") as HTMLInputElement).checked).toBe(false);
    fireEvent.change(within(card).getByLabelText("Bullet 1"), { target: { value: "Did X" } });
    fireEvent.click(within(card).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(api.save).toHaveBeenCalledTimes(1));
    const saved = (api.save as ReturnType<typeof vi.fn>).mock.calls[0][0] as Item;
    expect(saved.public).toBe(false);
    expect(saved.bullets).toEqual([{ text: "Did X", public: false }]);
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("a failed save keeps the edits and offers Retry", async () => {
    const save = vi.fn().mockResolvedValueOnce({ ok: false, message: "Couldn't save. Your changes are still here, try again." }).mockImplementation(async (item: Item) => ({ ok: true, message: "Saved.", items: [item] }));
    render(<ExperienceSection items={[]} api={fakeApi({ save })} />);
    const card = await screen.findByRole("article", { name: "Experience: Software Engineer" });
    fireEvent.change(within(card).getByLabelText("Bullet 1"), { target: { value: "Built a better thing" } });
    fireEvent.click(within(card).getByRole("button", { name: "Save" }));
    const retry = await within(card).findByRole("button", { name: "Retry" });
    expect((within(card).getByLabelText("Bullet 1") as HTMLTextAreaElement).value).toBe("Built a better thing");
    fireEvent.click(retry);
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect((save.mock.calls[1][0] as Item).bullets[0].text).toBe("Built a better thing");
  });

  it("bullets can be reordered and removed before saving", async () => {
    const api = fakeApi({ load: vi.fn().mockResolvedValue([{ ...ROLE, bullets: [{ id: "a", text: "first", public: false }, { id: "b", text: "second", public: true }] }]) });
    render(<ExperienceSection items={[]} api={api} />);
    const card = await screen.findByRole("article", { name: "Experience: Software Engineer" });
    fireEvent.click(within(card).getByRole("button", { name: "Move bullet 2 up" }));
    fireEvent.click(within(card).getByRole("button", { name: "Remove bullet 2" }));
    fireEvent.click(within(card).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(api.save).toHaveBeenCalled());
    expect(((api.save as ReturnType<typeof vi.fn>).mock.calls[0][0] as Item).bullets).toEqual([{ id: "b", text: "second", public: true }]);
  });

  it("delete asks for a second click", async () => {
    const api = fakeApi();
    render(<ExperienceSection items={[]} api={api} />);
    const card = await screen.findByRole("article", { name: "Experience: Software Engineer" });
    fireEvent.click(within(card).getByRole("button", { name: "Delete" }));
    expect(api.remove).not.toHaveBeenCalled();
    fireEvent.click(within(card).getByRole("button", { name: "Click again to delete" }));
    await waitFor(() => expect(api.remove).toHaveBeenCalledWith("r1"));
  });

  it("shows a clear message when the data can't be loaded", async () => {
    render(<ExperienceSection items={[]} api={fakeApi({ load: vi.fn().mockRejectedValue(new Error("down")) })} />);
    expect((await screen.findByRole("alert")).textContent).toMatch(/Can.t reach the data/);
  });
});

describe("validateItem", () => {
  it("needs a title and respects the limits", () => {
    expect(validateItem(emptyItem())).toMatch(/title/);
    expect(validateItem({ ...emptyItem(), title: "x" })).toBeNull();
    expect(validateItem({ ...emptyItem(), title: "x", bullets: [{ text: "y".repeat(1001), public: false }] })).toMatch(/too long/);
  });
});
