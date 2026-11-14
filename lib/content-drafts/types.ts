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
}
export interface DraftResult { ok: boolean; message: string; applied?: boolean }
export function reviewFields(operations: ContentOperation[], live: Record<string, { title: string; body: string }>): ReviewField[] {
  // Collapse repeated updates so the review displays the final proposal against current live data.
  const proposed = new Map<string, ReviewField>();
  for (const operation of operations) for (const [field, value] of Object.entries(operation.fields)) {
    proposed.set(`${operation.key}.${field}`, { field: `site_sections.${operation.key}.${field}`,
      current: live[operation.key]?.[field as "title" | "body"] ?? "(section missing)", proposed: value! });
  }
  return [...proposed.values()];
}

export interface HomePreview {
  id: string;
  summary: string;
  operations: ContentOperation[];
}
