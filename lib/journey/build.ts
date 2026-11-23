import { z } from "zod";
import defaults from "./build-content.json";

const text=(max:number)=>z.string().trim().min(1).max(max).refine(s=>!s.includes("\0"));
const image=z.string().trim().min(1).max(200).regex(/^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9 _.\/-]*\.(png|webp|jpe?g)$/i,"Use a home-media image path");
const credential=z.object({title:text(160),image:image.optional(),url:z.union([z.literal(""),z.url().refine(value=>{try{const u=new URL(value);return u.protocol==="https:"&&(u.hostname==="www.credly.com"||u.hostname==="credly.com")&&!u.username&&!u.password;}catch{return false;}},"Use an HTTPS Credly URL")])}).strict();
export const buildSchema=z.object({version:z.literal(1),title:text(100),description:text(500),items:z.array(z.object({title:text(120),description:text(600),chips:z.array(text(60)).max(18),languages:z.array(text(40)).max(10),caption:z.string().max(800),diagramTitle:text(120)}).strict()).length(5),certifications:z.array(credential).length(2),ctaTitle:text(120),ctaLabel:text(100)}).strict();
export type BuildContent=z.infer<typeof buildSchema>;
export const DEFAULT_BUILD:BuildContent=buildSchema.parse(defaults);
/** Legacy Markdown remains in the approval audit; only explicit structured content replaces the approved mockup. */
export function parseBuild(body:string):BuildContent {try{return buildSchema.parse(JSON.parse(body));}catch{return DEFAULT_BUILD;}}
export const buildStep=(local:number)=>Math.max(0,Math.min(4,Math.floor(local*5)));
export const buildStepLocal=(index:number)=>(Math.max(0,Math.min(4,index))+.5)/5;
