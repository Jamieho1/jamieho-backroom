// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NotesReader } from "@/components/notes/reader";
import { parseVisuals, type NoteRow } from "@/lib/notes";
import { splitConcepts } from "@/lib/notes/concepts";
import { highlightPython } from "@/components/notes/code-highlight";
import { Markdown } from "@/components/notes/markdown";
const visual = { kind: "array", title: "Walk a list", concept: "Walk", values: [2,4], frames: [{ caption: "Start", pointers:[{name:"i",index:0}] }, {caption:"Move", pointers:[{name:"i",index:1}]}] };
const note: NoteRow = { id: "arrays-hashing", title: "Arrays", body: 'Intro\n\n### 1. Walk\n- *When*: read each value\n\n**Time** O(n) **Space** O(1)\n\n```python\ndef visit(items):\n    return len(items)\n```\n\nContains Duplicate', visual: [visual], sort:10, updated_at:"2026-10-31T00:00:00Z" };
afterEach(cleanup);
it("starts concept cards closed and opens/closes all without edit or AI controls", () => {
  render(<NotesReader notes={[note]} />);
  expect(screen.getByRole("button", {name:/1\. Walk/}).getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(screen.getByRole("button", {name:"Open all"}));
  expect(screen.getByRole("button", {name:/1\. Walk/}).getAttribute("aria-expanded")).toBe("true");
  expect(document.querySelector(".tk-kw")?.textContent).toBe("def");
  expect(screen.getAllByRole("link", {name:/Contains Duplicate/})[0].getAttribute("href")).toBe("https://leetcode.com/problems/contains-duplicate/");
  expect(screen.queryByRole("button", {name:/edit|save|draft|AI/i})).toBeNull();
  fireEvent.click(screen.getByRole("button", {name:"Close all"}));
  expect(screen.queryByText("def visit(items):")).toBeNull();
});
it("searches notes and changes topics", () => {
  render(<NotesReader notes={[note,{...note,id:"other",title:"Other",body:"A different note"}]} />);
  const nav = screen.getByRole("navigation", {name:"Coding topics"});
  fireEvent.change(screen.getByRole("searchbox"), {target:{value:"different"}});
  expect(within(nav).queryByRole("button",{name:"Arrays"})).toBeNull();
  fireEvent.click(within(nav).getByRole("button",{name:"Other"}));
  expect(screen.getByRole("heading",{name:"Other"})).toBeTruthy();
});
it("Recall mode hides content until explicitly revealed", () => {
  render(<NotesReader notes={[note]} />);
  fireEvent.click(screen.getByRole("button",{name:"Recall mode"}));
  fireEvent.click(screen.getByRole("button",{name:"Open all"}));
  expect(screen.getAllByRole("button",{name:/Reveal/}).length).toBeGreaterThan(0);
  fireEvent.keyDown(screen.getAllByRole("button",{name:/Reveal/})[0],{key:"Enter"});
  expect(document.querySelector(".recall.open")).toBeTruthy();
});
it("opens a concept's visual and steps through its frames", () => {
  render(<NotesReader notes={[note]} />);
  fireEvent.click(screen.getByRole("button",{name:"Visual ▸"}));
  expect(screen.getByRole("combobox",{name:"Concept"})).toBeTruthy();
  expect(screen.getByText("Start")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"Next frame"}));
  expect(screen.getByText("Move")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"Previous frame"}));
  expect(screen.getByText("Start")).toBeTruthy();
});
it("handles no notes and malformed visuals without losing the text", () => {
  const {unmount}=render(<NotesReader notes={[]} />);
  expect(screen.getByText("No notes have been added yet.")).toBeTruthy(); unmount();
  render(<NotesReader notes={[{...note,visual:"broken"}]} />);
  fireEvent.click(screen.getByRole("tab",{name:"Visuals"}));
  expect(screen.getByRole("status").textContent).toMatch(/could not be loaded/);
});
it("validates the artifact visual format and preserves Python source exactly", () => {
  expect(parseVisuals(JSON.stringify(visual)).visuals).toHaveLength(1);
  expect(parseVisuals([{kind:"graph",nodes:[],frames:[]}]).invalid).toBe(true);
  const code='def read(items):\n    # note\n    return len(items) + 2\n';
  expect(highlightPython(code).map(s=>s.text).join('')).toBe(code);
});
it("does not turn headings inside code fences into cards or render raw HTML", () => {
  expect(splitConcepts('```python\n### fake\n```\n### 1. Real\nText').sections).toHaveLength(1);
  const {container}=render(<Markdown text={'<script>alert(1)</script>\n\n[bad](javascript:alert)'} />);
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelector('a')).toBeNull();
});
