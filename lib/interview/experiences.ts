import type {Company,InterviewExperience} from './companies';
import {stripChips} from './prep';
export const EXPERIENCE_LEVELS=['Junior','Mid','Senior','Staff','Other'] as const;
export type ExperienceLevel=typeof EXPERIENCE_LEVELS[number];
export function experienceExcerpt(body:string){return stripChips(body).replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/<[^>]*>/g,'').replace(/[#*_`~>|]/g,'').replace(/\s+/g,' ').trim().slice(0,320);}
export function newestExperiences(rows:readonly InterviewExperience[]){return rows.filter(e=>e.published).sort((a,b)=>(b.published_at?Date.parse(b.published_at):0)-(a.published_at?Date.parse(a.published_at):0)||a.id.localeCompare(b.id));}
export function filterExperiences(rows:readonly InterviewExperience[],search='',level:ExperienceLevel|'all'='all'){const term=search.trim().toLowerCase();return newestExperiences(rows).filter(e=>(level==='all'||e.level===level)&&`${e.title} ${e.role} ${e.level} ${e.region} ${e.interview_date} ${e.body}`.toLowerCase().includes(term));}
export function relatedExperiences(current:InterviewExperience,rows:readonly InterviewExperience[],companies:readonly Pick<Company,'id'|'public'>[]){const visible=new Set(companies.filter(c=>c.public).map(c=>c.id));const eligible=newestExperiences(rows).filter(e=>e.id!==current.id&&visible.has(e.company_id));return {company:eligible.filter(e=>e.company_id===current.company_id).slice(0,3),level:eligible.filter(e=>e.company_id!==current.company_id&&e.level===current.level).slice(0,5)};}
export function experienceMonth(value:string){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))return '';return new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'-01T00:00:00Z'));}
export function experienceDate(value:string|null){if(!value||!Number.isFinite(Date.parse(value)))return 'Date not provided';return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value));}
export const experienceMetadata=(e:InterviewExperience)=>[e.level,e.role,experienceMonth(e.interview_date),e.region].filter(Boolean).join(' · ');
