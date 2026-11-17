import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { MEDIA_MANIFEST, mediaUrl, preloadOrder, startProgress, stillFor } from "@/lib/journey/media";

const manifest = { "a-desktop.mp4": { v: "11111111", bytes: 100 }, "b-desktop.mp4": { v: "22222222", bytes: 300 } };

describe("journey media", () => {
  it("versions every URL by content hash and leaves unknown files bare", () => {
    expect(mediaUrl("https://x/home-media", "a-desktop.mp4", manifest)).toBe("https://x/home-media/a-desktop.mp4?v=11111111");
    expect(mediaUrl("/home-media", "nope.jpg", manifest)).toBe("/home-media/nope.jpg");
  });

  it("downloads clips in chapter order (the monitor push-in is the last chapter), once each", () => {
    const order = preloadOrder(HOME_CHAPTERS, "desktop").map((i) => i.src);
    expect(order).toEqual(["c1", "c7a", "c7b"]); // v1.1: video only at the two ends
    expect(preloadOrder(HOME_CHAPTERS, "mobile")[0].file).toBe("c1-mobile.mp4");
  });

  it("moves the computer clip to the front for a /journey#desk link", () => {
    const order = preloadOrder(HOME_CHAPTERS, "desktop", "c7b").map((i) => i.src);
    expect(order[0]).toBe("c7b");
    expect(order.filter((s) => s === "c7b")).toHaveLength(1);
    expect(order).toHaveLength(3);
  });

  it("rings real bytes of the hero clip only", () => {
    const items = [{ src: "a", file: "a-desktop.mp4", bytes: 100 }, { src: "b", file: "b-desktop.mp4", bytes: 300 }];
    expect(startProgress(items, {})).toBe(0);
    expect(startProgress(items, { a: 50, b: 300 })).toBe(0.5);
    expect(startProgress(items, { a: 500 })).toBe(1);
    expect(startProgress([], {})).toBe(0);
  });

  it("picks the still that matches where the visitor is in the chapter", () => {
    expect(stillFor("c3a", 0.1)).toBe("c3a-first.jpg");
    expect(stillFor("c7a", 1)).toBe("c7a-last.jpg");
  });

  it("ships a manifest entry for every file the journey requests", () => {
    for (const v of ["desktop", "mobile"] as const) for (const i of preloadOrder(HOME_CHAPTERS, v)) {
      expect(MEDIA_MANIFEST[i.file]?.bytes, i.file).toBeGreaterThan(0);
      expect(MEDIA_MANIFEST[`${i.src}-first.jpg`], i.src).toBeTruthy();
      expect(MEDIA_MANIFEST[`${i.src}-last.jpg`], i.src).toBeTruthy();
    }
    for (const f of ["still-imperial.jpg", "still-westminster.jpg"]) {
      expect(MEDIA_MANIFEST[f], f).toBeTruthy();
    }
  });
});
