import { z } from "zod";
import { SECTION_KEYS, MAX_BODY, MAX_TITLE } from "@/lib/sections";

// Match PostgreSQL char_length (Unicode code points), including rejection of JSON NUL.
const text = (max: number) => z.string().refine(value => !value.includes("\0"), "Text cannot contain NUL.")
  .refine(value => Array.from(value).length <= max, `Text must be ${max} characters or fewer.`);
export const CONTENT_ALLOWLIST = {
  site_sections: {
    key: z.enum(SECTION_KEYS),
    fields: { title: text(MAX_TITLE), body: text(MAX_BODY) },
    operations: ["update"] as const,
    routes: ["/", "/journey", "/about"] as const,
  },
} as const;
const section = CONTENT_ALLOWLIST.site_sections;
export const operationSchema = z.object({
  op: z.literal(section.operations[0], { error: "Only update operations are supported for site_sections." }),
  table: z.literal("site_sections", { error: "Unknown table; only site_sections is allowed." }),
  key: section.key,
  fields: z.object(section.fields).partial().strict().refine(fields => Object.keys(fields).length > 0, "Choose at least one editable field."),
}).strict();
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
