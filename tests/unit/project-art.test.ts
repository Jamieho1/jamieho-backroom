import { expect, it } from "vitest";
import { projectScreenshots } from "@/lib/project-art";

it("provides the supplied Cyterly screenshot when its public record has none", () => {
  expect(projectScreenshots("cyterly", [])[0]).toMatch(/^\/project-art\/cyterly-action-plan-.*\.webp$/);
});
it("preserves screenshots chosen by the owner", () => {
  expect(projectScreenshots("cyterly", ["https://example.com/owner.webp"])).toEqual(["https://example.com/owner.webp"]);
  expect(projectScreenshots("other", [])).toEqual([]);
});
