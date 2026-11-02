import type {Metadata} from 'next';
import {Desktop} from '@/components/desktop';
import {ArticlesShell} from '@/components/articles/library';
import {ArticlesFooter} from '@/components/articles/footer';
import {getPublicArticles} from '@/lib/articles-public';
import {getSections} from '@/lib/sections';
import {socialLinks} from '@/lib/social';
import '../articles.css';
export const revalidate=86400;
export const metadata:Metadata={title:'Articles · Jamie Ho',description:'Writing on AI, career, productivity and building in public.'};
export default async function ArticlesPage(){
 const [articles,sections]=await Promise.all([getPublicArticles(),getSections()]);
 return <Desktop apps={[]} initialApp="articles" discoverApps content={<ArticlesShell articles={articles} footer={<ArticlesFooter socials={socialLinks(sections.contact.body)} />} />} />;
}
