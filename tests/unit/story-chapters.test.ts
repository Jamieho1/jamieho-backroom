import {describe,expect,it} from "vitest";
import {chapterCountLabel,chapterSegments,parseStory,readingMinutes,wordCount} from "@/lib/story-chapters";

const words=(n:number)=>Array.from({length:n},(_,i)=>`w${i}`).join(" ");

describe("chapter parsing",()=>{
 it("splits on ## headings into numbered chapters with unique ids; text before the first is the intro",()=>{
  const s=parseStory("Intro line.\n\n## The spark\nA.\n\n## Learning to build\nB.\n\n### Sub\nC.\n\n## The spark\nD.");
  expect(s.intro).toBe("Intro line.");
  expect(s.chapters.map(c=>[c.n,c.id,c.title])).toEqual([["01","the-spark","The spark"],["02","learning-to-build","Learning to build"],["03","the-spark-2","The spark"]]);
  expect(s.chapters[1].segments).toEqual([{kind:"md",text:"B.\n\n### Sub\nC."}]);
 });
 it("ignores ## inside fenced code and returns no chapters for a story without headings",()=>{
  expect(parseStory("## One\n```\n## not a chapter\n```\n").chapters.map(c=>c.title)).toEqual(["One"]);
  const flat=parseStory("Just prose.");
  expect(flat.chapters).toEqual([]);expect(flat.intro).toBe("Just prose.");
  expect(parseStory("").chapters).toEqual([]);expect(parseStory("   \n").minutes).toBe(0);
 });
 it("labels chapter counts",()=>{expect(chapterCountLabel(1)).toBe("1 chapter");expect(chapterCountLabel(6)).toBe("6 chapters");});
});

describe("reading time",()=>{
 it("is whole minutes at 200 words per minute, at least 1, and 0 for nothing",()=>{
  expect(readingMinutes("")).toBe(0);expect(readingMinutes("  \n ")).toBe(0);
  expect(readingMinutes("one two")).toBe(1);
  expect(readingMinutes(words(200))).toBe(1);expect(readingMinutes(words(201))).toBe(2);expect(readingMinutes(words(1200))).toBe(6);
 });
 it("does not count images, link targets, code fences, HTML or Markdown marks",()=>{
  const md=`## Title words\n![caption not counted](https://example.test/a.png)\n\nSee [two words](https://example.test/very/long/url) and **bold** text.\n\n\`\`\`\ncode block words here\n\`\`\`\n\n<span>html</span>\n\n> quote`;
  // Title words(2) · two words(2) and bold text(3: and,bold,text -> 'See two words and bold text.' = 6) · html(1) · quote(1)
  expect(wordCount(md)).toBe(2+6+1+1);
 });
 it("the parsed story carries the same minutes",()=>{expect(parseStory(`## A\n${words(450)}`).minutes).toBe(3);});
});

describe("principles block",()=>{
 const four="### Ship small\nSmall changes are easy to review.\n\n### Own the pager\nYou run what you build.\n\n### Write it down\nDecisions outlive memory.\n\n### Measure first\nNo guessing.";
 it("a chapter titled Principles turns each ### block into a card",()=>{
  const segs=chapterSegments(`Lead in.\n\n${four}`,"Principles");
  expect(segs[0]).toEqual({kind:"md",text:"Lead in."});
  expect(segs[1]).toEqual({kind:"principles",items:[{title:"Ship small",text:"Small changes are easy to review."},{title:"Own the pager",text:"You run what you build."},{title:"Write it down",text:"Decisions outlive memory."},{title:"Measure first",text:"No guessing."}]});
 });
 it("a ### Principles heading in any chapter turns the following bold-led list into cards and resumes Markdown after it",()=>{
  const segs=chapterSegments("Before.\n\n### Principles\n- **Ship small.** Reviewable changes.\n- **Own it** — you run what you build.\n- Plain item\n\n### Afterwards\nMore text.","How I work");
  expect(segs).toEqual([
   {kind:"md",text:"Before."},
   {kind:"principles",items:[{title:"Ship small",text:"Reviewable changes."},{title:"Own it",text:"you run what you build."},{title:"Plain item",text:""}]},
   {kind:"md",text:"### Afterwards\nMore text."},
  ]);
 });
 it("leaves ordinary chapters, ordinary lists and code untouched",()=>{
  expect(chapterSegments("- a\n- b\n\n### Other\nText","How I work")).toEqual([{kind:"md",text:"- a\n- b\n\n### Other\nText"}]);
  expect(chapterSegments("```\n### Principles\n- x\n```","Notes")).toEqual([{kind:"md",text:"```\n### Principles\n- x\n```"}]);
  expect(chapterSegments("Nothing to card here.","Principles")).toEqual([{kind:"md",text:"Nothing to card here."}]);
 });
 it("the parsed story exposes principle segments per chapter",()=>{
  const s=parseStory(`## How I work\n### Principles\n- **One.** First.\n- **Two.** Second.`);
  expect(s.chapters[0].segments).toEqual([{kind:"principles",items:[{title:"One",text:"First."},{title:"Two",text:"Second."}]}]);
 });
});
