import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ArticleMarkdown} from '@/components/articles/article-markdown';
import {OnThisPage} from '@/components/articles/on-this-page';
import {GuideToolkit} from '@/components/guides/shelf';
import {getPublicGuide} from '@/lib/guides-public';
import {articleDate,articleSections} from '@/lib/articles';
import {guideHref} from '@/lib/guides';
import '../../articles.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 try{const g=await getPublicGuide((await params).slug);return g?{title:`${g.title} · Jamie Ho`,description:g.summary,openGraph:{title:g.title,description:g.summary,type:'article',...(g.cover_url?{images:[g.cover_url]}:{})}}:{title:'Guide not found · Jamie Ho',robots:{index:false}};}catch{return {title:'Guides · Jamie Ho'};}
}
export default async function GuidePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 let guide;
 try{guide=await getPublicGuide(slug);}catch{return <main className="page"><p role="alert">Can&apos;t load this guide right now.</p><a href={guideHref(slug)}>Try again</a></main>;}
 if(!guide)notFound();
 return <main className="page guide-page"><div className="article-layout">
  <article className="article-read">
   <p className="article-meta" id="overview"><Link href="/resources" prefetch={false}>Resources</Link> · <Link href="/guides" prefetch={false}>Guides</Link> · Updated {articleDate(guide.updated_at)}</p>
   <h1>{guide.title}</h1>
   {guide.summary?<p className="article-summary">{guide.summary}</p>:null}
   <GuideToolkit notion={guide.notion_url} doc={guide.doc_url} />
   {/* eslint-disable-next-line @next/next/no-img-element */}
   {guide.cover_url?<img className="article-cover" src={guide.cover_url} alt="" referrerPolicy="no-referrer" />:null}
   <ArticleMarkdown text={guide.body} />
  </article>
  <OnThisPage sections={articleSections(guide.body)} topId="overview" />
 </div></main>;
}
