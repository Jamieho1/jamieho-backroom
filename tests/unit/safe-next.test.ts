import { describe, it, expect } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext (no open redirects after login)", () => {
  it("keeps same-site paths", () => {
    for(const path of ["/notes","/practices","/practices/217","/behavioral","/desktop?app=notes"])expect(safeNext(path)).toBe(path);
  });
  it("falls back to / for anything else", () => {
    for (const bad of [null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"]) expect(safeNext(bad)).toBe("/");
  });
});
