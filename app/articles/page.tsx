import type {Metadata} from 'next';
import {Desktop} from '@/components/desktop';
import {ArticlesLibrary} from '@/components/articles/library';
import {getPublicArticles} from '@/lib/articles-public';
import '../articles.css';
export const revalidate=86400;
export const metadata:Metadata={title:'Articles · Jamie Ho',description:'Further reading and references for videos and posts.'};
export default async function ArticlesPage(){
 const articles=await getPublicArticles();
 return <Desktop apps={[]} initialApp="articles" discoverApps content={<ArticlesLibrary articles={articles} />} />;
}
