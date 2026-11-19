import {describe,expect,it} from "vitest";
import {CAPABILITY_IDS,CAPABILITY_TITLES,capabilityNumbers,capabilitySearch,filterByCapability,normalizeCapabilities,parseCapabilityParam} from "@/lib/project-capabilities";
import {diagramLabel,diagramSchema,layoutDesktop,layoutMobile,parseDiagram,wrapText,type ProjectDiagram,type Shape} from "@/lib/project-diagram";
import {headingIds,isHowItWorks,miniIndex,splitCaseBody} from "@/lib/project-sections";
import {normalizeProject,projectSchema} from "@/lib/portfolio-core";
import {validateOperations} from "@/lib/content-drafts/allowlist";
import {toSummary} from "@/lib/project-view";

const finai:ProjectDiagram={title:"Research pipeline",nodes:[
 {id:"filings",title:"Filings & transcripts",lines:["SEC 10-K · earnings"]},
 {id:"parsing",title:"Document-aware parsing",lines:["(tables / text)"]},
 {id:"index",title:"Index",lines:["with metadata"]},
 {id:"retrieval",title:"Hybrid retrieval",lines:["BM25 + BGE-M3 in Qdrant","SQL pre-filter in","PostgreSQL / pgvector"],highlight:true},
 {id:"rerank",title:"Rerank"},
 {id:"agent",title:"Research agent",lines:["LangGraph · ReAct","custom tools"]},
 {id:"memo",title:"Investment memo",lines:["a cited source per claim"],highlight:true},
],edges:[["filings","parsing"],["parsing","index"],["index","retrieval"],["retrieval","rerank"],["rerank","agent"],["agent","memo"]].map(([from,to])=>({from,to,...(to==="memo"?{highlight:true}:{})}))};

describe("capability filtering",()=>{
 const rows=[{id:"a",capabilities:["01","04"]},{id:"b",capabilities:["05"]},{id:"c",capabilities:[] as string[]},{id:"d"}];
 it("keeps everything for All and only matching projects for a capability",()=>{
  expect(filterByCapability(rows,null).map(r=>r.id)).toEqual(["a","b","c","d"]);
  expect(filterByCapability(rows,"01").map(r=>r.id)).toEqual(["a"]);
  expect(filterByCapability(rows,"04").map(r=>r.id)).toEqual(["a"]);
  expect(filterByCapability(rows,"05").map(r=>r.id)).toEqual(["b"]);
  expect(filterByCapability(rows,"02")).toEqual([]);
 });
 it("sorts, de-duplicates and ignores invalid capability ids",()=>{
  expect(normalizeCapabilities(["04","01","04","09","x",5])).toEqual(["01","04"]);
  expect(normalizeCapabilities(null)).toEqual([]);
  expect(capabilityNumbers(["04","01"])).toBe("01 · 04");
  expect(capabilityNumbers(undefined)).toBe("");
 });
 it("names the five What I build items",()=>{
  expect(CAPABILITY_IDS).toEqual(["01","02","03","04","05"]);
  expect(CAPABILITY_TITLES["01"]).toBe("AI engineering");
  expect(CAPABILITY_TITLES["05"]).toBe("Machine learning & computer vision");
 });
});

describe("capability URL parameter",()=>{
 it("accepts only 01-05 and treats anything else as All",()=>{
  for(const id of CAPABILITY_IDS)expect(parseCapabilityParam(id)).toBe(id);
  for(const bad of [null,undefined,"","1","06","00","all","01 ","<script>"])expect(parseCapabilityParam(bad)).toBeNull();
  expect(parseCapabilityParam(["03","01"])).toBe("03");
 });
 it("builds a shareable search string",()=>{
  expect(capabilitySearch(null)).toBe("");
  expect(capabilitySearch("04")).toBe("?capability=04");
  expect(parseCapabilityParam(new URLSearchParams(capabilitySearch("02")).get("capability"))).toBe("02");
 });
});

