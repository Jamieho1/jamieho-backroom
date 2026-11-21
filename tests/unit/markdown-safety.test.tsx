// @vitest-environment jsdom
import { it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Markdown } from "@/components/markdown";

afterEach(cleanup);

it("never renders raw HTML or images from the text", () => {
  const { container } = render(<Markdown text={'<script>alert(1)</script>\n\nHi <b>x</b> ![a](https://evil.example/p.png) and [site](https://example.com)'} />);
  expect(container.querySelector("script, b, img")).toBeNull();
  const a = container.querySelector("a")!;
  expect(a.getAttribute("rel")).toBe("noopener noreferrer");
  expect(a.getAttribute("target")).toBe("_blank");
});
