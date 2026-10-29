import { describe, it, expect } from "vitest";
import { canOpen, isVisibility, normaliseEmail } from "@/lib/apps";

describe("canOpen mirrors public.can_view_app()", () => {
  const anon = { role: "anonymous" as const };
  const member = { role: "member" as const };
  const invited = { role: "member" as const, invited: true };
  const owner = { role: "owner" as const };
  it.each([
    ["public", [true, true, true, true]],
    ["signed_in", [false, true, true, true]],
    ["invite_only", [false, false, true, true]],
    ["owner_only", [false, false, false, true]],
  ] as const)("%s", (visibility, expected) => {
    expect([anon, member, invited, owner].map((v) => canOpen({ visibility }, v))).toEqual(expected);
  });
});

describe("helpers", () => {
  it("normalises emails and rejects junk", () => {
    expect(normaliseEmail("  Recruiter@Example.COM ")).toBe("recruiter@example.com");
    expect(normaliseEmail("nope")).toBeNull();
    expect(normaliseEmail("a b@c.d")).toBeNull();
  });
  it("knows the visibility values", () => {
    expect(isVisibility("invite_only")).toBe(true);
    expect(isVisibility("everyone")).toBe(false);
  });
});
