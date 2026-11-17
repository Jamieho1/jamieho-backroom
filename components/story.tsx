import {ArticleMarkdown} from "@/components/articles/article-markdown";
import {constellationTitle} from "@/lib/journey/background-photos";
import {CONTACT_HREF} from "@/lib/journey/content";
import type {Section} from "@/lib/sections";

/** Public copy only; the caller supplies an owner-verified overlay when previewing. */
export function Story({about,story,changed=false}:{about:Section;story:Section;changed?:boolean}){
 const starter=!story.body.trim();
 const title=starter?about.title.trim()||"My story":story.title.trim()||"My story";
 return <article className="story-editorial" data-starter={starter} data-draft-changed={changed||undefined}>
  <header className="story-heading"><p>My story</p><h1>{constellationTitle(title).map((part,i)=>part.connector?<em key={i}>{part.word} </em>:<span key={i}>{part.word} </span>)}</h1></header>
  <div className="story-md"><ArticleMarkdown text={starter?about.body:story.body}/></div>
  {starter?<p className="story-coming">More of the story is on its way.</p>:null}
  <footer className="story-footer"><a href={CONTACT_HREF}>Get in touch <span aria-hidden="true">→</span></a></footer>
 </article>;
}
