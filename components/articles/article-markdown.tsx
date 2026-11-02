import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type {ReactNode} from 'react';
import {youtubeId} from '@/lib/articles';
import {YouTubeEmbed} from './youtube';

/** Heading text → anchor id, so each section can be linked to. */
export const sectionId=(text:string)=>text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').slice(0,80);
const text=(n:ReactNode):string=>typeof n==='string'||typeof n==='number'?String(n):Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'&&'props' in n?text((n as {props:{children?:ReactNode}}).props.children):'';

/**
 * Article Markdown: raw HTML is never rendered. Images (https only) become captioned figures; a YouTube link
 * on its own line becomes a click-to-play video; ## and ### headings get anchors.
 */
export function ArticleMarkdown({text:md}:{text:string}){
 return <div className="md article-md"><ReactMarkdown skipHtml components={{
  a:({href='',children})=>{if(href.startsWith('/')&&!href.startsWith('//'))return <Link href={href} prefetch={false}>{children}</Link>;const ext=/^https?:\/\//.test(href);return <a href={href} {...(ext?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}</a>;},
  h2:({children})=><h2 id={sectionId(text(children))}>{children}</h2>,
  h3:({children})=><h3 id={sectionId(text(children))}>{children}</h3>,
  img:({src,alt})=>{const s=typeof src==='string'?src:'';if(!/^https:\/\//.test(s))return null;
   // eslint-disable-next-line @next/next/no-img-element
   return <span className="article-figure"><img src={s} alt={alt??''} loading="lazy" decoding="async" referrerPolicy="no-referrer" />{alt?<span className="article-caption">{alt}</span>:null}</span>;},
  p:({node,children})=>{
   const kids=(node?.children??[]).filter(c=>!(c.type==='text'&&!c.value.trim()));
   const k=kids[0];
   const only=kids.length!==1?'':k.type==='element'&&k.tagName==='a'?String(k.properties?.href??''):k.type==='text'?k.value.trim():'';
   const id=only?youtubeId(only):null;
   if(id)return <YouTubeEmbed id={id} title={text(children)||'Video'} />;
   if(kids.length===1&&kids[0].type==='element'&&kids[0].tagName==='img')return <>{children}</>;
   return <p>{children}</p>;},
 }}>{md}</ReactMarkdown></div>;
}
