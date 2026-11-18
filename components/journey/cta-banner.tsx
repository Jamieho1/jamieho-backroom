import {PrimaryPill} from "@/components/primary-pill";
/** Own full-width section after What I build. Copy comes from the Technology section's ctaTitle/ctaLabel. */
export function CtaBanner({title,label}:{title:string;label:string}){
 return <section className="cta-banner" aria-label={title}><h2 className="cta-title">{title}</h2><div className="cta-action"><PrimaryPill strong data-contact-jump href="#home-contact">{label}</PrimaryPill></div></section>;
}
