"use client";
import {useState} from 'react';
import Link from 'next/link';
import {companyHref,companyMonogram,filterCompanies,type DirectoryCompany} from '@/lib/interview/companies';
import {MEDIA_PUBLIC_BASE} from '@/lib/home-content-schema';
export function CompaniesDirectory({companies}:{companies:DirectoryCompany[]}){
 const [search,setSearch]=useState('');const [sort,setSort]=useState<'az'|'questions'>('az');const rows=filterCompanies(companies,search,sort);
 return <section className="iv-companies"><h1>Companies</h1><div className="iv-company-controls"><input aria-label={`Search ${companies.length} companies`} placeholder={`Search ${companies.length} companies`} value={search} onChange={e=>setSearch(e.target.value)}/><label>Sort <select aria-label="Sort companies" value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="az">A–Z</option><option value="questions">Most questions</option></select></label></div>
 {!companies.length?<p>No companies yet. Check back soon.</p>:!rows.length?<p role="status">No companies match your search.</p>:<ul className="iv-company-grid">{rows.map(c=><li key={c.id}><Link href={companyHref(c.slug)} data-draft-changed={c.draftChanged||undefined}><CompanyLogo name={c.name} path={c.logo_path}/><span className="iv-company-copy"><strong>{c.name}</strong><small>{c.questionCount} {c.questionCount===1?'question':'questions'}</small></span><span aria-hidden="true">›</span></Link></li>)}</ul>}</section>;
}
function CompanyLogo({name,path}:{name:string;path:string}){const [failed,setFailed]=useState(false);const m=companyMonogram(name);return path&&!failed?<img className="iv-company-logo" src={MEDIA_PUBLIC_BASE+'home-media/'+path} alt={`${name} logo`} width={24} height={24} onError={()=>setFailed(true)}/>:<span className="iv-company-monogram" style={{background:m.color}} aria-hidden="true">{m.letters}</span>;}
