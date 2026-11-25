import {APP_ALLOWLIST,isAppTable,appOperationSchema} from "./app-allowlist";
import { z } from "zod";
import {photoFields,JOURNEY_ICONS,journeyPhotoPath} from "@/lib/home-content-schema";
import { projectSchema } from "@/lib/portfolio-core";
import { articleSchema, articleObject } from "@/lib/articles";
import { guideSchema, guideObject } from "@/lib/guides";
import { seriesSchema } from "@/lib/content-series-data";
import { KINDS, LIMITS } from "@/lib/experience";
import { SECTION_KEYS, MAX_BODY, MAX_TITLE } from "@/lib/sections";

// Match PostgreSQL char_length (Unicode code points), including rejection of JSON NUL.
const text = (max: number) => z.string().refine(value => !value.includes("\0"), "Text cannot contain NUL.")
  .refine(value => Array.from(value).length <= max, `Text must be ${max} characters or fewer.`);
const cvText = (max: number) => z.string().refine(value => value.length <= max, `Text must be ${max} characters or fewer.`).refine(value => !value.includes("\0"), "Text cannot contain NUL.").transform(value => value.trim());
const uuid = z.uuid().transform(value => value.toLowerCase());
const sort = z.number().int().min(-2147483648).max(2147483647);
const itemFields = { show_on_journey:z.boolean(), journey_icon:z.enum(JOURNEY_ICONS), journey_photo:journeyPhotoPath, kind: z.enum(KINDS), title: cvText(LIMITS.title).refine(value => !!value, "Give it a title first."), org: cvText(LIMITS.org), dates: cvText(LIMITS.dates), location: cvText(LIMITS.location), summary: cvText(LIMITS.summary), sort, public: z.boolean() };
const bulletFields = { item_id: uuid, text: cvText(LIMITS.bullet).refine(value => !!value, "Give the bullet text."), sort, public: z.boolean() };
const cvRoutes = ["/", "/journey", "/about"] as const;
export const publishingSchemas = {projects:projectSchema,articles:articleSchema,guides:guideSchema,content_series:seriesSchema};
export type PublishingTable = keyof typeof publishingSchemas;
export const isPublishingTable = (table:string):table is PublishingTable => Object.hasOwn(publishingSchemas,table);
const projectFields=projectSchema.omit({id:true}).shape;
const articleFields=articleObject.omit({id:true}).shape;
const guideFields=guideObject.omit({id:true}).shape;
const seriesFields=seriesSchema.omit({id:true}).shape;
/** Hub pages whose data changes with posts, guides and series (the series page itself is added per slug). */
const hubRoutes=["/content","/content/series","/content/guides"] as const;
export const CONTENT_ALLOWLIST = {
  ...APP_ALLOWLIST,
  about_photos:{key:uuid,fields:photoFields,operations:["insert","update","delete"] as const,routes:["/","/about","/journey"] as const},
  projects: {key:uuid,fields:projectFields,operations:["insert","update","delete"] as const,routes:["/projects","/","/journey"] as const},
  articles: {key:uuid,fields:articleFields,operations:["insert","update","delete"] as const,routes:["/articles","/","/journey",...hubRoutes] as const},
  guides: {key:uuid,fields:guideFields,operations:["insert","update","delete"] as const,routes:["/guides","/resources",...hubRoutes] as const},
  content_series: {key:uuid,fields:seriesFields,operations:["insert","update","delete"] as const,routes:hubRoutes},
  site_sections: {
    key: z.enum(SECTION_KEYS),
    fields: { title: text(MAX_TITLE), body: text(MAX_BODY) },
    operations: ["update"] as const,
    routes: ["/", "/journey", "/about"] as const,
  },
  experience_items: { key: uuid, fields: itemFields, operations: ["insert", "update"] as const, routes: cvRoutes },
  experience_bullets: { key: uuid, fields: bulletFields, operations: ["insert", "update", "delete"] as const, routes: cvRoutes },
} as const;
const photoInsert=z.object({op:z.literal('insert'),table:z.literal('about_photos'),key:uuid,fields:z.object(photoFields).partial().extend({path:photoFields.path,alt:photoFields.alt}).strict()}).strict();
const photoUpdate=z.object({op:z.literal('update'),table:z.literal('about_photos'),key:uuid,fields:z.object(photoFields).partial().strict().refine(f=>Object.keys(f).length>0,'Choose at least one editable field.')}).strict();
const photoDelete=z.object({op:z.literal('delete'),table:z.literal('about_photos'),key:uuid,fields:z.object({}).strict().default({})}).strict();
const section = CONTENT_ALLOWLIST.site_sections;
const sectionOperation = z.object({
  op: z.literal(section.operations[0], { error: "Only update operations are supported for site_sections." }),
  table: z.literal("site_sections", { error: "Unknown content table." }),
  key: section.key,
  fields: z.object(section.fields).partial().strict().refine(fields => Object.keys(fields).length > 0, "Choose at least one editable field."),
}).strict();
const itemInsert = z.object({op:z.literal("insert"),table:z.literal("experience_items"),key:uuid,fields:z.object(itemFields).partial().extend({title:itemFields.title}).strict()}).strict();
const itemUpdate = z.object({op:z.literal("update"),table:z.literal("experience_items"),key:uuid,fields:z.object(itemFields).partial().strict().refine(fields=>Object.keys(fields).length>0,"Choose at least one editable field.")}).strict();
const bulletInsert = z.object({op:z.literal("insert"),table:z.literal("experience_bullets"),key:uuid,fields:z.object(bulletFields).partial().extend({item_id:uuid,text:bulletFields.text}).strict()}).strict();
const bulletUpdate = z.object({op:z.literal("update"),table:z.literal("experience_bullets"),key:uuid,fields:z.object(bulletFields).partial().strict().refine(fields=>Object.keys(fields).length>0,"Choose at least one editable field.")}).strict();
const bulletDelete = z.object({op:z.literal("delete"),table:z.literal("experience_bullets"),key:uuid,fields:z.object({}).strict().default({})}).strict();
/** Narrow URL grammar shared with private.draft_https; editor rules still run first. */
function draftHttps(text:string):boolean {
  if(!text.startsWith("https://")||/[\s\\]/.test(text))return false;
  try {if(new URL(text).protocol!=="https:")return false;}catch{return false;}
  let host=text.slice(8).split(/[/?#]/,1)[0].split("@").at(-1)??"";
  const ipv6=host.startsWith("[");
  const match=ipv6?/^\[[0-9a-fA-F:]+\](?::([0-9]+))?$/.exec(host):/^([a-zA-Z0-9_.-]+)(?::([0-9]+))?$/.exec(host);
  if(!match)return false;
  const port=match[ipv6?1:2];if(port&&(port.length>5||Number(port)>65535))return false;
  if(!ipv6){host=match[1];if(/(^|\.)([0-9]+|0[xX][0-9a-fA-F]*)\.?$/.test(host)&&(!/^(0|[1-9][0-9]{0,2})(\.(0|[1-9][0-9]{0,2})){3}$/.test(host)||host.split(".").some(n=>Number(n)>255)))return false;}
  return true;
}
function publishingOperation<T extends PublishingTable>(table:T) {
  const fields=z.object(CONTENT_ALLOWLIST[table].fields);
  return z.object({op:z.enum(["insert","update","delete"]),table:z.literal(table),key:uuid,fields:fields.partial().strict().default({})}).strict().superRefine((value,ctx)=>{
    if(value.op==="delete") {if(Object.keys(value.fields).length)ctx.addIssue({code:"custom",message:"Delete accepts no fields; it only unpublishes."});return;}
    if(!Object.keys(value.fields).length)ctx.addIssue({code:"custom",message:"Choose at least one editable field."});
    if(value.op==="insert")for(const field of ["slug",table==="projects"?"name":"title"]){if(!(field in value.fields))ctx.addIssue({code:"custom",path:["fields",field],message:`Insert requires ${field}.`});}
    // Match both existing URL schemas and database HTTPS constraints; no URL scheme coercion.
    for(const [field,input] of Object.entries(value.fields))for(const text of Array.isArray(input)?input:[input]){
      if(typeof text!=="string")continue;
      if(text.includes("\0"))ctx.addIssue({code:"custom",path:["fields",field],message:"Text cannot contain NUL."});
      if(field.endsWith("_url")||field==="url"||field==="screenshots"||field==="slides") {
        if(!text)continue;
        const valid=draftHttps(text);
        if(!valid)ctx.addIssue({code:"custom",path:["fields",field],message:"Links must be valid HTTPS URLs."});
      }
    }
  });
}
const publishingOperations={projects:publishingOperation("projects"),articles:publishingOperation("articles"),guides:publishingOperation("guides"),content_series:publishingOperation("content_series")};
// Dispatch first so a bad field produces its own rule's explanation, rather than a generic union error.
export const operationSchema = z.unknown().transform((input, ctx) => {
  const op = input as {table?:unknown;op?:unknown} | null;
  const schema = op?.table==='about_photos'?(op.op==='insert'?photoInsert:op.op==='delete'?photoDelete:photoUpdate):typeof op?.table === "string" && isAppTable(op.table) ? appOperationSchema : typeof op?.table === "string" && isPublishingTable(op.table) ? publishingOperations[op.table] : op?.table === "site_sections" ? sectionOperation
    : op?.table === "experience_items" ? op.op === "insert" ? itemInsert : itemUpdate
    : op?.table === "experience_bullets" ? op.op === "insert" ? bulletInsert : op.op === "delete" ? bulletDelete : bulletUpdate
    : null;
  if (!schema) {ctx.addIssue({code:"custom",message:"Unknown content table."});return z.NEVER;}
  const result = schema.safeParse(input);
  if (!result.success) {for(const issue of result.error.issues) ctx.addIssue({code:"custom",path:issue.path,message:issue.message});return z.NEVER;}
  return result.data;
});
export const operationsSchema = z.array(operationSchema).min(1).max(100);
export type ContentOperation = z.infer<typeof operationSchema>;
export function validateOperations(input: unknown): { ok: true; operations: ContentOperation[] } | { ok: false; message: string } {
  const result = operationsSchema.safeParse(input);
  if (!result.success) return { ok: false, message: `Invalid draft: ${result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")}` };
  return { ok: true, operations: result.data };
}
/** Detail page of a publishing row; series pages live under /content/series. */
const detailRoute=(table:PublishingTable,slug:string)=>`${table==="content_series"?"/content/series":`/${table}`}/${encodeURIComponent(slug)}`;
export function affectedRoutes(operations: ContentOperation[], previous:unknown = []): string[] {
  const routes=operations.flatMap(operation=>[...CONTENT_ALLOWLIST[operation.table].routes] as string[]);
  for(const operation of operations)if(isPublishingTable(operation.table)&&"slug" in operation.fields&&typeof operation.fields.slug==="string")routes.push(detailRoute(operation.table,operation.fields.slug));
  if(Array.isArray(previous))for(const row of previous)if(row&&isPublishingTable(row.table)&&typeof row.values?.slug==="string")routes.push(detailRoute(row.table,row.values.slug));
  return [...new Set(routes)];
}
