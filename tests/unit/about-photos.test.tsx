// @vitest-environment jsdom
import { createRef } from "react";
import { render, act, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { AboutPhotos, type AboutPhotosHandle } from "@/components/journey/about-photos";
import { Markdown } from "@/components/markdown";
afterEach(cleanup);
it("retraces the three-photo strip on reverse scroll and clamps its ends", () => {
  const ref = createRef<AboutPhotosHandle>();
  const { container } = render(<AboutPhotos base="/home-media" ref={ref} />);
  const strip = container.querySelector('ol')!;
  expect(container.querySelectorAll('img')).toHaveLength(3);
  act(() => ref.current!.setProgress(2)); expect(strip.style.transform).toBe('translate3d(-200%, 0, 0)');
  act(() => ref.current!.setProgress(.52)); expect(parseFloat(strip.style.transform.split('(')[1])).toBeCloseTo(-100);
  act(() => ref.current!.setProgress(-1)); expect(strip.style.transform).toBe('translate3d(0%, 0, 0)');
});
it("keeps About markdown formatting without navigation while other markdown retains links", () => {
  const view = render(<Markdown text="An **engineer** at [a company](https://example.com)" disableLinks />);
  expect(view.container.querySelector('strong')?.textContent).toBe('engineer');
  expect(view.container.querySelector('a')).toBeNull();
  view.rerender(<Markdown text="[a company](https://example.com)" />);
  expect(view.container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
});
it("provides a focusable, manually scrollable reduced-motion strip", () => {
  const view = render(<AboutPhotos base="/home-media" still />);
  expect(view.getByRole('region', {name: 'About Jamie in photos'}).getAttribute('tabindex')).toBe('0');
});
