"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROOM_OBJECTS, boxStyle, type RoomObject } from "@/lib/journey/room";
import { ContactForm } from "@/components/contact-form";
import type { ContactResult } from "@/lib/contact";
import { SOCIAL_LABEL, type SocialLink } from "@/lib/social";

type SendAction = (prev: ContactResult | null, form: FormData) => Promise<ContactResult>;
export interface RoomHandle { setOpacity(o: number): void }

/**
 * TKT-78: the room's clickable objects. Each object is a real button (Tab-reachable, labelled) laid exactly over its
 * place in the final frame; its cut-out glows along the outline on hover/focus with a label. The monitor plays the
 * push-in clip (c7b) and then opens Projects; the shelf and mic open small menus; the keyboard opens the contact form.
 */
export const RoomHotspots = forwardRef<RoomHandle, { base: string; zoomSrc: string; mobile: boolean; socials: SocialLink[]; send: SendAction }>(
  function RoomHotspots({ base, zoomSrc, mobile, socials, send }, ref) {
    const root = useRef<HTMLDivElement>(null);
    const zoom = useRef<HTMLVideoElement>(null);
    const [open, setOpen] = useState<RoomObject["id"] | null>(null);
    const [zooming, setZooming] = useState(false);
    const router = useRouter();

    useImperativeHandle(ref, () => ({
      setOpacity: (o) => {
        const el = root.current;
        if (!el) return;
        el.style.opacity = String(o);
        el.style.visibility = o > 0 ? "visible" : "hidden";
        el.style.pointerEvents = o > 0.6 ? "auto" : "none";
        if (o === 0 && open) setOpen(null);
      },
    }), [open]);

    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const go = (href: string) => {
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      if (doc.startViewTransition) doc.startViewTransition(() => router.push(href));
      else router.push(href);
    };

    const pushIntoMonitor = (href: string) => {
      const v = zoom.current;
      if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return go(href);
      setZooming(true);
      v.currentTime = 0;
      v.playbackRate = 2.4;
      let done = false;
      const finish = () => { if (!done) { done = true; go(href); } };
      v.ontimeupdate = () => { if (v.duration && v.currentTime >= v.duration - 0.25) finish(); };
      v.onended = finish;
      window.setTimeout(finish, 4500); // never strand the visitor if playback stalls
      void v.play().catch(finish);
    };

    const activate = (o: RoomObject) => {
      const a = o.action;
      if (a.kind === "zoom") pushIntoMonitor(a.href);
      else if (a.kind === "link") go(a.href);
      else setOpen(open === o.id ? null : o.id);
    };

    return (
      <div ref={root} className="journey-room" style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}>
        <div className="journey-frame">
          {ROOM_OBJECTS.map((o) => (
            <button key={o.id} type="button" className={`journey-hot journey-hot-${o.id}`} style={boxStyle(o.box, 6)}
              aria-label={`${o.label}: ${o.hint}`} aria-expanded={o.action.kind === "menu" || o.action.kind === "socials" || o.action.kind === "contact" ? open === o.id : undefined}
              onClick={() => activate(o)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${base}/room-${o.id}.png`} alt="" draggable={false} style={{
                left: `${(6 / (o.box.w + 12)) * 100}%`, width: `${(o.box.w / (o.box.w + 12)) * 100}%`,
                top: `${(6 / (o.box.h + 12)) * 100}%`, height: `${(o.box.h / (o.box.h + 12)) * 100}%` }} />
              <span className="journey-hot-label" aria-hidden="true">{o.label} <span>→</span></span>
            </button>
          ))}
          <video ref={zoom} className={`journey-zoom${zooming ? " is-on" : ""}`} muted playsInline preload="auto"
            src={`${base}/${zoomSrc}-${mobile ? "mobile" : "desktop"}.mp4`} aria-hidden="true" />
        </div>

        {open === "shelf" ? (
          <RoomSheet title="Practice" onClose={() => setOpen(null)}>
            <ul className="journey-sheet-links">
              {(ROOM_OBJECTS.find((o) => o.id === "shelf")!.action as { items: { label: string; href: string }[] }).items.map((i) => (
                <li key={i.href}><button type="button" onClick={() => go(i.href)}>{i.label} <span>→</span></button></li>
              ))}
            </ul>
          </RoomSheet>
        ) : null}
        {open === "mic" ? (
          <RoomSheet title="YouTube & Instagram" onClose={() => setOpen(null)}>
            {socials.length ? (
              <ul className="journey-sheet-links">
                {socials.map((s) => <li key={s.kind}><a href={s.href} target="_blank" rel="noopener noreferrer">{SOCIAL_LABEL[s.kind]} <span>↗</span></a></li>)}
              </ul>
            ) : <p>Links coming soon.</p>}
          </RoomSheet>
        ) : null}
        {open === "keyboard" ? (
          <RoomSheet title="Contact" onClose={() => setOpen(null)} wide>
            <ContactForm action={send} />
          </RoomSheet>
        ) : null}
      </div>
    );
  },
);

function RoomSheet({ title, onClose, wide = false, children }: { title: string; onClose(): void; wide?: boolean; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => { panel.current?.querySelector<HTMLElement>("a, button, input, textarea, select")?.focus(); }, []);
  return (
    <div className="journey-sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} className={`journey-sheet${wide ? " journey-sheet-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="journey-sheet-head">
          <p className="journey-eyebrow">The desk</p>
          <button type="button" className="journey-sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <h2 className="journey-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
