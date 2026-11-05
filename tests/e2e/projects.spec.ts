import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFileSync } from "node:fs";

/** TKT-83: the /projects list and a project's page, rendered from fixtures (the e2e server has no database). */
let bundle = "";
test.beforeAll(async () => {
  const out = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {ProjectList,ProjectDetail} from './components/portfolio/views';import {ProjectEditor} from './components/portfolio/editor';
const base={body:'',tags:[],screenshots:[],url:'',public:true,sort:100,created_at:'2026-11-01'};
const fin={...base,id:'1',slug:'fin-example',name:'Fin example',tagline:'Budgeting with an AI coach',featured:true,tags:['Next.js','Python'],body:'## How it works\\n\\nA short write-up.'};
const site={...base,id:'2',slug:'site-example',name:'Site example',tagline:'Has a live website',featured:false,url:'https://www.example.com/app',screenshots:['data:image/gif;base64,R0lGODlhAQABAAAAACw=']};
const q=new URLSearchParams(location.search).get('view');
const upload=async(files)=>files.map(f=>({name:f.name,url:'https://example.com/shots/'+f.name}));
createRoot(document.getElementById('projects-fixture')).render(<main className="desktop-os"><div className="desktop-app-content">{q==='editor'?<ProjectEditor initial={[fin,site]} upload={upload}/>:q==='fin'?<ProjectDetail p={fin}/>:q==='site'?<ProjectDetail p={site}/>:q==='empty'?<ProjectList projects={[]}/>:<ProjectList projects={[fin,site]}/>}</div></main>);`,
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

async function mount(page: Page, view = "", owner = false) {
  await page.goto("/privacy" + (view ? `?view=${view}` : "") + (owner ? `${view ? "&" : "?"}owner=1` : ""));
  await page.addStyleTag({ content: "body > :not(#projects-fixture){display:none!important}\n" + readFileSync("app/projects.css", "utf8") });
  await page.evaluate(() => { const root = document.createElement("div"); root.id = "projects-fixture"; document.body.append(root); });
  await page.route("**/__projects_fixture.js", (r) => r.fulfill({ contentType: "text/javascript", body: bundle }));
  await page.addScriptTag({ url: "/__projects_fixture.js" });
}

test("the list shows each project as a card that opens its own page, not the website", async ({ page }) => {
  await mount(page);
  const cards = page.locator(".project-tile");
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText("Fin example");
  await expect(cards.first()).toContainText("Featured");
  await expect(page.getByRole("link", { name: /Fin example/ })).toHaveAttribute("href", "/projects/fin-example");
  await expect(page.getByRole("link", { name: /Site example/ })).toHaveAttribute("href", "/projects/site-example");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("a project without a website says it's coming soon", async ({ page }) => {
  await mount(page, "fin");
  await expect(page.getByRole("heading", { level: 1, name: "Fin example" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "How it works" })).toBeVisible();
  await expect(page.getByText("Website coming soon")).toBeVisible();
  await expect(page.getByRole("link", { name: /Visit website/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "← All projects" }).first()).toHaveAttribute("href", "/projects");
});

test("a project with a website offers Visit website in a new tab", async ({ page }) => {
  await mount(page, "site");
  const visit = page.getByRole("link", { name: /Visit website · example\.com/ });
  await expect(visit).toHaveAttribute("href", "https://www.example.com/app");
  await expect(visit).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("img", { name: "Screenshot of Site example" })).toBeVisible();
});

test("no projects yet shows the empty state, and an unknown slug is a 404", async ({ page }) => {
  await mount(page, "empty");
  await expect(page.getByText("Projects are on their way.")).toBeVisible();
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
