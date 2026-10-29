import { describe, it, expect } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext (no open redirects after login)", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/desktop?app=notes")).toBe("/desktop?app=notes");
  });
  it("falls back to / for anything else", () => {
    for (const bad of [null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"]) expect(safeNext(bad)).toBe("/");
  });
});
