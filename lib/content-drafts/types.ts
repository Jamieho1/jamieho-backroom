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
  photoSlots?: import("./photo-slots").PhotoSlot[];
  fields: ReviewField[];
  validationError?: string;
  previewCv?: boolean;
  previewTargets?: {href:string;label:string}[];
}
export interface DraftResult { ok: boolean; message: string; applied?: boolean }
export function reviewFields(operations: ContentOperation[], live: Record<string, { title: string; body: string }>, experience: Record<string, Record<string, Record<string, unknown>>> = {}): ReviewField[] {
  const display=(value:unknown)=>value!==null&&typeof value==="object"?JSON.stringify(value,null,2):String(value);
  const proposed = new Map<string, ReviewField>();
  for (const operation of operations) {
    const row = operation.table === "site_sections" ? live[operation.key] : experience[operation.table]?.[operation.key];
    if(operation.table === "practice_stars" && operation.op === "insert") {
      proposed.set(`practice_stars.${operation.key}`,{field:`practice_stars.${operation.key}`,current:row?"Starred":"Not starred",proposed:"Starred"});
      continue;
    }
    if (operation.op === "delete") {
      proposed.set(`${operation.table}.${operation.key}`,{field:`${operation.table}.${operation.key}`,current:JSON.stringify(row ?? "(missing)"),proposed:operation.table === "practice_stars" ? "(unstar problem)" : operation.table === "experience_bullets" ? "(delete bullet)" : operation.table === "about_photos" ? "(delete photo)" : "(unpublish; keep row)"});
      continue;
    }
    for (const [field,value] of Object.entries(operation.fields)) {
      const label=`${operation.table}.${operation.key}.${field}`;
      const current=row?.[field as keyof typeof row];
      proposed.set(label,{field:label,current:current === undefined ? (operation.op === "insert" ? "(new row)" : "(row missing)") : display(current),proposed:display(value)});
    }
  }
  return [...proposed.values()];
}

export interface HomePreview {
  companies?:import('./companies').CompaniesPreview;
  aboutPhotos?:import("@/lib/home-content-schema").AboutPhoto[];
  behavioral?:import('./behavioral-guides').BehavioralPreview;
  resumeTemplate?:import('@/lib/resume').ResumeTemplate;
  photoSlots?: import("./photo-slots").PhotoSlot[];
  id: string;
  summary: string;
  operations: ContentOperation[];
  appData?: import("./app-overlay").AppPreview;
  publishing?: import("./publishing-overlay").PublishingPreview;
  targets?: {href:string;label:string}[];
  experience?: import("@/lib/experience").ExperienceRow[];
}
