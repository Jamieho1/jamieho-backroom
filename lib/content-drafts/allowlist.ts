import { z } from "zod";
import { KINDS, LIMITS } from "@/lib/experience";
import { SECTION_KEYS, MAX_BODY, MAX_TITLE } from "@/lib/sections";

// Match PostgreSQL char_length (Unicode code points), including rejection of JSON NUL.
const text = (max: number) => z.string().refine(value => !value.includes("\0"), "Text cannot contain NUL.")
  .refine(value => Array.from(value).length <= max, `Text must be ${max} characters or fewer.`);
const cvText = (max: number) => z.string().refine(value => value.length <= max, `Text must be ${max} characters or fewer.`).refine(value => !value.includes("\0"), "Text cannot contain NUL.").transform(value => value.trim());
const uuid = z.uuid().transform(value => value.toLowerCase());
const sort = z.number().int().min(-2147483648).max(2147483647);
const itemFields = { kind: z.enum(KINDS), title: cvText(LIMITS.title).refine(value => !!value, "Give it a title first."), org: cvText(LIMITS.org), dates: cvText(LIMITS.dates), location: cvText(LIMITS.location), summary: cvText(LIMITS.summary), sort, public: z.boolean() };
const bulletFields = { item_id: uuid, text: cvText(LIMITS.bullet).refine(value => !!value, "Give the bullet text."), sort, public: z.boolean() };
const cvRoutes = ["/", "/journey", "/about", "/behavioral"] as const;
export const CONTENT_ALLOWLIST = {
  site_sections: {
    key: z.enum(SECTION_KEYS),
    fields: { title: text(MAX_TITLE), body: text(MAX_BODY) },
    operations: ["update"] as const,
    routes: ["/", "/journey", "/about"] as const,
  },
  experience_items: { key: uuid, fields: itemFields, operations: ["insert", "update"] as const, routes: cvRoutes },
  experience_bullets: { key: uuid, fields: bulletFields, operations: ["insert", "update", "delete"] as const, routes: cvRoutes },
} as const;
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
// Dispatch first so a bad field produces its own rule's explanation, rather than a generic union error.
export const operationSchema = z.unknown().transform((input, ctx) => {
  const op = input as {table?:unknown;op?:unknown} | null;
  const schema = op?.table === "site_sections" ? sectionOperation
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
export function affectedRoutes(operations: ContentOperation[]): string[] {
  return [...new Set(operations.flatMap(operation => [...CONTENT_ALLOWLIST[operation.table].routes]))];
}
