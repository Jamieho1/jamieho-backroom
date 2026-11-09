import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { PHONE_STILLS, phoneChapters } from "@/lib/journey/phone";

describe("phone mode (TKT-96)", () => {
  const phone = phoneChapters(HOME_CHAPTERS);
  it("gives every video chapter a still to hold", () => {
    for (const c of HOME_CHAPTERS) if (c.kind === "video") expect(PHONE_STILLS[c.src], c.id).toBeTruthy();
  });
  it("holds the room without text panels and ends on the contact monitor", () => {
    const room = phone.find((c) => c.id === "room")!;
    expect(room.panels ?? []).toEqual([]);
    expect(room.scroll).toBeLessThan(HOME_CHAPTERS.find((c) => c.id === "room")!.scroll);
    const screen = phone.find((c) => c.id === "screen")!;
    expect(screen.scroll).toBeLessThan(1);
  });
  it("leaves the sections and the hero untouched", () => {
    expect(phone.find((c) => c.id === "pivot")).toBe(HOME_CHAPTERS.find((c) => c.id === "pivot"));
    expect(phone[0]).toBe(HOME_CHAPTERS[0]);
  });
});
