import {loadCompaniesPreview,companyTargets} from './companies';
import {loadAboutPhotosPreview} from './about-photos';
import {loadBehavioralPreview,behavioralTargets} from './behavioral-guides';
import {loadTemplatePreview} from './resume-template';
import { cookies, draftMode } from "next/headers";
import { z } from "zod";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { SELECT, type ExperienceRow } from "@/lib/experience";
import { overlayExperience } from "./experience-overlay";
import {parsePhotoSet,withPhotoOperations} from "./photo-server";
import {loadAppPreview,appTargets} from "./app-overlay";
import {loadPublishingPreview,publishingTargets} from "./publishing-overlay";
import type { HomePreview } from "./types";

export const PREVIEW_COOKIE = "jb.content-preview";

/** Query drafts only after a verified owner session; neither a URL nor a cookie grants permission. */
export async function loadOwnerPreview(id: string): Promise<HomePreview | null> {
  const viewer = await getViewer();
  if (viewer.role !== "owner" || !viewer.id || !z.uuid().safeParse(id).success) return null;
  const sb = await supabaseServer();
  if (!sb) return null;
  const { data, error } = await sb.from("content_changes").select("id, summary, status, operations, photo_slots, created_at")
    .eq("id", id).eq("status", "draft").maybeSingle();
  if (error || !data || data.status !== "draft") return null;
  let result,photoSlots;
  try {const parsed=parsePhotoSet(data.operations,data.photo_slots,id);photoSlots=parsed.slots;result={operations:await withPhotoOperations(sb,parsed.operations,photoSlots)};}catch{return null;}
  let experience:ExperienceRow[]|undefined;
  if (result.operations.some(op=>op.table==="experience_items"||op.table==="experience_bullets")) {
    let rows=await sb.from("experience_items").select(SELECT + ", show_on_journey, journey_icon, journey_photo").order("sort");
    if(rows.error)rows=await sb.from("experience_items").select(SELECT + ", show_on_journey, journey_icon").order("sort"); // before the journey_photo migration
    if(rows.error)return null;
    try {experience=overlayExperience((rows.data??[]) as unknown as ExperienceRow[],result.operations);} catch {return null;}
  }
  let publishing,appData,resumeTemplate,behavioral,aboutPhotos,companies;
  try {companies=await loadCompaniesPreview(sb,result.operations);aboutPhotos=await loadAboutPhotosPreview(sb,result.operations);behavioral=await loadBehavioralPreview(sb,result.operations);resumeTemplate=await loadTemplatePreview(sb,result.operations);publishing=await loadPublishingPreview(sb,result.operations);appData=await loadAppPreview(sb,result.operations,viewer.id);} catch {return null;}
  const targets=[...companyTargets(result.operations,companies),...behavioralTargets(result.operations),...(resumeTemplate?[{href:'/interview/resume',label:'Preview resume template'}]:[]),...publishingTargets(result.operations),...appTargets(result.operations)];
  return { ...(companies?{companies}:{}),...(aboutPhotos?{aboutPhotos}:{}),...(behavioral?{behavioral}:{}),...(resumeTemplate?{resumeTemplate}:{}),...(Object.keys(publishing).length?{publishing}:{}),...(Object.keys(appData).length?{appData}:{}),...(targets.length?{targets}:{}), ...(photoSlots.length?{photoSlots}:{}),id: data.id, summary: data.summary, operations: result.operations, ...(experience ? {experience} : {}) };
}

/** Draft Mode is false at prerender time. Only its enabled branch reads request cookies/auth. */
export async function getHomePreview(): Promise<HomePreview | null> {
  if (!(await draftMode()).isEnabled) return null;
  const id = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!id) return null;
  return loadOwnerPreview(id);
}
