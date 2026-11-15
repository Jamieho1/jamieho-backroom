import {isGuideTable} from '@/lib/interview/behavioral';
import {behavioralTargets} from './behavioral-guides';
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import {isAppTable,isPersonalPractice} from "./app-allowlist";
import {appTargets,appKey} from "./app-overlay";
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
    sb.from("content_changes").select("id, summary, status, operations, photo_slots, created_at").eq("status", "draft").order("created_at", { ascending: false }),
    sb.from("site_sections").select("key, title, body"),
    sb.from("experience_items").select("*"),
    sb.from("experience_bullets").select("*"),
    sb.from("projects").select("*"),sb.from("articles").select("*"),sb.from("guides").select("*"),
  ]);
  if (sets.error || sections.error || items.error || bullets.error||projects.error||articles.error||guides.error) return { drafts: [], error: "Could not load content drafts and current live values. Try again." };
  const appRows:Record<string,Record<string,Record<string,unknown>>>={};
  const appTables=new Set((sets.data??[]).flatMap(set=>{const parsed=validateOperations(set.operations);return parsed.ok?parsed.operations.flatMap(op=>isGuideTable(op.table)||isAppTable(op.table)||op.table==='resume_templates'?[op.table]:[]):[];}));
  for(const table of appTables){
    let query=sb.from(table).select("*");if(isPersonalPractice(table))query=query.eq("user_id",viewer.id);const rows=await query;if(rows.error)return {drafts:[],error:"Could not load current app values. Try again."};
    appRows[table]=Object.fromEntries((rows.data??[]).map(row=>[isGuideTable(table)?row.id:table==='resume_templates'?row.key:appKey(table as import('./app-allowlist').AppTable,row),row]));
  }
  const live = Object.fromEntries((sections.data ?? []).map(row => [row.key, { title: row.title ?? "", body: row.body ?? "" }]));
  const drafts = ((sets.data ?? []) as ContentChange[]).map(set => {
    let photoSlots:import('./photo-slots').PhotoSlot[]=[];let photoError:string|undefined;
    let result=validateOperations(set.operations);
    try {const parsed=parsePhotoSet(set.operations,set.photo_slots,set.id);photoSlots=parsed.slots;result={ok:true,operations:parsed.operations};}catch(error){photoError=error instanceof Error?error.message:'Invalid photo slots.';}
    const previewOps=result.ok?[...result.operations,...photoSlots.map(slot=>({op:'update' as const,table:'projects' as const,key:slot.target.key,fields:{}}))]:[];
    return { ...set, photoSlots, previewTargets:result.ok?[...behavioralTargets(result.operations),...publishingTargets(previewOps),...appTargets(result.operations),...(result.operations.some(op=>op.table==='resume_templates')?[{href:'/interview/resume',label:'Preview resume template'}]:[])]:[],previewCv:result.ok && result.operations.some(op=>op.table==="experience_items"||op.table==="experience_bullets"), fields: result.ok ? reviewFields(result.operations, live, {...appRows,projects:Object.fromEntries((projects.data??[]).map(row=>[row.id,row])),articles:Object.fromEntries((articles.data??[]).map(row=>[row.id,row])),guides:Object.fromEntries((guides.data??[]).map(row=>[row.id,row])),experience_items:Object.fromEntries((items.data??[]).map(row=>[row.id,row])),experience_bullets:Object.fromEntries((bullets.data??[]).map(row=>[row.id,row]))}) : [],
      validationError: !result.ok ? result.message : photoError };
  });
  for(const draft of drafts)for(const slot of draft.photoSlots??[])draft.fields.push({field:`projects.${slot.target.key}.screenshots (${slot.slot})`,current:JSON.stringify((projects.data??[]).find(row=>row.id===slot.target.key)?.screenshots??[]),proposed:slot.path?`Append ${photoUrl(slot.path)}`:`Awaiting ${slot.expected_filename}`});
  return { drafts };
}
