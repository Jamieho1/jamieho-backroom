import { describe, expect, it } from "vitest";
import { ROOM_FRAME, ROOM_OBJECTS, boxStyle, roomOpacity } from "@/lib/journey/room";

describe("journey room (TKT-78)", () => {
  it("maps the agreed objects to pages", () => {
    const by = Object.fromEntries(ROOM_OBJECTS.map((o) => [o.id, o.action]));
    expect(by.monitor).toEqual({ kind: "zoom", href: "/projects" });
    expect(by.tablet).toEqual({ kind: "link", href: "/articles" });
    expect(by.shelf.kind === "menu" && by.shelf.items.map((i) => i.href)).toEqual(["/notes", "/practices", "/behavioral"]);
    expect(by.mic.kind).toBe("socials");
    expect(by.keyboard.kind).toBe("contact");
  });

  it("keeps every object inside the frame", () => {
    for (const o of ROOM_OBJECTS) {
      expect(o.box.x).toBeGreaterThanOrEqual(0);
      expect(o.box.y).toBeGreaterThanOrEqual(0);
      expect(o.box.x + o.box.w).toBeLessThanOrEqual(ROOM_FRAME.w);
      expect(o.box.y + o.box.h).toBeLessThanOrEqual(ROOM_FRAME.h);
    }
  });

  it("positions boxes as frame percentages", () => {
    expect(boxStyle({ x: 640, y: 360, w: 128, h: 72 })).toEqual({ left: "50.000%", top: "50.000%", width: "10.000%", height: "10.000%" });
  });

  it("becomes interactive only once the camera settles", () => {
    expect(roomOpacity(0.5)).toBe(0);
    expect(roomOpacity(0.86)).toBe(0);
    expect(roomOpacity(1)).toBe(1);
  });
});
