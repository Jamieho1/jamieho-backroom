import {readFileSync} from "node:fs";
import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { MEDIA_MANIFEST, mediaUrl, preloadOrder, stillFor } from "@/lib/journey/media";

const manifest = { "a-desktop.mp4": { v: "11111111", bytes: 100 }, "b-desktop.mp4": { v: "22222222", bytes: 300 } };

describe("journey media", () => {
  it("versions every URL by content hash and leaves unknown files bare", () => {
    expect(mediaUrl("https://x/home-media", "a-desktop.mp4", manifest)).toBe("https://x/home-media/a-desktop.mp4?v=11111111");
    expect(mediaUrl("/home-media", "nope.jpg", manifest)).toBe("/home-media/nope.jpg");
  });

  it("downloads clips in chapter order (the monitor push-in is the last chapter), once each", () => {
    const order = preloadOrder(HOME_CHAPTERS, "desktop").map((i) => i.src);
    expect(order).toEqual([]); // Only retained room and contact footage; the hero is image based.
    expect(preloadOrder(HOME_CHAPTERS, "mobile")).toEqual([]);
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
    for(const file of ["c1-desktop.mp4","c1-first.jpg","c1-last.jpg","c1-mobile.mp4","still-imperial.jpg","still-westminster.jpg","c7a-mobile.mp4","c7b-mobile.mp4"])expect(MEDIA_MANIFEST[file]).toBeUndefined();
  });
});

it("keeps the service-worker allowlist identical to the retained manifest",()=>{const worker=readFileSync("public/media-sw.js","utf8");const match=/const MEDIA_FILES = new Set\((\[.*?\])\);/.exec(worker);expect(match).toBeTruthy();expect(JSON.parse(match![1]).sort()).toEqual(Object.keys(MEDIA_MANIFEST).sort());expect(worker).toContain('home-media-v2');});
