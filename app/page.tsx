import { getSections } from "@/lib/sections";
import { getPublicExperience } from "@/lib/experience";
import { ExperienceSection } from "@/components/experience-section";
import { Markdown } from "@/components/markdown";
import { EditableSection } from "@/components/editable-section";
import { AuthErrorNotice } from "@/components/auth-error-notice";

/** Pre-rendered; re-rendered when the owner saves a section (revalidatePath), or at least daily. */
export const revalidate = 86400;

export default async function Home() {
  const [s, experience] = await Promise.all([getSections(), getPublicExperience()]);
  return (
    <main className="page landing">
      <AuthErrorNotice />
      <EditableSection sectionKey="hero" title={s.hero.title} body={s.hero.body} heading="h1" className="hero">
        <Markdown text={s.hero.body} />
      </EditableSection>
      <EditableSection sectionKey="about" title={s.about.title} body={s.about.body} className="block">
        <Markdown text={s.about.body} />
      </EditableSection>
      <ExperienceSection items={experience} />
      <EditableSection sectionKey="writing" title={s.writing.title} body={s.writing.body} className="block">
        <Markdown text={s.writing.body} />
      </EditableSection>
      <EditableSection sectionKey="contact" title={s.contact.title} body={s.contact.body} className="block">
        <Markdown text={s.contact.body} />
      </EditableSection>
    </main>
  );
}
