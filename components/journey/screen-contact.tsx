"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { ContactForm } from "@/components/contact-form";
import { sendMessage } from "@/app/actions/contact";
import { SOCIAL_LABEL, type SocialLink } from "@/lib/social";
import { BrandIcon } from "./brand-icon";

export interface ScreenContactHandle { setOpacity(o: number): void }

/** Shared by the monitor overlay and the readable reduced-motion/no-JS ending. */
export function ContactContent({ socials }: { socials: SocialLink[] }) {
  return <section id="home-contact" className="journey-contact-window" aria-label="Contact Us" data-lenis-prevent>
    <header>
      <h2>Contact Us</h2>
      <nav className="journey-contact-socials" aria-label="Contact social profiles">
        {(["youtube", "instagram", "linkedin"] as const).flatMap(kind => socials.filter(s => s.kind === kind).map(s => (
          <a key={kind} className={`journey-brand journey-brand-${kind}`} href={s.href} target="_blank" rel="noopener noreferrer">
            <BrandIcon platform={kind} size={20} />{SOCIAL_LABEL[kind]}
          </a>
        )))}
      </nav>
    </header>
    <h3>Send a message</h3>
    <ContactForm action={sendMessage} />
  </section>;
}

/** The contact form appears on the monitor once the camera has finished pushing in. */
export const ScreenContact = forwardRef<ScreenContactHandle, { socials: SocialLink[] }>(function ScreenContact({ socials }, ref) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ setOpacity: o => {
    const el = root.current;
    if (!el) return;
    el.style.opacity = String(o);
    el.style.visibility = o > 0 ? "visible" : "hidden";
    el.style.pointerEvents = o > .6 ? "auto" : "none";
    el.inert = o <= .6;
  } }), []);
  return <div ref={root} className="journey-contact-screen" inert style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}>
    <ContactContent socials={socials} />
  </div>;
});
