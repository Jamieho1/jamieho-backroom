import Link from 'next/link';
import {Markdown} from '@/components/markdown';
import type {DirectoryCompany,InterviewExperience} from '@/lib/interview/companies';
import {companyHref} from '@/lib/interview/companies';
import {companyExperienceHref,companyTabHref} from '@/lib/interview/company-page';
import {experienceDate,experienceMetadata} from '@/lib/interview/experiences';
import {CompanyNavigation} from './company-navigation';
import {CompanyLogo} from './companies-directory';
import {PrepBlock} from './prep-block';
import type {PrepItem} from '@/lib/interview/prep';
export function ExperienceDetail({company,companies,experience,related,prep=[],preview=false}:{company:DirectoryCompany;companies:DirectoryCompany[];experience:InterviewExperience;related:{company:InterviewExperience[];level:InterviewExperience[]};prep?:PrepItem[];preview?:boolean}){
 const relatedList=(rows:InterviewExperience[])=>rows.length?<ul>{rows.map(e=>{const c=companies.find(c=>c.id===e.company_id);return c?<li key={e.id} data-draft-changed={e.draftChanged||undefined}><Link href={companyExperienceHref(c.slug,e.slug)} prefetch={false}><strong>{e.title}</strong><small>{c.name} · {e.role}</small></Link></li>:null;})}</ul>:<p>No other experiences yet.</p>;
 return <><CompanyNavigation companies={companies} slug={company.slug}/><div className="iv-company-page iv-experience-layout"><div className="iv-experience-column"><article className="iv-experience-article" data-draft-changed={experience.draftChanged||undefined}>
 <Link className="iv-experience-back" href={companyTabHref(company.slug,'experiences')} prefetch={false}>← All interview experiences</Link><header><Link className="iv-experience-company" href={companyHref(company.slug)} prefetch={false} data-draft-changed={company.draftChanged||undefined}><CompanyLogo name={company.name} path={company.logo_path}/>{company.name}</Link><p className="iv-experience-meta">{experienceMetadata(experience)}</p><h1>{experience.title}</h1><p className="iv-experience-byline">By an anonymous member · Published {experience.published_at?<time dateTime={experience.published_at}>{experienceDate(experience.published_at)}</time>:experienceDate(null)}</p></header><Markdown text={experience.body}/>
</article><PrepBlock items={prep} preview={preview} label="What to prepare"/></div><aside className="iv-experience-related" aria-label="Related interview experiences"><PrepBlock items={prep} compact label="What to prepare summary"/><section aria-label={`More from ${company.name}`}><h2>More from {company.name}</h2>{relatedList(related.company)}</section><section aria-label={`More at ${experience.level}`}><h2>More at {experience.level}</h2>{relatedList(related.level)}</section></aside></div></>;
}
