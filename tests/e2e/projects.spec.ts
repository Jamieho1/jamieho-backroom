import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFileSync } from "node:fs";

/** TKT-83: the /projects list and a project's page, rendered from fixtures (the e2e server has no database). */
let bundle = "";
test.beforeAll(async () => {
  const out = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {ProjectsIndex} from './components/projects/projects-index';import {ProjectCaseStudy} from './components/projects/case-study';import {toSummary} from './lib/project-view';import {ProjectEditor} from './components/portfolio/editor';
const base={body:'',tags:[],screenshots:[],url:'',public:true,sort:100,created_at:'2026-11-01',capabilities:[],status:'',diagram:null};
const gif='data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const diagram={title:'Research pipeline',nodes:[{id:'filings',title:'Filings & transcripts',lines:['SEC 10-K']},{id:'parsing',title:'Document-aware parsing'},{id:'index',title:'Index',lines:['with metadata']},{id:'retrieval',title:'Hybrid retrieval',lines:['BM25 + BGE-M3 in Qdrant'],highlight:true},{id:'rerank',title:'Rerank'},{id:'memo',title:'Investment memo',highlight:true}],edges:[{from:'filings',to:'parsing'},{from:'parsing',to:'index'},{from:'index',to:'retrieval'},{from:'retrieval',to:'rerank'},{from:'rerank',to:'memo',highlight:true}]};
const fin={...base,id:'1',slug:'fin-example',name:'Fin example',tagline:'Budgeting with an AI coach',featured:true,tags:['Next.js','Python'],capabilities:['01','04'],status:'Working prototype · sample data',diagram,body:'Intro paragraph.\\n\\n## The problem\\n\\nA short write-up.\\n\\n## How it works\\n\\n- **Parsing** of filings\\n- **Retrieval** with Qdrant\\n\\n## Stack\\n\\nPython and Next.js.'};
const site={...base,id:'2',slug:'site-example',name:'Site example',tagline:'Has a live website',featured:true,tags:['Volunteer','NLP'],capabilities:['05'],url:'https://www.example.com/app',screenshots:[gif,gif]};
const plain={...base,id:'3',slug:'plain-example',name:'Plain example',tagline:'No screenshots, no capabilities',featured:false,tags:['Python'],body:'## What it does\\n\\nText.'};
const all=[fin,site,plain];
const q=new URLSearchParams(location.search).get('view');
const upload=async(files)=>files.map(f=>({name:f.name,url:'https://example.com/shots/'+f.name}));
const next=(i)=>({...toSummary(all[(i+1)%all.length]),n:((i+1)%all.length)+1});
createRoot(document.getElementById('projects-fixture')).render(<><div className="site-header" /><main className="app-page" data-app="projects"><div className="desktop-app-content app-page-content">{q==='editor'?<ProjectEditor initial={[fin,site]} upload={upload}/>:q==='fin'?<ProjectCaseStudy project={fin} index={1} total={3} next={next(0)}/>:q==='site'?<ProjectCaseStudy project={site} index={2} total={3} next={next(1)}/>:q==='plain'?<ProjectCaseStudy project={plain} index={3} total={3} next={null}/>:q==='empty'?<ProjectsIndex projects={[]}/>:<ProjectsIndex projects={all.map(toSummary)}/>}</div></main></>);`,
      resolveDir: process.cwd(), loader: "tsx",
    },
    bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "projects-fixture", setup(b) {
      b.onResolve({ filter: /components\/viewer-provider$/ }, () => ({ path: "viewer", namespace: "viewer-fixture" }));
      b.onLoad({ filter: /.*/, namespace: "viewer-fixture" }, () => ({ contents: 'export function useViewer(){return {viewer:{status:new URLSearchParams(location.search).has("owner")?"owner":"anonymous"}}}' }));
      b.onResolve({ filter: /app\/actions\/portfolio$/ }, () => ({ path: "actions", namespace: "portfolio-actions" }));
      b.onLoad({ filter: /.*/, namespace: "portfolio-actions" }, () => ({ contents: `let fail=true;export async function saveProject(p){if(fail){fail=false;return {ok:false,message:'Could not save project'}};return {ok:true,project:{...p,created_at:'now'}}}export async function deleteProject(){return {ok:true,message:'Deleted.'}}` }));
      b.onResolve({ filter: /lib\/supabase\/browser$/ }, () => ({ path: "sb", namespace: "sb-fixture" }));
      b.onLoad({ filter: /.*/, namespace: "sb-fixture" }, () => ({ contents: "export function supabaseBrowser(){throw new Error('no storage in tests')}" }));
      b.onResolve({ filter: /^next\/link$/ }, () => ({ path: "link", namespace: "link-fixture" }));
      b.onLoad({ filter: /.*/, namespace: "link-fixture" }, () => ({ resolveDir: process.cwd(), contents: 'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}' }));
    } }],
  });
  bundle = out.outputFiles[0].text;
});

async function mount(page: Page, view = "", owner = false, extra = "") {
  const query = [view && `view=${view}`, owner && "owner=1", extra].filter(Boolean).join("&");
  await page.goto("/privacy" + (query ? `?${query}` : ""));
  await page.addStyleTag({ content: "body > :not(#projects-fixture){display:none!important}\n" + readFileSync("app/projects.css", "utf8") + readFileSync("app/project-pages.css", "utf8") });
  await page.evaluate(() => { const root = document.createElement("div"); root.id = "projects-fixture"; document.body.append(root); });
  await page.route("**/__projects_fixture.js", (r) => r.fulfill({ contentType: "text/javascript", body: bundle }));
  await page.addScriptTag({ url: "/__projects_fixture.js" });
}

test("the index shows the header, count, filters, featured cards and rows, without sideways scroll", async ({ page }) => {
  await mount(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Selected\s*Work/);
  await expect(page.getByText("03 PROJECTS")).toBeVisible();
  const filters = page.getByRole("group", { name: "Filter projects by capability" });
  await expect(filters.getByRole("button")).toHaveCount(6);
  await expect(filters.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".pj-fcard")).toHaveCount(2);
  await expect(page.locator(".pj-fcard").first().getByRole("link", { name: /Case study/ })).toHaveAttribute("href", "/projects/fin-example");
  await expect(page.locator(".pj-fcard[data-slug=site-example] .pj-shot")).toHaveCount(2);
  await expect(page.locator(".pj-fcard[data-slug=fin-example] [data-title-card]")).toBeVisible();
  await expect(page.locator(".pj-rows > li")).toHaveCount(3);
  await expect(page.locator(".pj-row").first()).toHaveAttribute("href", "/projects/fin-example");
  await expect(page.getByRole("link", { name: /Visit Site example/ })).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: /Get in touch/ })).toHaveAttribute("href", "/#contact");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("capability filters are single-select, animate the rows, show the empty state and live in the URL", async ({ page }) => {
  await mount(page);
  const out = page.locator(".pj-rows > li.out");
  await page.getByRole("button", { name: "05 Machine learning & computer vision" }).click();
  await expect(page).toHaveURL(/capability=05/);
  await expect(page.getByRole("button", { name: /^05 / })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  await expect(out).toHaveCount(2);
  await expect(page.locator(".pj-rows > li[data-slug=site-example]")).toBeVisible();
  await expect(page.locator(".pj-rows > li[data-slug=fin-example]")).toBeHidden();
  await expect(page.locator(".pj-fcard[data-slug=fin-example]")).toBeHidden();
  await page.getByRole("button", { name: "02 Production event systems" }).click();
  await expect(page.getByRole("status")).toHaveText("Nothing public here yet.");
  await expect(page.locator(".pj-feat")).toBeHidden();
  await page.getByRole("button", { name: "All" }).click();
  await expect(page).not.toHaveURL(/capability=/);
  await expect(out).toHaveCount(0);
  await expect(page.locator(".pj-fcard")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("a shared ?capability= link opens already filtered; the filters stay inside their row on phones", async ({ page }, info) => {
  await mount(page, "", false, "capability=01");
  await expect(page.getByRole("button", { name: /^01 / })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".pj-rows > li.out")).toHaveCount(2);
  const filters = page.getByRole("group", { name: "Filter projects by capability" });
  if (info.project.name === "phone") {
    expect(await filters.evaluate((el) => el.scrollWidth > el.clientWidth || el.getBoundingClientRect().width <= innerWidth)).toBe(true);
    expect(await filters.evaluate((el) => el.getBoundingClientRect().right <= innerWidth + 1)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("the cursor preview follows the pointer on desktop only", async ({ page }, info) => {
  await mount(page);
  const preview = page.locator(".pj-fp");
  await expect(preview).toHaveCount(1);
  if (info.project.name === "phone") {
    await expect(preview).toBeHidden();
    await expect(preview).toHaveCSS("display", "none");
    return;
  }
  await expect(preview).toHaveCSS("opacity", "0");
  const row = page.locator(".pj-row").nth(2);
  await row.scrollIntoViewIfNeeded();
  await row.hover();
  await expect(preview).toHaveClass(/on/);
  await expect(preview).toHaveCSS("opacity", "1");
  await expect(preview.locator(".pj-fp-slide.on")).toHaveCount(1);
  await page.mouse.move(600, 300);
  await page.mouse.move(640, 320);
  const moved = await preview.evaluate((el) => el.style.transform);
  expect(moved).toMatch(/translate3d/);
  await page.mouse.move(2, 2);
  await expect(preview).not.toHaveClass(/on/);
});

test("with reduced motion the title card, preview and headline do not animate", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page);
  await expect(page.locator(".pj-tc .rdg").first()).toHaveCSS("animation-name", "none");
  if (info.project.name === "desktop") {
    await page.locator(".pj-row").first().hover();
    await expect(page.locator(".pj-fp")).toHaveClass(/on/);
  }
});

test("the case study shows hero, meta grid, title-card fallback, numbered sections with a mini-index, diagram and next project", async ({ page }) => {
  await mount(page, "fin");
  await expect(page.getByRole("heading", { level: 1, name: "Fin example" })).toBeVisible();
  await expect(page.getByText("CASE STUDY · 01")).toBeVisible();
  await expect(page.locator("[data-slot=status]")).toContainText("Working prototype · sample data");
  await expect(page.locator("[data-slot=capabilities]")).toContainText("01 · 04");
  await expect(page.locator("[data-slot=stack]")).toContainText("Next.js");
  await expect(page.locator("[data-slot=links]")).toHaveCount(0);
  await expect(page.locator("[data-visual=title-card] [data-title-card]")).toBeVisible();
  const index = page.getByRole("navigation", { name: "On this page" });
  await expect(index.getByRole("link")).toHaveText(["01The problem", "02How it works", "03Stack"]);
  await expect(page.getByRole("heading", { level: 2, name: "How it works" })).toBeVisible();
  await expect(page.getByRole("link", { name: "← All projects" }).first()).toHaveAttribute("href", "/projects");
  const diagram = page.locator("[data-project-diagram]");
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toHaveClass(/on/);
  await expect(diagram.locator("svg[viewBox]:visible")).toHaveCount(1);
  const next = page.getByRole("link", { name: "Next project: Site example" });
  await next.scrollIntoViewIfNeeded();
  await expect(next).toHaveAttribute("href", "/projects/site-example");
  await expect(next).toContainText("NEXT PROJECT · 02");
  await expect(page.getByRole("link", { name: /Get in touch/ })).toHaveAttribute("href", "/#contact");
  await index.getByRole("link", { name: /Stack/ }).click();
  await expect(page.locator("#stack")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("the next-project preview and the how-it-works diagram respect reduced motion and the viewport", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page, "fin");
  await expect(page.locator("[data-project-diagram]")).toHaveClass(/on/);
  const preview = page.locator(".pj-fp");
  await expect(preview).toHaveCount(1);
  if (info.project.name === "phone") await expect(preview).toBeHidden();
  else {
    const next = page.getByRole("link", { name: /Next project/ });
    await next.scrollIntoViewIfNeeded();
    await next.hover();
    await expect(preview).toHaveClass(/on/);
  }
});

test("a project with a website and screenshots offers the link and a carousel; empty slots stay hidden", async ({ page }) => {
  await mount(page, "site");
  const links = page.locator("[data-slot=links]");
  await expect(links.getByRole("link")).toHaveAttribute("href", "https://www.example.com/app");
  await expect(links.getByRole("link")).toHaveAttribute("target", "_blank");
  await expect(page.locator("[data-slot=status]")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Site example screenshots" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Site example screenshot 1 of 2" })).toBeVisible();
  await expect(page.locator("[data-title-card]")).toHaveCount(0);
});

test("a project with no capabilities, status or website hides those slots and has no next card", async ({ page }) => {
  await mount(page, "plain");
  await expect(page.locator("[data-slot=capabilities]")).toHaveCount(0);
  await expect(page.locator("[data-slot=status]")).toHaveCount(0);
  await expect(page.locator("[data-slot=links]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Next project/ })).toHaveCount(0);
  await expect(page.locator("[data-project-diagram]")).toHaveCount(0);
});

test("no projects yet shows the empty state, and an unknown slug is a 404", async ({ page }) => {
  await mount(page, "empty");
  await expect(page.getByText("Nothing public here yet.")).toBeVisible();
  const res = await page.goto("/projects/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("visitors never see the manage link; the owner gets Edit project; /projects/manage is a 404 for visitors", async ({ page }) => {
  await mount(page, "fin");
  await expect(page.getByRole("link", { name: "Edit project" })).toHaveCount(0);
  await mount(page, "fin", true);
  await expect(page.getByRole("link", { name: "Edit project" })).toHaveAttribute("href", "/projects/manage?edit=fin-example");
  const res = await page.goto("/projects/manage");
  expect(res?.status()).toBe(404);
});

test("the editor keeps a draft after a failed save, uploads and orders screenshots, and Retry saves", async ({ page }) => {
  await mount(page, "editor", true);
  await page.getByRole("button", { name: "New project" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill("Cyterly Demo");
  await expect(page.getByRole("textbox", { name: "URL slug" })).toHaveValue("cyterly-demo");
  await page.getByRole("textbox", { name: /Tagline/ }).fill("GEO for clinics");
  await page.getByRole("textbox", { name: /Tags/ }).fill("Next.js, Python, next.js");
  await page.locator('input[type=file]').setInputFiles([
    { name: "home.png", mimeType: "image/png", buffer: Buffer.from("x") },
    { name: "dashboard.png", mimeType: "image/png", buffer: Buffer.from("x") },
  ]);
  await expect(page.getByRole("img", { name: "Screenshot 2" })).toHaveAttribute("src", "https://example.com/shots/home.png");
  await page.getByRole("button", { name: "Move screenshot 2 up" }).click();
  await expect(page.getByRole("img", { name: "Screenshot 1" })).toHaveAttribute("src", "https://example.com/shots/home.png");
  await page.getByRole("checkbox", { name: "Feature on the homepage journey" }).check();
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(page.getByRole("alert")).toContainText("Could not save project");
  await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Cyterly Demo");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "Manage projects" })).toBeVisible();
  const row = page.getByRole("listitem").filter({ hasText: "Cyterly Demo" });
  await expect(row).toContainText("Hidden");
  await expect(row).toContainText("Featured");
  await page.getByRole("button", { name: "Delete Site example" }).click();
  await page.getByRole("button", { name: "Confirm delete Site example" }).click();
  await expect(page.getByText("Site example")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
