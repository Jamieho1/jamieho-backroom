// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within} from "@testing-library/react";
import type {Project} from "@/lib/portfolio-core";
import {toSummary} from "@/lib/project-view";

vi.mock("@/components/viewer-provider",()=>({useViewer:()=>({viewer:{status:"anonymous",name:null},editing:false,setEditing:()=>{},configured:false})}));
const {ProjectsIndex}=await import("@/components/projects/projects-index");
const {ProjectCaseStudy}=await import("@/components/projects/case-study");

const base={body:"",tags:[] as string[],screenshots:[] as string[],url:"",public:true,sort:100,created_at:"2026-11-01",capabilities:[] as never[],status:"",diagram:null};
const rows:Project[]=[
 {...base,id:"1",slug:"cyterly",name:"Cyterly AI",tagline:"GEO for agencies",featured:true,tags:["GEO","TypeScript"],capabilities:["01","04"],status:"Working prototype · sample data",url:"https://cyte-ai.vercel.app/",screenshots:["https://example.com/a.png"]},
 {...base,id:"2",slug:"datakind-uk",name:"DataKind UK",tagline:"NLP for non-profits",featured:true,tags:["Volunteer","NLP"],capabilities:["05"],screenshots:["https://example.com/1.png","https://example.com/2.png"]},
 {...base,id:"3",slug:"finai",name:"FinAI Analyst Pro",tagline:"AI investment research",featured:false,tags:["Python","RAG"],capabilities:["01","04"]},
];
const finaiBody="## The problem\nRetail investors drown in filings.\n\n## How it works\n- **Parsing** of filings\n- **Retrieval** with Qdrant\n\n## Stack\nPython.";
const diagram={title:"Research pipeline",nodes:[{id:"a",title:"Filings"},{id:"b",title:"Memo",highlight:true}],edges:[{from:"a",to:"b",highlight:true}]};

beforeEach(()=>{window.history.replaceState(null,"","/projects");});
afterEach(cleanup);

