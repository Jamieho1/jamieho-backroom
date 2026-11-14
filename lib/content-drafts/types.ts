import type { ContentOperation } from "./allowlist";
export interface ContentChange {
  id: string;
  summary: string;
  status: "draft" | "approved" | "discarded";
  operations: unknown;
  photo_slots: unknown;
  created_at: string;
}
export interface ReviewField {
  field: string;
  current: string;
  proposed: string;
}
export interface ReviewDraft extends ContentChange {
  fields: ReviewField[];
  validationError?: string;
  previewCv?: boolean;
}
export interface DraftResult { ok: boolean; message: string; applied?: boolean }
export function reviewFields(operations: ContentOperation[], live: Record<string, { title: string; body: string }>, experience: Record<string, Record<string, Record<string, unknown>>> = {}): ReviewField[] {
  const proposed = new Map<string, ReviewField>();
  for (const operation of operations) {
    const row = operation.table === "site_sections" ? live[operation.key] : experience[operation.table]?.[operation.key];
    if (operation.op === "delete") {
      proposed.set(`${operation.table}.${operation.key}`,{field:`${operation.table}.${operation.key}`,current:JSON.stringify(row ?? "(missing)"),proposed:"(delete bullet)"});
      continue;
    }
    for (const [field,value] of Object.entries(operation.fields)) {
      const label=`${operation.table}.${operation.key}.${field}`;
      const current=row?.[field as keyof typeof row];
      proposed.set(label,{field:label,current:current === undefined ? (operation.op === "insert" ? "(new row)" : "(row missing)") : String(current),proposed:String(value)});
    }
  }
  return [...proposed.values()];
}

export interface HomePreview {
  id: string;
  summary: string;
  operations: ContentOperation[];
  experience?: import("@/lib/experience").ExperienceRow[];
}
