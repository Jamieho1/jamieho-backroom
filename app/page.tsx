import Link from "next/link";
import { Desktop } from "@/components/desktop";
import { getSections } from "@/lib/sections";
import { getPublicExperience } from "@/lib/experience";
import { ExperienceSection } from "@/components/experience-section";
import { getProjectApps } from "@/lib/projects";
import { ProjectGrid } from "@/components/project-grid";
import { ContactForm } from "@/components/contact-form";
import { sendMessage } from "@/app/actions/contact";
import { Markdown } from "@/components/markdown";
import { EditableSection } from "@/components/editable-section";
import { AuthErrorNotice } from "@/components/auth-error-notice";
import { HomeJourney } from "@/components/home/journey";
import "./home.css";

/** Pre-rendered; re-rendered when the owner saves a section (revalidatePath), or at least daily. */
export const revalidate = 86400;

export default async function Home() {
  const [s, experience, apps] = await Promise.all([getSections(), getPublicExperience(), getProjectApps()]);
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
      <div id="home-work" className="home-content-stop" tabIndex={-1}>
      <section className="block wide" aria-labelledby="projects-h">
        <h2 id="projects-h">Projects</h2>
        <ProjectGrid apps={apps} />
        <p>
          <Link href="/projects" prefetch={false}>All projects →</Link>
        </p>
      </section>
      </div>
      <div className="home-content-stop"><ExperienceSection items={experience} /></div>
      <div className="home-content-stop">
      <EditableSection sectionKey="writing" title={s.writing.title} body={s.writing.body} className="block">
        <Markdown text={s.writing.body} />
      </EditableSection>
      </div>
      <div id="home-contact" className="home-content-stop" tabIndex={-1}>
      <EditableSection sectionKey="contact" title={s.contact.title} body={s.contact.body} className="block">
        <Markdown text={s.contact.body} />
      </EditableSection>
      <section className="block" aria-label="Send a message">
        <ContactForm action={sendMessage} />
      </section>
      </div>
      <footer className="landing-footer"><span>End of the river. Start of a conversation.</span><Link href="/privacy" prefetch={false}>Privacy</Link></footer>
    </HomeJourney>} />
  );
}