describe("diagram schema",()=>{
 it("accepts the FinAI diagram and returns null for invalid stored data",()=>{
  expect(diagramSchema.safeParse(finai).success).toBe(true);
  expect(parseDiagram(finai)).toEqual(finai);
  expect(parseDiagram(null)).toBeNull();
  expect(parseDiagram({title:"x"})).toBeNull();
 });
 it.each([
  ["no nodes",{...finai,nodes:[]}],
  ["too many nodes",{...finai,nodes:Array.from({length:13},(_,i)=>({id:`n${i}`,title:"N"})),edges:[]}],
  ["duplicate node id",{...finai,nodes:[finai.nodes[0],finai.nodes[0]],edges:[]}],
  ["edge to a missing node",{...finai,edges:[{from:"filings",to:"nowhere"}]}],
  ["self edge",{...finai,edges:[{from:"filings",to:"filings"}]}],
  ["duplicate edge",{...finai,edges:[{from:"filings",to:"parsing"},{from:"filings",to:"parsing"}]}],
  ["bad node id",{...finai,nodes:[{id:"Bad Id",title:"X"}],edges:[]}],
  ["too many lines",{...finai,nodes:[{id:"a",title:"A",lines:["1","2","3","4"]}],edges:[]}],
  ["long title",{...finai,nodes:[{id:"a",title:"x".repeat(81)}],edges:[]}],
  ["padded text",{...finai,nodes:[{id:"a",title:" A"}],edges:[]}],
  ["NUL",{...finai,title:"a\0b"}],
  ["unknown property",{...finai,extra:true}],
  ["unknown node property",{...finai,nodes:[{id:"a",title:"A",html:"<b>"}],edges:[]}],
 ])("rejects %s",(_name,value)=>expect(diagramSchema.safeParse(value).success).toBe(false));
 it("counts Unicode code points, like the database",()=>{
  expect(diagramSchema.safeParse({title:"T",nodes:[{id:"a",title:"😀".repeat(80)}],edges:[]}).success).toBe(true);
  expect(diagramSchema.safeParse({title:"T",nodes:[{id:"a",title:"😀".repeat(81)}],edges:[]}).success).toBe(false);
 });
 it("is accepted by project drafts, with the capability and status fields",()=>{
  const key="22f03f3d-2c25-4750-aa89-7c3addea40e4";
  expect(validateOperations([{op:"update",table:"projects",key,fields:{diagram:finai,capabilities:["01","04"],status:"Working prototype · sample data"}}]).ok).toBe(true);
  expect(validateOperations([{op:"update",table:"projects",key,fields:{diagram:null}}]).ok).toBe(true);
  for(const fields of [{diagram:{title:"x",nodes:[],edges:[]}},{capabilities:["06"]},{capabilities:["01","01"]},{capabilities:["01","02","03","04","05","01"]},{status:"x".repeat(81)},{status:5}])expect(validateOperations([{op:"update",table:"projects",key,fields}]).ok).toBe(false);
 });
 it("keeps the editor schema working without the new fields",()=>{
  const base={id:"22f03f3d-2c25-4750-aa89-7c3addea40e4",slug:"finai",name:"FinAI",tagline:"",body:"",tags:[],screenshots:[],url:"",featured:false,public:true,sort:1};
  expect(projectSchema.safeParse(base).success).toBe(true);
  expect(projectSchema.safeParse({...base,capabilities:["01"],status:"Live",diagram:finai}).success).toBe(true);
 });
});

