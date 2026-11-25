"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useViewer} from '@/components/viewer-provider';

export interface TabCounts{latest:number;series:number;guides:number}
const TABS=[{key:'latest',label:'Latest',href:'/content',exact:true},{key:'series',label:'Series',href:'/content/series',exact:false},{key:'guides',label:'Free guides',href:'/content/guides',exact:false}] as const;
/** Sticky LATEST · SERIES · FREE GUIDES tabs with counts; the current tab has the gold underline. */
export function HubTabs({counts}:{counts:TabCounts}){
 const path=usePathname()??'';
 const {viewer}=useViewer();
 return <nav className="hub-tabs" aria-label="Content sections"><div className="hub-tabs-in">
  {TABS.map(t=>{const current=t.exact?path===t.href:path===t.href||path.startsWith(t.href+'/');
   return <Link key={t.key} href={t.href} prefetch={false} aria-current={current?'page':undefined}>{t.label} <small>{counts[t.key]}</small></Link>;})}
 {viewer.status==='owner'?<span className="hub-owner"><Link href="/articles/manage" prefetch={false}>Manage posts</Link><Link href="/guides/manage" prefetch={false}>Manage guides</Link><Link href="/content/series/manage" prefetch={false}>Manage series</Link></span>:null}
 </div></nav>;
}
