/**
 * Portfolio views (Home v1.1, TKT-83): the /projects list and a project's case-study page. Pure presentation (no
 * data fetching), so the pages stay pre-rendered and the views can be exercised with fixtures in e2e.
 */
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { projectHref, siteHost, type Project } from "@/lib/portfolio-core";
import { ProjectManageLink } from "./manage-link";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (!projects.length) return <p className="muted">Projects are on their way.</p>;
  return <ul className="win-grid project-list">{projects.map((p) => <li key={p.id}><ProjectTile p={p} /></li>)}</ul>;
}

export function ProjectTile({ p }: { p: Project }) {
  const shot = p.screenshots[0];
  return (
    <Link className="win project-tile" href={projectHref(p.slug)} prefetch={false} aria-label={`${p.name}${p.tagline ? `: ${p.tagline}` : ""}`}>
      <span className="win-bar" aria-hidden="true"><i /><i /><i /><span>{p.name}</span>{p.featured ? <span className="win-vis">Featured</span> : null}</span>
      <span className="win-shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {shot ? <img src={shot} alt="" loading="lazy" /> : <span className="win-placeholder" aria-hidden="true"><span>◻</span></span>}
      </span>
      <span className="win-body">
        <strong className="project-tile-name">{p.name}</strong>
        {p.tagline ? <span className="project-tile-tagline">{p.tagline}</span> : null}
        {p.tags.length ? <span className="project-tile-tags">{p.tags.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</span> : null}
        <span className="project-tile-go">Read more <span aria-hidden="true">→</span></span>
      </span>
    </Link>
  );
}

/** The case study. The website is an option on this page ("Visit website"), never where the card itself goes. */
export function ProjectDetail({ p }: { p: Project }) {
  const [hero, ...rest] = p.screenshots;
  const host = p.url ? siteHost(p.url) : "";
  return (
    <article className="page project-read">
      <p className="project-back"><Link href="/projects" prefetch={false}>← All projects</Link> <ProjectManageLink slug={p.slug} /></p>
      <header className="project-head">
        <h1>{p.name}</h1>
        {p.tagline ? <p className="project-tagline">{p.tagline}</p> : null}
        {p.tags.length ? <ul className="tags" aria-label="Built with">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul> : null}
        <p className="project-visit">
          {p.url
            ? <a className="btn" href={p.url} target="_blank" rel="noopener noreferrer">Visit website{host ? ` · ${host}` : ""} ↗</a>
            : <span className="btn ghost" aria-disabled="true">Website coming soon</span>}
        </p>
      </header>
      {hero ? (
        <figure className="project-frame">
          <span className="win-bar" aria-hidden="true"><i /><i /><i /></span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt={`Screenshot of ${p.name}`} />
        </figure>
      ) : null}
      {p.body.trim() ? <div className="project-body"><Markdown text={p.body} /></div> : null}
      {rest.length ? (
        <section className="project-gallery" aria-label="More screenshots">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {rest.map((src, k) => <img key={src} src={src} alt={`${p.name} screenshot ${k + 2}`} loading="lazy" />)}
        </section>
      ) : null}
      <p className="project-back"><Link href="/projects" prefetch={false}>← All projects</Link></p>
    </article>
  );
}
