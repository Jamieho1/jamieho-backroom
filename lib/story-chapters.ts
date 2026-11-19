/**
 * My story: site_sections.story Markdown → numbered chapters ("## " headings), a reading time and principle cards.
 * Pure and deterministic; fenced code is never mistaken for structure. Chapter splitting is shared with the project
 * case studies (lib/project-sections.ts).
 */
import {headingText,splitCaseBody} from "@/lib/project-sections";

export const WORDS_PER_MINUTE = 200;

export interface Principle {title: string; text: string}
export type StorySegment = {kind: "md"; text: string} | {kind: "principles"; items: Principle[]};
export interface StoryChapter {id: string; n: string; title: string; segments: StorySegment[]}
export interface ParsedStory {intro: string; chapters: StoryChapter[]; words: number; minutes: number}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Words a reader reads: images (captions are not body text), code fences, HTML and Markdown marks are removed. */
export function wordCount(markdown: string): number {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const fenced = fencedLines(lines);
  const text = lines.filter((_, i) => !fenced[i]).join("\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, " ")
    .replace(/[*_`~]/g, "");
  return text.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Whole minutes at ~200 words per minute, never below 1 for a non-empty story; 0 when there is nothing to read. */
export function readingMinutes(markdown: string): number {
  const words = wordCount(markdown);
  return words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const H23 = /^ {0,3}(#{2,3})[ \t]+(.+?)\s*$/;
const ITEM = /^ {0,3}(?:[-*+]|\d+[.)])[ \t]+(.*)$/;

/** Line indexes that are inside (or open/close) a fenced code block. */
function fencedLines(lines: string[]): boolean[] {
  const out: boolean[] = [];
  let fence = "";
  for (const line of lines) {
    const mark = FENCE.exec(line)?.[1];
    let inside = !!fence;
    if (mark) {
      inside = true;
      if (!fence) fence = mark;
      else if (mark[0] === fence[0] && mark.length >= fence.length) fence = "";
    }
    out.push(inside);
  }
  return out;
}

/** "**Title.** rest" / "**Title** — rest" → card parts; otherwise the whole item is the title. */
function bulletToPrinciple(raw: string): Principle {
  const text = raw.trim();
  const bold = /^(\*\*|__)(.+?)\1[ \t]*[.:\-–—]?[ \t]*([\s\S]*)$/.exec(text);
  if (bold) return {title: headingText(bold[2]).replace(/[.:]$/, ""), text: bold[3].trim()};
  return {title: headingText(text), text: ""};
}

/** Cards from a zone's lines: "### " headed blocks, else list items. Leading non-card text is returned as `lead`. */
function zoneToCards(lines: string[]): {lead: string; items: Principle[]} {
  const fenced = fencedLines(lines);
  const headings = lines.map((l, i) => (!fenced[i] && /^ {0,3}###[ \t]+(.+?)\s*$/.exec(l)) || null);
  if (headings.some(Boolean)) {
    const items: Principle[] = [];
    const lead: string[] = [];
    const bodies: string[][] = [];
    lines.forEach((line, i) => {
      const h = headings[i];
      if (h) {items.push({title: headingText(h[1]), text: ""}); bodies.push([]);}
      else (bodies.length ? bodies[bodies.length - 1] : lead).push(line);
    });
    items.forEach((item, k) => {item.text = bodies[k].join("\n").trim();});
    return {lead: lead.join("\n").trim(), items: items.filter(i => i.title)};
  }
  const lead: string[] = [];
  const raws: string[] = [];
  let inList = false;
  lines.forEach((line, i) => {
    const m = !fenced[i] ? ITEM.exec(line) : null;
    if (m) {raws.push(m[1]); inList = true;}
    else if (inList && /^\s+\S/.test(line) && !fenced[i]) raws[raws.length - 1] += " " + line.trim();
    else if (!line.trim()) { /* blank lines separate items without ending the list */ }
    else if (!inList) lead.push(line);
  });
  return {lead: lead.join("\n").trim(), items: raws.map(bulletToPrinciple).filter(i => i.title)};
}

/**
 * A chapter body → Markdown and principle-card segments. Cards come from (a) a chapter titled "Principles", or
 * (b) a "### Principles" heading inside any chapter (until the next "##"/"###"). Each card is a "### " heading with
 * its paragraph, or a list item (bold-led items split into title + text).
 */
export function chapterSegments(body: string, chapterTitle: string): StorySegment[] {
  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  const md = (ls: string[]): StorySegment[] => {const text = ls.join("\n").trim(); return text ? [{kind: "md", text}] : [];};
  const cards = (zone: string[]): StorySegment[] | null => {
    const {lead, items} = zoneToCards(zone);
    return items.length ? [...(lead ? [{kind: "md", text: lead} as StorySegment] : []), {kind: "principles", items}] : null;
  };
  if (/^principles$/i.test(headingText(chapterTitle))) return cards(lines) ?? md(lines);
  const out: StorySegment[] = [];
  let buffer: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = !fenced[i] ? /^ {0,3}###[ \t]+(.+?)\s*$/.exec(lines[i]) : null;
    if (m && /^principles$/i.test(headingText(m[1]))) {
      let end = i + 1;
      while (end < lines.length && !(!fenced[end] && H23.test(lines[end]))) end++;
      const segs = cards(lines.slice(i + 1, end));
      if (segs) {out.push(...md(buffer), ...segs); buffer = []; i = end - 1; continue;}
    }
    buffer.push(lines[i]);
  }
  out.push(...md(buffer));
  return out;
}

export function parseStory(markdown: string): ParsedStory {
  const {intro, sections} = splitCaseBody(markdown);
  return {
    intro,
    chapters: sections.map((s, i) => ({id: s.id, n: pad2(i + 1), title: s.title, segments: chapterSegments(s.body, s.title)})),
    words: wordCount(markdown),
    minutes: readingMinutes(markdown),
  };
}

export const chapterCountLabel = (n: number) => `${n} ${n === 1 ? "chapter" : "chapters"}`;