describe("diagram layout",()=>{
 const texts=(s:Shape|string):string[]=>typeof s==="string"?[s]:s.children.flatMap(texts);
 const count=(s:Shape|string,pred:(s:Shape)=>boolean):number=>typeof s==="string"?0:(pred(s)?1:0)+s.children.reduce<number>((n,c)=>n+count(c,pred),0);
 it("draws every node and edge for the wide and narrow views",()=>{
  for(const layout of [layoutDesktop(finai),layoutMobile(finai)]){
   expect(count(layout.svg,s=>s.tag==="rect")).toBe(7);
   expect(count(layout.svg,s=>s.tag==="path")).toBe(6);
   expect(count(layout.svg,s=>s.tag==="g"&&String(s.props.className).startsWith("nd hi"))).toBe(2);
   expect(count(layout.svg,s=>s.tag==="g"&&s.props.className==="ed g")).toBe(1);
   expect(texts(layout.svg)).toEqual(expect.arrayContaining(["Rerank","Hybrid retrieval","PostgreSQL / pgvector","a cited source per claim"]));
   expect(layout.svg.props.role).toBe("img");
  }
 });
 it("wraps the wide view at four per row and stacks the narrow view",()=>{
  const wide=layoutDesktop(finai),narrow=layoutMobile(finai);
  expect(wide.width).toBe(920);expect(narrow.width).toBe(360);
  expect(narrow.height).toBeGreaterThan(wide.height);
  const rects=(s:Shape|string):Shape[]=>typeof s==="string"?[]:[...(s.tag==="rect"?[s]:[]),...s.children.flatMap(rects)];
  expect(new Set(rects(wide.svg).map(r=>r.props.y)).size).toBe(2);
  expect(new Set(rects(narrow.svg).map(r=>r.props.y)).size).toBe(7);
  for(const r of rects(wide.svg))expect(Number(r.props.x)+Number(r.props.width)).toBeLessThanOrEqual(920.5);
 });
 it("describes the flow for assistive technology",()=>{
  const label=diagramLabel(finai);
  expect(label).toContain("Research pipeline.");expect(label).toContain("Rerank goes to Research agent, LangGraph · ReAct, custom tools");
 });
 it("wraps text on word boundaries",()=>{
  expect(wrapText("Document-aware parsing pipeline",15)).toEqual(["Document-aware","parsing","pipeline"]);
  expect(wrapText("Supercalifragilistic",5)).toEqual(["Supercalifragilistic"]);
 });
});

describe("case-study sections and mini-index",()=>{
 const body="Intro line.\n\n## The problem\nText.\n\n## How it works\n- **One** step\n\n```\n## not a heading\n```\n\n### Sub heading\n\n## The problem\nAgain.\n\n## **Bold** [link](https://example.com) title ##";
 it("builds the mini-index from ## headings only",()=>{
  expect(miniIndex(body)).toEqual([{id:"the-problem",title:"The problem"},{id:"how-it-works",title:"How it works"},{id:"the-problem-2",title:"The problem"},{id:"bold-link-title",title:"Bold link title"}]);
  expect(miniIndex("No headings at all.")).toEqual([]);
 });
 it("splits intro and section bodies, keeping fenced code and deeper headings",()=>{
  const split=splitCaseBody(body);
  expect(split.intro).toBe("Intro line.");
  expect(split.sections).toHaveLength(4);
  expect(split.sections[1].body).toContain("## not a heading");
  expect(split.sections[1].body).toContain("### Sub heading");
  expect(split.sections[0].body).toBe("Text.");
 });
 it("makes unique, URL-safe ids",()=>{
  expect(headingIds(["A b","A b","???"])).toEqual(["a-b","a-b-2","section"]);
  expect(isHowItWorks("How it works")).toBe(true);expect(isHowItWorks("The problem")).toBe(false);
 });
 it("handles Windows line endings and an empty body",()=>{
  expect(miniIndex("## One\r\ntext\r\n## Two\r\n")).toEqual([{id:"one",title:"One"},{id:"two",title:"Two"}]);
  expect(splitCaseBody("")).toEqual({intro:"",sections:[]});
 });
});

describe("project rows",()=>{
 it("tolerates a database without the case-study columns and ignores an invalid stored diagram",()=>{
  const row={id:"i",slug:"s",name:"N",tagline:"",body:"",tags:[],screenshots:[],url:"",featured:false,public:true,sort:1,created_at:""};
  expect(normalizeProject(row)).toMatchObject({capabilities:[],status:"",diagram:null});
  expect(normalizeProject({...row,capabilities:["04","01"],status:"Live",diagram:{bad:true}} as never)).toMatchObject({capabilities:["01","04"],status:"Live",diagram:null});
  expect(toSummary(normalizeProject({...row,capabilities:["05"]})).capabilities).toEqual(["05"]);
 });
});
