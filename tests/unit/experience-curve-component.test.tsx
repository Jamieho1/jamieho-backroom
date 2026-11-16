// @vitest-environment jsdom
import React from "react";
import {render,screen} from "@testing-library/react";
import {it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ExperienceCurve} from "@/components/journey/experience-curve";
import {ExperienceIcon} from "@/components/journey/experience-icon";
import {JOURNEY_ICONS} from "@/lib/home-content-schema";
import type {ExperienceStop} from "@/lib/journey/experience-curve";
it("server renders finished, keyboard-accessible cards and public preview markers without JS",()=>{
 const stops:ExperienceStop[]=[{id:'sample',title:'Synthetic engineer',org:'Example',dates:'2024 – Present',icon:'streams-plug',present:true,draftChanged:true,bullets:[{text:'Synthetic proof',draftChanged:true}]},{id:'projects',title:'Projects',org:'',dates:'',icon:'rocket',present:false,project:true,bullets:[]}];
 const html=renderToStaticMarkup(<ExperienceCurve stops={stops} still/>);document.body.innerHTML=html;
 expect(screen.getByRole('button',{name:'Example, 2024 – Present'}).getAttribute('data-present')).toBe('true');expect(screen.getByRole('link',{name:'See the work ↓'}).getAttribute('href')).toBe('#projects');expect(document.querySelectorAll('[data-draft-changed="true"]')).toHaveLength(2);expect(document.querySelectorAll('[hidden]')).toHaveLength(0);expect(html).toContain('stroke-dashoffset:0');
});
it("all eight original icons share a grid and rounded stroke",()=>{
 for(const name of JOURNEY_ICONS){const {container,unmount}=render(<ExperienceIcon name={name}/>);expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24');expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe('1.5');expect(container.querySelector('path')).not.toBeNull();unmount()}
});