describe("ProjectsIndex",()=>{
 const mount=()=>render(<ProjectsIndex projects={rows.map(toSummary)}/>);
 it("shows the header, count, filters, featured cards and the full list",()=>{
  mount();
  expect(screen.getByRole("heading",{level:1}).textContent).toMatch(/Selected\s*Work/);
  expect(screen.getByText("03 PROJECTS")).toBeTruthy();
  const filters=within(screen.getByRole("group",{name:"Filter projects by capability"}));
  expect(filters.getAllByRole("button").map(b=>b.textContent)).toEqual(["All","01 AI engineering","02 Production event systems","03 Cloud architecture","04 Full-stack & delivery","05 Machine learning & computer vision"]);
  expect(filters.getByRole("button",{name:"All"}).getAttribute("aria-pressed")).toBe("true");
  expect(document.querySelectorAll(".pj-fcard")).toHaveLength(2);
  expect(document.querySelectorAll(".pj-rows > li")).toHaveLength(3);
  expect(screen.getAllByRole("link",{name:/Case study/}).map(a=>a.getAttribute("href"))).toEqual(["/projects/cyterly","/projects/datakind-uk"]);
  expect(screen.getByRole("link",{name:/Visit Cyterly AI/}).getAttribute("href")).toBe("https://cyte-ai.vercel.app/");
  expect(screen.getAllByRole("link",{name:/Visit/})).toHaveLength(1);
  expect(screen.getAllByText("01 · 04")).toHaveLength(2);
  expect(screen.getByRole("link",{name:/Get in touch/}).getAttribute("href")).toBe("/#contact");
  expect(document.querySelectorAll('.pj-fcard[data-slug="datakind-uk"] .pj-shot')).toHaveLength(2);
  expect(document.querySelector('.pj-fcard[data-slug="cyterly"] .pj-status')?.textContent).toBe("Working prototype · sample data");
 });
 it("filters to one capability, single-select, and keeps the choice in the URL",()=>{
  mount();
  fireEvent.click(screen.getByRole("button",{name:"05 Machine learning & computer vision"}));
  expect(window.location.search).toBe("?capability=05");
  expect(screen.getByRole("button",{name:/^05 /}).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button",{name:"All"}).getAttribute("aria-pressed")).toBe("false");
  const out=[...document.querySelectorAll(".pj-rows > li.out")].map(li=>li.getAttribute("data-slug"));
  expect(out).toEqual(["cyterly","finai"]);
  fireEvent.click(screen.getByRole("button",{name:"01 AI engineering"}));
  expect(window.location.search).toBe("?capability=01");
  expect(screen.getAllByRole("button",{pressed:true})).toHaveLength(1);
  fireEvent.click(screen.getByRole("button",{name:"All"}));
  expect(window.location.search).toBe("");
  expect(document.querySelectorAll(".pj-rows > li.out")).toHaveLength(0);
 });
 it("reads ?capability= on load and ignores unknown values",()=>{
  window.history.replaceState(null,"","/projects?capability=04");
  mount();
  expect(screen.getByRole("button",{name:/^04 /}).getAttribute("aria-pressed")).toBe("true");
  expect([...document.querySelectorAll(".pj-rows > li.out")].map(li=>li.getAttribute("data-slug"))).toEqual(["datakind-uk"]);
  cleanup();
  window.history.replaceState(null,"","/projects?capability=nope");
  mount();
  expect(screen.getByRole("button",{name:"All"}).getAttribute("aria-pressed")).toBe("true");
 });
 it("shows the empty state when nothing matches or nothing is public",()=>{
  mount();
  fireEvent.click(screen.getByRole("button",{name:"02 Production event systems"}));
  expect(screen.getByRole("status").textContent).toBe("Nothing public here yet.");
  expect(document.querySelector(".pj-feat")?.className).toContain("out");
  cleanup();
  render(<ProjectsIndex projects={[]}/>);
  expect(screen.getByRole("status").textContent).toBe("Nothing public here yet.");
  expect(screen.getByText("00 PROJECTS")).toBeTruthy();
 });
 it("renders the title card for a project with no screenshots and a cursor preview layer",()=>{
  mount();
  expect(document.querySelectorAll("[data-preview='true'] .pj-fp-slide")).toHaveLength(3);
  expect(document.querySelector("[data-preview='true'] [data-title-card='true']")).toBeTruthy();
 });
});

describe("ProjectCaseStudy",()=>{
 const fin:Project={...rows[2],body:finaiBody,diagram};
 it("renders hero, meta grid, title-card fallback, numbered sections with a mini-index, diagram and next project",()=>{
  render(<ProjectCaseStudy project={{...fin,status:"",url:""}} index={3} total={5} next={{...toSummary(rows[0]),n:4}}/>);
  expect(screen.getByText("CASE STUDY · 03")).toBeTruthy();
  expect(screen.getByRole("heading",{level:1,name:"FinAI Analyst Pro"})).toBeTruthy();
  expect(document.querySelector("[data-slot='status']")).toBeNull();
  expect(document.querySelector("[data-slot='links']")).toBeNull();
  expect(document.querySelector("[data-slot='capabilities']")?.textContent).toContain("01 · 04");
  expect(document.querySelector("[data-slot='capabilities']")?.textContent).toContain("Full-stack & delivery");
  expect(document.querySelector("[data-slot='stack']")?.textContent).toContain("RAG");
  expect(document.querySelector("[data-visual='title-card'] [data-title-card='true']")).toBeTruthy();
  const index=within(screen.getByRole("navigation",{name:"On this page"}));
  expect(index.getAllByRole("link").map(a=>a.getAttribute("href"))).toEqual(["#the-problem","#how-it-works","#stack"]);
  expect(screen.getAllByRole("heading",{level:2}).map(h=>h.textContent)).toEqual(expect.arrayContaining(["The problem","How it works","Stack"]));
  expect(document.querySelector("#how-it-works [data-project-diagram='true']")).toBeTruthy();
  expect(document.querySelectorAll("[data-project-diagram='true'] svg[viewBox]")).toHaveLength(2);
  const next=screen.getByRole("link",{name:"Next project: Cyterly AI"});
  expect(next.getAttribute("href")).toBe("/projects/cyterly");expect(next.textContent).toContain("NEXT PROJECT · 04");
 });
 it("shows status and links when present, hides the next card for a lone project, and appends How it works when the body has none",()=>{
  render(<ProjectCaseStudy project={{...rows[0],body:"## What it does\nText.",diagram}} index={1} total={1} next={null}/>);
  expect(document.querySelector("[data-slot='status']")?.textContent).toContain("Working prototype · sample data");
  expect(within(document.querySelector("[data-slot='links']") as HTMLElement).getByRole("link").getAttribute("href")).toBe("https://cyte-ai.vercel.app/");
  expect(document.querySelector("[data-visual='screenshots']")).toBeTruthy();
  expect(screen.queryByRole("link",{name:/Next project/})).toBeNull();
  expect(within(screen.getByRole("navigation",{name:"On this page"})).getAllByRole("link").map(a=>a.getAttribute("href"))).toEqual(["#what-it-does","#how-it-works"]);
 });
 it("omits the mini-index and diagram when there is nothing to show",()=>{
  render(<ProjectCaseStudy project={{...rows[2],body:"Just a paragraph."}} index={3} total={3} next={null}/>);
  expect(screen.queryByRole("navigation",{name:"On this page"})).toBeNull();
  expect(document.querySelector("[data-project-diagram]")).toBeNull();
  expect(screen.getByText("Just a paragraph.")).toBeTruthy();
 });
 it("never renders raw HTML from the body",()=>{
  render(<ProjectCaseStudy project={{...rows[2],body:"## Section\n<script>window.hacked=1</script><img src=x onerror=alert(1)>text"}} index={3} total={3} next={null}/>);
  expect(document.querySelector("script,img[onerror]")).toBeNull();
 });
});
