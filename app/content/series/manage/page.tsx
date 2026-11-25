import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {SeriesEditor} from '@/components/content/series-editor';
import {SERIES_SELECT,type SeriesRow} from '@/lib/content-series-data';
import '../../../articles.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Manage series · Jamie Ho',robots:{index:false}};
export default async function ManageSeries(){
 const viewer=await getViewer();if(viewer.role!=='owner')notFound();
 const sb=await supabaseServer();if(!sb)notFound();
 const {data,error}=await sb.from('content_series').select(SERIES_SELECT).order('sort').order('title');
 return error?<main className="page"><p role="alert">Can&apos;t load your series right now.</p><a href="/content/series/manage">Try again</a></main>:<SeriesEditor initial={(data??[]) as SeriesRow[]} />;
}
