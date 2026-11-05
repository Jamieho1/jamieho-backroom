import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFileSync } from "node:fs";

/** TKT-83: the /projects list and a project's page, rendered from fixtures (the e2e server has no database). */
let bundle = "";
test.beforeAll(async () => {
  const out = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {ProjectList,ProjectDetail} from './components/portfolio/views';
const base={body:'',tags:[],screenshots:[],url:'',public:true,sort:100,created_at:'2026-11-01'};
const fin={...base,id:'1',slug:'fin-example',name:'Fin example',tagline:'Budgeting with an AI coach',featured:true,tags:['Next.js','Python'],body:'## How it works\\n\\nA short write-up.'};
const site={...base,id:'2',slug:'site-example',name:'Site example',tagline:'Has a live website',featured:false,url:'https://www.example.com/app',screenshots:['data:image/gif;base64,R0lGODlhAQABAAAAACw=']};
const q=new URLSearchParams(location.search).get('view');
createRoot(document.getElementById('projects-fixture')).render(<main className="desktop-os"><div className="desktop-app-content">{q==='fin'?<ProjectDetail p={fin}/>:q==='site'?<ProjectDetail p={site}/>:q==='empty'?<ProjectList projects={[]}/>:<ProjectList projects={[fin,site]}/>}</div></main>);`,
      resolveDir: process.cwd(), loader: "tsx",
    },
    bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "projects-fixture", setup(b) {
      b.onResolve({ filter: /^next\/link$/ }, () => ({ path: "link", namespace: "link-fixture" }));
      b.onLoad({ filter: /.*/, namespace: "link-fixture" }, () => ({ resolveDir: process.cwd(), contents: 'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}' }));
    } }],
  });
  bundle = out.outputFiles[0].text;
});

async function mount(page: Page, view = "") {
  await page.goto("/privacy" + (view ? `?view=${view}` : ""));
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
