import {it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {readFileSync} from "node:fs";
import {DEFAULT_BUILD,buildSchema,parseBuild,buildStep,buildStepLocal} from "@/lib/journey/build";
import {WhatIBuild} from "@/components/journey/what-i-build";
import {CtaBanner} from "@/components/journey/cta-banner";
import {HOME_CHAPTERS} from "@/lib/journey/chapters";
import {withContent} from "@/lib/journey/content";
it("matches the five approved capabilities and keeps languages first",()=>{expect(DEFAULT_BUILD.items.map(i=>i.title)).toEqual(["AI engineering","Production event systems","Cloud architecture","Full-stack & delivery","Machine learning & computer vision"]);const html=renderToStaticMarkup(<WhatIBuild data={DEFAULT_BUILD} still/>);expect(html.indexOf('Languages')).toBeLessThan(html.indexOf('>React<'));expect(html).not.toContain('href="#home-contact"');expect(html).not.toContain('wib-cta');expect(html).not.toContain('journey-toolkit');});
it("roundtrips editable content and confines credential links to HTTPS Credly",()=>{expect(parseBuild(JSON.stringify(DEFAULT_BUILD))).toEqual(DEFAULT_BUILD);expect(parseBuild("## old Markdown")).toEqual(DEFAULT_BUILD);for(const url of ['http://www.credly.com/x','https://evil.test/x','javascript:alert(1)','https://www.credly.com@evil.test/x']){const data=structuredClone(DEFAULT_BUILD);data.certifications[0].url=url;expect(buildSchema.safeParse(data).success).toBe(false);}const extra={...DEFAULT_BUILD,unexpected:true};expect(buildSchema.safeParse(extra).success).toBe(false);});
it("empty credentials are plain tiles; configured credentials open safely in a new tab",()=>{const data=structuredClone(DEFAULT_BUILD);let html=renderToStaticMarkup(<WhatIBuild data={data} still/>);expect(html).not.toContain('Verify on Credly');expect(html).not.toContain('href="https://www.credly');data.certifications[0].url='https://www.credly.com/badges/synthetic';html=renderToStaticMarkup(<WhatIBuild data={data} still/>);expect(html).toContain('href="https://www.credly.com/badges/synthetic"');expect(html).toContain('target="_blank" rel="noopener noreferrer"');});
it("maps forward/reverse scroll and row seeks onto all five steps",()=>{for(let i=0;i<5;i++)expect(buildStep(buildStepLocal(i))).toBe(i);expect(buildStep(-1)).toBe(0);expect(buildStep(1)).toBe(4);expect([.95,.7,.5,.3,.1].map(buildStep)).toEqual([4,3,2,1,0]);});
it("never includes confidential employer or CRM terminology in capability content or diagrams",()=>{const files=['lib/journey/build-content.json','lib/journey/build-diagrams.json','components/journey/what-i-build.tsx'];const text=files.map(f=>readFileSync(f,'utf8')).join('\n');for(const banned of ['Salesforce','Wealthbox','Single Event API','Normalizer','reconciliation ID'])expect(text.toLowerCase()).not.toContain(banned.toLowerCase());});
it("draws every static diagram and keeps text escaped",()=>{const data=structuredClone(DEFAULT_BUILD);data.items[0].description='<script>alert(1)</script>';const html=renderToStaticMarkup(<WhatIBuild data={data} still/>);expect(html).toContain('&lt;script&gt;');expect(html.match(/data-diagram=/g)).toHaveLength(5);expect(html).not.toContain('href="#credly');});

it("places credentials in the Cloud copy and never embeds HTML into diagram geometry",()=>{const html=renderToStaticMarkup(<WhatIBuild data={DEFAULT_BUILD} still/>);expect(html).toContain('class="build-credentials"');expect(html).not.toContain('foreignObject');});

it("renders the contact CTA as its own banner section with the strong pill, outside What I build",()=>{
 const html=renderToStaticMarkup(<CtaBanner title={DEFAULT_BUILD.ctaTitle} label={DEFAULT_BUILD.ctaLabel}/>);
 expect(html).toContain('class="cta-banner"');expect(html).toContain('Have a project in mind?');expect(html).toContain('primary-strong');expect(html).toContain('href="#home-contact"');expect(html).toContain('data-contact-jump');expect(html).not.toContain('cta-support');
 const chapters=withContent(HOME_CHAPTERS.filter(c=>c.id==='toolkit'||c.id==='cta'),{sections:{technology:{title:'',body:JSON.stringify({...DEFAULT_BUILD,ctaTitle:'Owner title',ctaLabel:'Owner label'})}} as never,experience:[],technologies:[]});
 const ids=chapters.map(c=>c.id);expect(ids.indexOf('cta')).toBe(ids.indexOf('toolkit')+1);
 const cta=chapters.find(c=>c.id==='cta');expect(cta&&cta.kind==='section'&&cta.cta).toEqual({title:'Owner title',label:'Owner label'});
 expect(chapters.find(c=>c.id==='toolkit')).not.toHaveProperty('cta');
});
