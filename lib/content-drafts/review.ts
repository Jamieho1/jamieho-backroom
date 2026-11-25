import { notFound } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import {isAppTable} from "./app-allowlist";
import {appKey} from "./app-overlay";
import {CONTENT_SITE} from "./site";
import {publishingTargets} from "./publishing-overlay";
import { validateOperations } from "./allowlist";
import {photoUrl} from "./photo-slots";
import {parsePhotoSet} from "./photo-server";
import { reviewFields, type ContentChange, type ReviewDraft } from "./types";

/** Request-scoped only. Never read owner drafts through the public/cached content loader. */
export async function loadContentReview(): Promise<{ drafts: ReviewDraft[]; error?: string }> {
  const viewer = await getViewer();
  if (viewer.role !== "owner" || !viewer.id) notFound();
  const sb = await supabaseServer();
  if (!sb) notFound();
  const [sets, sections, items, bullets,projects,articles,guides] = await Promise.all([
    sb.from("content_changes").select("id, summary, status, operations, photo_slots, created_at").eq("status", "draft").eq("site", CONTENT_SITE).order("created_at", { ascending: false }),
    sb.from("site_sections").select("key, title, body"),
    sb.from("experience_items").select("*"),
    sb.from("experience_bullets").select("*"),
    sb.from("projects").select("*"),sb.from("articles").select("*"),sb.from("guides").select("*"),
  ]);
  if (sets.error || sections.error || items.error || bullets.error||projects.error||articles.error||guides.error) return { drafts: [], error: "Could not load content drafts and current live values. Try again." };
  const appRows:Record<string,Record<string,Record<string,unknown>>>={};
  const appTables=new Set((sets.data??[]).flatMap(set=>{const parsed=validateOperations(set.operations);return parsed.ok?parsed.operations.flatMap(op=>op.table==='about_photos'||isAppTable(op.table)?[op.table]:[]):[];}));
  for(const table of appTables){
    const rows=await sb.from(table).select("*");if(rows.error)return {drafts:[],error:"Could not load current app values. Try again."};
    appRows[table]=Object.fromEntries((rows.data??[]).map(row=>[table==='about_photos'?row.id:appKey(table as import('./app-allowlist').AppTable,row),row]));
  }
  const live = Object.fromEntries((sections.data ?? []).map(row => [row.key, { title: row.title ?? "", body: row.body ?? "" }]));
  const drafts = ((sets.data ?? []) as ContentChange[]).map(set => {
    let photoSlots:import('./photo-slots').PhotoSlot[]=[];let photoError:string|undefined;
    let result=validateOperations(set.operations);
    try {const parsed=parsePhotoSet(set.operations,set.photo_slots,set.id);photoSlots=parsed.slots;result={ok:true,operations:parsed.operations};}catch(error){photoError=error instanceof Error?error.message:'Invalid photo slots.';}
    const previewOps=result.ok?[...result.operations,...photoSlots.filter(slot=>slot.bucket==='project-media').map(slot=>({op:'update' as const,table:'projects' as const,key:slot.target.key,fields:{}}))]:[];
    return { ...set, photoSlots, previewTargets:result.ok?[...publishingTargets(previewOps)]:[],fields: result.ok ? reviewFields(result.operations, live, {...appRows,projects:Object.fromEntries((projects.data??[]).map(row=>[row.id,row])),articles:Object.fromEntries((articles.data??[]).map(row=>[row.id,row])),guides:Object.fromEntries((guides.data??[]).map(row=>[row.id,row])),experience_items:Object.fromEntries((items.data??[]).map(row=>[row.id,row])),experience_bullets:Object.fromEntries((bullets.data??[]).map(row=>[row.id,row]))}) : [],
      validationError: !result.ok ? result.message : photoError };
  });
  for(const draft of drafts)for(const slot of draft.photoSlots??[]){
    if(slot.bucket==='home-media')for(const field of ['caption','alt','sort','centre','public'] as const)draft.fields.push({field:`about_photos.${slot.target.key}.${field}`,current:'(new row)',proposed:String(slot[field]??false)});
    draft.fields.push({field:`${slot.target.table}.${slot.target.key}.${slot.target.field} (${slot.slot})`,current:slot.bucket==='home-media'?"(new photo)":JSON.stringify((projects.data??[]).find(row=>row.id===slot.target.key)?.screenshots??[]),proposed:slot.path?`${slot.bucket==='home-media'?'Create photo: ':'Append '}${photoUrl(slot.path,slot.bucket)}`:`Awaiting ${slot.expected_filename}`});
  }
  return { drafts };
}
