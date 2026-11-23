import Link from 'next/link';
import {InterviewIcon} from './icons';
import {noteHref,topicIcon,type InterviewTopic} from '@/lib/interview/content';
import type {InterviewSection} from '@/lib/interview/navigation';
/** Role section landing page once at least one note exists (otherwise the Soon placeholder stays). */
export function RoleNotes({section,topics}:{section:InterviewSection;topics:InterviewTopic[]}){
 return <section className="iv-role-notes" aria-label={`${section.label} topics`}><h1>{section.label}</h1><p>Notes for this role. Open a topic to read it.</p><ul>{topics.map(t=><li key={t.id}><Link href={noteHref(t.id)} prefetch={false}><span className="iv-icon" style={{color:t.dot}}><InterviewIcon name={topicIcon(t.id)}/></span><span>{t.label}</span><span aria-hidden="true">›</span></Link></li>)}</ul></section>;
}
