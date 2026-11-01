import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {getDesktopApps} from '@/app/actions/desktop';
import {Desktop} from '@/components/desktop';
import {ArticleEditor} from '@/components/articles/editor';
import {ARTICLE_SELECT,type Article} from '@/lib/articles';
import '../../articles.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Manage articles · Jamie Ho',robots:{index:false}};
export default async function ManageArticles(){
 const viewer=await getViewer();if(viewer.role!=='owner')notFound();
 const sb=await supabaseServer();if(!sb)notFound();
 const {data,error}=await sb.from('articles').select(ARTICLE_SELECT).order('updated_at',{ascending:false});
 const apps=await getDesktopApps();
 return <Desktop signedIn viewerId={viewer.id} apps={apps} initialApp="articles" content={error?<div className="page"><p role="alert">Can&apos;t load your articles right now.</p><a href="/articles/manage">Try again</a></div>:<ArticleEditor initial={(data??[]) as Article[]} />} />;
}
