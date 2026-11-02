import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Desktop} from '@/components/desktop';
import {ArticlesShell,ArticleCardView} from '@/components/articles/library';
import {ArticleMarkdown} from '@/components/articles/article-markdown';
import {ArticlesFooter} from '@/components/articles/footer';
import {YouTubeEmbed} from '@/components/articles/youtube';
import {getPublicArticle,getPublicArticles} from '@/lib/articles-public';
import {getSections} from '@/lib/sections';
import {getProjectApps} from '@/lib/projects';
import {socialLinks} from '@/lib/social';
import {CATEGORY_LABEL,PLATFORM_LABEL,articleDate,articleHref,relatedArticles,youtubeId} from '@/lib/articles';
import '../../articles.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 try{const article=await getPublicArticle((await params).slug);return article?{title:`${article.title} · Jamie Ho`,description:article.summary,openGraph:{title:article.title,description:article.summary,type:'article',...(article.cover_url?{images:[article.cover_url]}:{})}}:{title:'Article not found · Jamie Ho',robots:{index:false}};}catch{return {title:'Articles · Jamie Ho'};}
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 let article,all,sections;
 try{[article,all,sections]=await Promise.all([getPublicArticle(slug),getPublicArticles(),getSections()]);}catch{return <Desktop apps={[]} initialApp="articles" discoverApps content={<div className="page"><p role="alert">Can&apos;t load this article right now.</p><a href={articleHref(slug)}>Try again</a></div>} />;}
 if(!article)notFound();
 const project=article.project_id?(await getProjectApps().catch(()=>[])).find(p=>p.id===article.project_id):undefined;
 const video=article.source_url?youtubeId(article.source_url):null;
 const related=relatedArticles(all,article);
 return <Desktop apps={[]} initialApp="articles" discoverApps content={<ArticlesShell articles={all} currentId={article.id} footer={<ArticlesFooter socials={socialLinks(sections.contact.body)} />}>
  <article className="article-read">
   <p className="article-meta">{articleDate(article.created_at)} · {CATEGORY_LABEL[article.category]}</p>
   <h1>{article.title}</h1>
   {article.summary?<p className="article-summary">{article.summary}</p>:null}
   {project?<p className="article-project">Part of <Link href="/projects" prefetch={false}>{project.name}</Link></p>:null}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   {article.cover_url?<img className="article-cover" src={article.cover_url} alt="" referrerPolicy="no-referrer" />:null}
   {video?<YouTubeEmbed id={video} title={article.title} />:article.source_url?<p><a className="btn ghost" href={article.source_url} target="_blank" rel="noopener noreferrer">Watch on {PLATFORM_LABEL[article.platform]} ↗</a></p>:null}
   <ArticleMarkdown text={article.body} />
   {related.length?<section className="article-related" aria-labelledby="related-h"><h2 id="related-h">If you liked this, you might also like</h2><div className="articles-grid">{related.map(a=><ArticleCardView key={a.id} a={a} />)}</div></section>:null}
  </article>
 </ArticlesShell>} />;
}
