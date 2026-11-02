import Link from "next/link";
import { Desktop } from "@/components/desktop";
import { getSections } from "@/lib/sections";
import { getPublicExperience } from "@/lib/experience";
import { ExperienceSection } from "@/components/experience-section";
import { getProjectApps } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";
import { ContactForm } from "@/components/contact-form";
import { sendMessage } from "@/app/actions/contact";
import { Markdown } from "@/components/markdown";
import { EditableSection } from "@/components/editable-section";
import { AuthErrorNotice } from "@/components/auth-error-notice";
import { HomeJourney } from "@/components/home/journey";
import { HomeEditableStop, HomeStop } from "@/components/home/content";
import { projectTechnologies } from "@/lib/home";
import "./home.css";

/** Pre-rendered; re-rendered when the owner saves a section (revalidatePath), or at least daily. */
export const revalidate = 86400;

export default async function Home() {
  const [s, experience, apps] = await Promise.all([getSections(), getPublicExperience(), getProjectApps()]);
  const technologies = projectTechnologies(apps);
  const toolkit = technologies.length ? <>
    <p className="home-section-intro">Tools used in the projects below. Follow a link to see where each one fits.</p>
    <ul className="home-toolkit" aria-label="Project technologies">
      {technologies.map(tool => <li key={tool.name}>
        <span>{tool.name}</span>
        <span>{tool.projects.map(project => <a key={project.id} href={`#home-project-${project.id}`}>{project.name}</a>)}</span>
      </li>)}
    </ul>
  </> : undefined;
  return (
    <Desktop apps={[]} initialApp="home" discoverApps content={<HomeJourney intro={<>
      <AuthErrorNotice />
      <EditableSection sectionKey="hero" title={s.hero.title} body={s.hero.body} heading="h1" className="hero">
        <Markdown text={s.hero.body} />
      </EditableSection>
      </>} about={
      <EditableSection sectionKey="about" title={s.about.title} body={s.about.body} className="block">
        <Markdown text={s.about.body} />
      </EditableSection>
      }>
      <HomeEditableStop section={s.interests} />
      <HomeEditableStop section={s.technology} fallback={toolkit} />
      <HomeStop id="work" className="home-stop-wide">
      <section className="block wide" aria-labelledby="projects-h">
        <h2 id="projects-h">Projects</h2>
        {apps.length ? <div className="home-project-grid">{apps.map(app =>
          <div id={`home-project-${app.id}`} className="home-project-anchor" key={app.id} tabIndex={-1}><ProjectCard app={app} /></div>
        )}</div> : <p className="muted">Projects are on their way.</p>}
        <p>
          <Link href="/projects" prefetch={false}>All projects →</Link>
        </p>
      </section>
      </HomeStop>
      <HomeStop id="experience" empty={!experience.length}><ExperienceSection items={experience} /></HomeStop>
      <HomeStop id="writing">
      <EditableSection sectionKey="writing" title={s.writing.title} body={s.writing.body} className="block">
        <Markdown text={s.writing.body} />
      </EditableSection>
      <p className="home-reading-link"><Link href="/articles" prefetch={false}>Browse articles and references <span aria-hidden="true">↗</span></Link></p>
      </HomeStop>
      <HomeStop id="contact" className="home-stop-wide">
      <div className="home-contact-layout">
      <EditableSection sectionKey="contact" title={s.contact.title} body={s.contact.body} className="block">
        <Markdown text={s.contact.body} />
      </EditableSection>
      <section className="block" aria-label="Send a message">
        <ContactForm action={sendMessage} />
      </section>
      </div>
      </HomeStop>
      <footer className="landing-footer"><a href="#home-arrival">Back to the river ↑</a><Link href="/privacy" prefetch={false}>Privacy</Link></footer>
    </HomeJourney>} />
  );
}
