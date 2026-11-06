import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { PHONE_STILLS, phoneChapters } from "@/lib/journey/phone";

describe("phone mode (TKT-96)", () => {
  const phone = phoneChapters(HOME_CHAPTERS);
  it("gives every video chapter a still to hold", () => {
    for (const c of HOME_CHAPTERS) if (c.kind === "video") expect(PHONE_STILLS[c.src], c.id).toBeTruthy();
  });
  it("shows the desk panels from early in the chapter, in order, and ends on a short monitor beat", () => {
    const room = phone.find((c) => c.id === "room")!;
    const [now, contact] = room.panels!;
    expect(now.from).toBeLessThan(0.2);
    expect(now.to).toBeLessThan(contact.from);
    expect(contact.to).toBeLessThanOrEqual(1);
    expect(room.scroll).toBeLessThan(HOME_CHAPTERS.find((c) => c.id === "room")!.scroll);
    const screen = phone.find((c) => c.id === "screen")!;
    expect(screen.scroll).toBeLessThan(1);
  });
  it("leaves the sections and the hero untouched", () => {
    expect(phone.find((c) => c.id === "pivot")).toBe(HOME_CHAPTERS.find((c) => c.id === "pivot"));
    expect(phone[0]).toBe(HOME_CHAPTERS[0]);
  });
});
