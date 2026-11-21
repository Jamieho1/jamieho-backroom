import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFileSync } from "node:fs";

/**
 * /about, /projects and /projects/[slug] share one type scale (app/page-scale.css). At 1440x900 their sizes sit in the agreed
 * ranges, /projects shows its first featured card above the fold, and photos / screenshots are never cropped.
 * Rendered from fixtures (the e2e server has no database).
 */
let bundle = "";
const svg = (w: number, h: number, c: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/><rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="red" stroke-width="8"/></svg>`;
const STORY = `A short lede paragraph that introduces the story at a comfortable size.\n\n## Learning to build\n${"Chapter text that is long enough to wrap in the reading column. ".repeat(6)}\n\n![Landscape](https://example.test/landscape.svg "A landscape photo")\n\n${"More chapter text between the photographs. ".repeat(6)}\n\n> A pull quote that is set large but not too large.\n\n![Portrait](https://example.test/portrait.svg "A portrait photo")\n\n## Principles\n### Ship small\nSmall changes, shipped often.\n\n### Own it\nYou build it, you run it.\n`;

test.beforeAll(async () => {
  const out = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {Story} from './components/story';import {ProjectsIndex} from './components/projects/projects-index';import {ProjectCaseStudy} from './components/projects/case-study';import {toSummary} from './lib/project-view';
const base={body:'',tags:[],screenshots:[],url:'',public:true,sort:100,created_at:'2026-11-01',capabilities:[],status:'',diagram:null};
const shot=(c)=>'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="1600" height="1200" fill="'+c+'"/><rect x="8" y="8" width="1584" height="1184" fill="none" stroke="red" stroke-width="16"/></svg>');
const fin={...base,id:'1',slug:'finai',name:'FinAI',tagline:'Budgeting with an AI coach',featured:true,tags:['Next.js','Python'],capabilities:['01','04'],status:'Working prototype',body:'Intro paragraph for the project.\\n\\n## The problem\\n\\nA short write-up that is long enough to wrap in the column and show the body size.\\n\\n- **Parsing** of filings\\n- **Retrieval** with Qdrant\\n\\n> Retrieval beats prompting.\\n\\n## Stack\\n\\nPython and Next.js.'};
const dk={...base,id:'2',slug:'datakind-uk',name:'DataKind UK',tagline:'Volunteer data science',featured:true,tags:['Volunteer'],capabilities:['05'],url:'https://www.example.com/app',screenshots:[shot('#649ab0'),shot('#aa7744')],body:'## What\\n\\nText.'};
const all=[fin,dk];const next=(i)=>({...toSummary(all[(i+1)%all.length]),n:((i+1)%all.length)+1});
const q=new URLSearchParams(location.search).get('view');
const sections={about:{key:'about',title:'About',body:''},story:{key:'story',title:'From study to systems',body:${JSON.stringify(STORY)}}};
const el=document.getElementById('scale-fixture');
createRoot(el).render(q==='story'?<main className="app-page story-page" data-app="story"><div className="desktop-app-content app-page-content story-scroll"><Story about={sections.about} story={sections.story}/></div></main>
:<main className="app-page" data-app="projects"><div className="desktop-app-content app-page-content">{q==='fin'?<ProjectCaseStudy project={fin} index={1} total={2} next={next(0)}/>:q==='dk'?<ProjectCaseStudy project={dk} index={2} total={2} next={next(1)}/>:<ProjectsIndex projects={all.map(toSummary)}/>}</div></main>);`,
      resolveDir: process.cwd(), loader: "tsx",
    },
    bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "scale-fixture", setup(b) {
      b.onResolve({ filter: /components\/viewer-provider$/ }, () => ({ path: "viewer", namespace: "viewer-fixture" }));
      b.onLoad({ filter: /.*/, namespace: "viewer-fixture" }, () => ({ contents: 'export function useViewer(){return {viewer:{status:"anonymous"}}}' }));
      b.onResolve({ filter: /^next\/link$/ }, () => ({ path: "link", namespace: "link-fixture" }));
      b.onLoad({ filter: /.*/, namespace: "link-fixture" }, () => ({ resolveDir: process.cwd(), contents: 'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}' }));
    } }],
  });
  bundle = out.outputFiles[0].text;
});

async function mount(page: Page, view: string) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("https://example.test/landscape.svg", (r) => r.fulfill({ contentType: "image/svg+xml", body: svg(1500, 1000, "#7a9eae") }));
  await page.route("https://example.test/portrait.svg", (r) => r.fulfill({ contentType: "image/svg+xml", body: svg(1000, 1500, "#ae9e7a") }));
  await page.goto(`/privacy?view=${view}`);
  await page.addStyleTag({ content: "body > :not(#scale-fixture){display:none!important}body{margin:0}\n" + ["app/page-scale.css", "app/projects.css", "app/project-pages.css", "app/about/story.css"].map((f) => readFileSync(f, "utf8")).join("\n") });
  await page.evaluate(() => { const root = document.createElement("div"); root.id = "scale-fixture"; document.body.append(root); });
  await page.route("**/__scale_fixture.js", (r) => r.fulfill({ contentType: "text/javascript", body: bundle }));
  await page.addScriptTag({ url: "/__scale_fixture.js" });
  await page.evaluate(() => document.fonts?.ready);
}
/** Computed font size and line-height ratio of the first match. */
const size = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => { const c = getComputedStyle(el), fs = parseFloat(c.fontSize); return { fs, lh: c.lineHeight === "normal" ? 1.2 : parseFloat(c.lineHeight) / fs }; });
async function within(page: Page, selector: string, min: number, max: number) {
  const { fs } = await size(page, selector);
  expect(fs, `${selector} is ${fs}px, expected ${min}-${max}px`).toBeGreaterThanOrEqual(min);
  expect(fs, `${selector} is ${fs}px, expected ${min}-${max}px`).toBeLessThanOrEqual(max);
}

test.describe("shared page scale at 1440x900", () => {
  test.beforeEach(async ({}, info) => { test.skip(info.project.name !== "desktop", "1440px desktop sizes"); });

  test("/about: hero, ledes, chapters, quotes, cards and the ending band are in range", async ({ page }) => {
    await mount(page, "story");
    await within(page, ".sty-hero h1", 48, 60);
    await within(page, ".sty-eyebrow", 11, 12);
    await within(page, ".sty-hmeta", 11, 12);
    await within(page, ".sty-lede", 15, 16);
    await within(page, ".sty-ch-h h2", 24, 30);
    await within(page, ".sty-ch .sty-md p", 15, 16);
    expect((await size(page, ".sty-ch .sty-md p")).lh).toBeGreaterThan(1.6);
    expect((await size(page, ".sty-ch .sty-md p")).lh).toBeLessThan(1.7);
    await within(page, ".sty-pq blockquote", 20, 24);
    await within(page, ".sty-pc h3", 18, 20);
    await within(page, ".sty-cta h2", 44, 56);
    expect(await page.locator(".sty-hero").evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))).toBeGreaterThanOrEqual(40);
    expect(await page.locator(".sty-hero").evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))).toBeLessThanOrEqual(56);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("/about photo breaks show the whole photo at its natural aspect ratio, at most 560px wide and 70vh tall, inside the column", async ({ page }) => {
    await mount(page, "story");
    await page.locator(".sty-brk img").first().evaluate((img: HTMLImageElement) => img.decode());
    await page.locator(".sty-brk img").nth(1).evaluate((img: HTMLImageElement) => img.decode());
    const photos = await page.locator(".sty-brk").evaluateAll((figs) => figs.map((fig) => {
      const img = fig.querySelector("img")!, cols = document.querySelector(".sty-cols")!.getBoundingClientRect(), f = fig.getBoundingClientRect();
      const c = getComputedStyle(img);
      return { w: img.offsetWidth, h: img.offsetHeight, nw: img.naturalWidth, nh: img.naturalHeight, fit: c.objectFit, transform: c.transform, figLeft: f.left - cols.left, figRight: f.right - cols.right, figW: f.width, mid: (f.left + f.right) / 2 - (cols.left + cols.right) / 2 };
    }));
    expect(photos).toHaveLength(2);
    for (const p of photos) {
      expect(p.nw).toBeGreaterThan(0);
      expect(p.fit, "no object-fit crop").not.toBe("cover");
      expect(p.transform, "no zoom/parallax transform on the image").toBe("none");
      expect(Math.abs(p.w / p.h - p.nw / p.nh), "natural aspect ratio").toBeLessThan(0.02);
      expect(p.w).toBeLessThanOrEqual(560);
      expect(p.h).toBeLessThanOrEqual(900 * 0.7 + 1);
      expect(p.figLeft).toBeGreaterThanOrEqual(-1);
      expect(p.figRight, "no overhang past the reading column").toBeLessThanOrEqual(1);
      expect(Math.abs(p.mid), "centred in the column").toBeLessThan(2);
    }
    expect(photos[0].w / photos[0].h).toBeGreaterThan(1);
    expect(photos[1].w / photos[1].h).toBeLessThan(1);
    await expect(page.locator(".sty-brk figcaption").first()).toHaveText("A landscape photo");
  });

  test("/projects: hero, cards and band are in range; the first featured card is above the fold; screenshots are whole", async ({ page }) => {
    await mount(page, "index");
    await within(page, ".pj-hd h1", 56, 64);
    await within(page, ".pj-eyebrow", 11, 12);
    await within(page, ".pj-lede", 15, 16);
    await within(page, ".pj-fb h3", 24, 30);
    await within(page, ".pj-cta h2", 44, 56);
    expect(await page.locator(".pj").evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))).toBeGreaterThanOrEqual(40);
    expect(await page.locator(".pj").evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))).toBeLessThanOrEqual(56);
    const top = (await page.locator(".pj-fcard").first().boundingBox())!.y;
    expect(top, `first featured card top is ${top}px`).toBeLessThan(560);
    const shots = page.locator(".pj-fcard[data-slug=datakind-uk] .pj-shot img");
    await expect(shots).toHaveCount(2);
    for (const img of await shots.all()) {
      await img.evaluate((el: HTMLImageElement) => el.decode());
      const fit = await img.evaluate((el: HTMLImageElement) => {
        const box = el.getBoundingClientRect(), s = getComputedStyle(el);
        const scale = Math.min(box.width / el.naturalWidth, box.height / el.naturalHeight);
        return { fit: s.objectFit, drawnW: el.naturalWidth * scale, drawnH: el.naturalHeight * scale, boxW: box.width, boxH: box.height };
      });
      expect(fit.fit).toBe("contain");
      expect(fit.drawnW).toBeLessThanOrEqual(fit.boxW + 0.5);
      expect(fit.drawnH).toBeLessThanOrEqual(fit.boxH + 0.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("/projects/[slug]: name, sub, sections, body, quote and band are in range; carousel screenshots are not cropped", async ({ page }) => {
    await mount(page, "fin");
    await within(page, ".pj-case h1", 44, 52);
    await within(page, ".pj-eyebrow", 11, 12);
    await within(page, ".pj-sub", 15, 16);
    await within(page, ".pj-sx h2.pj-h", 24, 30);
    await within(page, ".pj .md p", 15, 16);
    expect((await size(page, ".pj .md p")).lh).toBeGreaterThan(1.6);
    expect((await size(page, ".pj .md p")).lh).toBeLessThan(1.7);
    await within(page, ".pj .md blockquote", 20, 24);
    await within(page, ".pj-cta h2", 44, 56);
    expect(await page.locator(".pj").evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))).toBeLessThanOrEqual(56);
    await mount(page, "dk");
    const imgs = page.locator(".pj-vis .screenshot-slide img");
    await expect(imgs).toHaveCount(2);
    for (const img of await imgs.all()) expect(await img.evaluate((el) => getComputedStyle(el).objectFit)).toBe("contain");
    const frame = (await page.locator(".pj-vis .screenshot-carousel").boundingBox())!;
    expect(frame.width).toBeLessThanOrEqual(960);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
