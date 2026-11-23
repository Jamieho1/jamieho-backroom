"use client";
import {createContext,useContext,useState} from 'react';
import {createPortal} from 'react-dom';
import Link from 'next/link';
import {filterCompanies,companyHref,type DirectoryCompany} from '@/lib/interview/companies';
import {CompanyLogo} from './companies-directory';
export const CompanyNavigationContext=createContext<{host:HTMLElement|null;close:()=>void}>({host:null,close:()=>{}});
export function CompanyNavigation({companies,slug}:{companies:DirectoryCompany[];slug:string}){const {host,close}=useContext(CompanyNavigationContext);const [search,setSearch]=useState('');return host?createPortal(<><label className="iv-company-list-search"><span className="sr-only">Search companies</span><input type="search" placeholder="Search companies…" value={search} onChange={e=>setSearch(e.target.value)}/></label><nav aria-label="Companies">{filterCompanies(companies,search,'az').map(c=><Link key={c.id} href={companyHref(c.slug)} prefetch={false} aria-current={c.slug===slug?'page':undefined} onClick={close}><CompanyLogo name={c.name} path={c.logo_path}/><span>{c.name}</span></Link>)}</nav>{!filterCompanies(companies,search,'az').length?<p>No matching companies.</p>:null}</>,host):null;}
