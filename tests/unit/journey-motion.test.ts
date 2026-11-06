import { describe, expect, it } from "vitest";
import { GROW, growAt, growTransform, keyTokens, parseRotator, rotatorText, stripKeys } from "@/lib/journey/motion";

describe("journey text motion (TKT-92)", () => {
  it("reads a cycling phrase from {a|b|c}", () => {
    const r = parseRotator("Software engineer in London. I {build|ship|teach} production-grade **AI**.");
    expect(r).toEqual({ before: "Software engineer in London. I ", words: ["build", "ship", "teach"], after: " production-grade AI." });
    expect(rotatorText(r!)).toBe("Software engineer in London. I build production-grade AI.");
    expect(parseRotator("No braces here")).toBeNull();
    expect(parseRotator("Only {one} option")).toBeNull();
  });

  it("marks **keywords** in a statement title", () => {
    expect(keyTokens("From **biomedical engineering** to production")).toEqual([
      { text: "From", key: false }, { text: " ", key: false }, { text: "biomedical", key: true }, { text: " ", key: false },
      { text: "engineering", key: true }, { text: " ", key: false }, { text: "to", key: false }, { text: " ", key: false }, { text: "production", key: false },
    ]);
    expect(stripKeys("From **biomedical** to prod")).toBe("From biomedical to prod");
  });
});

describe("image grows to full screen (TKT-93)", () => {
  it("only grows over the last stretch of a section", () => {
    expect(growAt(0.5)).toBe(0);
    expect(growAt(1 - GROW)).toBe(0);
    expect(growAt(1 - GROW / 2)).toBeCloseTo(0.5);
    expect(growAt(1)).toBe(1);
  });
  it("covers the screen from the box centre without distortion", () => {
    const box = { x: 900, y: 100, w: 400, h: 500 };
    const start = growTransform(box, 1440, 800, 0);
    expect(Math.abs(start.dx) + Math.abs(start.dy)).toBe(0);
    expect(start.scale).toBe(1);
    const end = growTransform(box, 1440, 800, 1);
    expect(end.dx).toBe(720 - 1100);
    expect(end.dy).toBe(400 - 350);
    expect(end.scale).toBeCloseTo(3.6); // max(1440/400, 800/500)
  });
});
