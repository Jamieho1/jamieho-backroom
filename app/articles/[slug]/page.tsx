import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Desktop} from '@/components/desktop';
import {Markdown} from '@/components/markdown';
import {ArticleManageLink} from '@/components/articles/library';
import {getPublicArticle} from '@/lib/articles-public';
import {PLATFORM_LABEL,articleHref} from '@/lib/articles';
import '../../articles.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 try{const article=await getPublicArticle((await params).slug);return article?{title:`${article.title} · Jamie Ho`,description:article.summary,openGraph:{title:article.title,description:article.summary,type:'article'}}:{title:'Article not found · Jamie Ho',robots:{index:false}};}catch{return {title:'Articles · Jamie Ho'};}
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 let article;try{article=await getPublicArticle(slug);}catch{return <Desktop apps={[]} initialApp="articles" discoverApps content={<div className="page"><p role="alert">Can&apos;t load this article right now.</p><a href={articleHref(slug)}>Try again</a></div>} />;}
 if(!article)notFound();
 return <Desktop apps={[]} initialApp="articles" discoverApps content={<article className="page articles-page article-body"><header className="articles-heading"><Link href="/articles" prefetch={false}>← All articles</Link><ArticleManageLink /></header><p className="eyebrow">{PLATFORM_LABEL[article.platform]}</p><h1>{article.title}</h1><p className="article-summary">{article.summary}</p>{article.source_url?<p><a href={article.source_url} target="_blank" rel="noopener noreferrer">Original video or post ↗</a></p>:null}<Markdown text={article.body} /></article>} />;
}
