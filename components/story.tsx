import Link from "next/link";
import {PrimaryPill} from "@/components/primary-pill";
import {StoryEffects} from "@/components/story/story-effects";
import {StoryMarkdown} from "@/components/story/story-markdown";
import {StoryNav} from "@/components/story/story-nav";
import {constellationTitle} from "@/lib/journey/background-photos";
import {CONTACT_HREF} from "@/lib/journey/content";
import {chapterCountLabel,parseStory} from "@/lib/story-chapters";
import type {Principle,StoryChapter} from "@/lib/story-chapters";
import type {Section} from "@/lib/sections";

/** Display headline in the homepage style: a lowercase connector ("to") is small italic and starts the second line. */
function headline(title: string) {
  const parts = constellationTitle(title);
  const connector = parts.findIndex(p => p.connector);
  const cut = connector > 0 ? connector : parts.length > 3 ? Math.ceil(parts.length / 2) : 0;
  const lines = cut > 0 ? [parts.slice(0, cut), parts.slice(cut)] : [parts];
  return lines.map((line, i) => <span className="sty-line" key={i}>{line.map((p, k) => p.connector ? <em key={k}>{p.word} </em> : <span key={k}>{p.word} </span>)}</span>);
}

function Principles({items}: {items: Principle[]}) {
  return <ul className="sty-pr sty-rv" role="list">{items.map((item, i) => <li className="sty-pc" key={i}>
    <div className="k"><span>PRINCIPLE {String(i + 1).padStart(2, "0")}</span></div>
    <h3>{item.title}</h3>{item.text ? <StoryMarkdown text={item.text} inline/> : null}
  </li>)}</ul>;
}

function Chapter({chapter}: {chapter: StoryChapter}) {
  return <section className="sty-ch" id={chapter.id} aria-labelledby={`${chapter.id}-h`}>
    <div className="sty-ch-h sty-rv"><span className="n">{chapter.n}</span><h2 id={`${chapter.id}-h`}>{chapter.title}</h2></div>
    {chapter.segments.map((seg, i) => seg.kind === "principles" ? <Principles key={i} items={seg.items}/> : <StoryMarkdown key={i} text={seg.text}/>)}
  </section>;
}

/** Public copy only; the caller supplies an owner-verified overlay when previewing. */
export function Story({about, story, changed = false}: {about: Section; story: Section; changed?: boolean}) {
  const starter = !story.body.trim();
  const title = about.title.trim() || story.title.trim() || "My story";
  const parsed = starter ? null : parseStory(story.body);
  const chapters = parsed?.chapters ?? [];
  const lede = chapters.length ? parsed!.intro : "";
  const meta = parsed && parsed.minutes > 0 ? [chapters.length ? chapterCountLabel(chapters.length) : "", `~${parsed.minutes} min read`].filter(Boolean).join(" · ") : "";
  return <article className="story-editorial sty" data-starter={starter} data-draft-changed={changed || undefined}>
    <div className="sty-layer sty-dots" aria-hidden="true"/><div className="sty-layer sty-grain" aria-hidden="true"/>
    <header className="sty-in sty-hero">
      <p className="sty-eyebrow">MY STORY</p>
      <h1>{headline(title)}</h1>
      {lede ? <div className="sty-lede"><StoryMarkdown text={lede}/></div> : null}
      {meta ? <div className="sty-hmeta">{meta}</div> : null}
    </header>
    {starter
      ? <div className="sty-in sty-starter"><div className="sty-col"><StoryMarkdown text={about.body}/><p className="story-coming">More of the story is on its way.</p></div></div>
      : chapters.length
        ? <div className="sty-in sty-body"><StoryNav items={chapters.map(({id, n, title}) => ({id, n, title}))}/><div className="sty-cols" id="story-cols">{chapters.map(c => <Chapter key={c.id} chapter={c}/>)}</div></div>
        : <div className="sty-in sty-starter"><div className="sty-col"><StoryMarkdown text={parsed!.intro}/></div></div>}
    <section className="sty-cta" aria-labelledby="story-cta-h"><div className="sty-in">
      <h2 id="story-cta-h">Have a project in mind?</h2>
      <div className="sty-row2"><PrimaryPill strong href={CONTACT_HREF}>Get in touch</PrimaryPill><Link className="sty-back" href="/" prefetch={false}>Back to the homepage</Link></div>
    </div></section>
    <StoryEffects/>
  </article>;
}
