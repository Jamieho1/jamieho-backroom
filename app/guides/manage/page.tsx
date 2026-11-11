import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {GuideEditor} from '@/components/guides/editor';
import {GUIDE_SELECT,type Guide} from '@/lib/guides';
import '../../articles.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Manage guides · Jamie Ho',robots:{index:false}};
export default async function ManageGuides(){
 const viewer=await getViewer();if(viewer.role!=='owner')notFound();
 const sb=await supabaseServer();if(!sb)notFound();
 const {data,error}=await sb.from('guides').select(GUIDE_SELECT).order('updated_at',{ascending:false});
 return error?<main className="page"><p role="alert">Can&apos;t load your guides right now.</p><a href="/guides/manage">Try again</a></main>:<GuideEditor initial={(data??[]) as Guide[]} />;
}
