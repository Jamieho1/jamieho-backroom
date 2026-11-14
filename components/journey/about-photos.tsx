"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { mediaUrl } from "@/lib/journey/media";

const PHOTOS = [
  { file: "about-imperial-graduation.jpg", alt: "Jamie at Imperial College London's entrance on graduation day" },
  { file: "about-jungfraujoch.jpg", alt: "Jamie in the snow at Jungfraujoch, Switzerland" },
  { file: "about-graduation-hall.jpg", alt: "Jamie holding his graduation certificate inside the ceremony hall" },
];
export interface AboutPhotosHandle { setProgress(local: number): void }

/** Shares the journey clock: scroll down advances, scroll up retraces the same photo strip. */
export const AboutPhotos = forwardRef<AboutPhotosHandle, { base: string; still?: boolean }>(function AboutPhotos({ base, still = false }, ref) {
  const strip = useRef<HTMLOListElement>(null);
  useImperativeHandle(ref, () => ({
    setProgress(local) {
      const progress = Math.min(1, Math.max(0, (local - 0.16) / 0.72));
      if (strip.current) strip.current.style.transform = `translate3d(${-progress * (PHOTOS.length - 1) * 100}%, 0, 0)`;
    },
  }), []);
  return <div className={`journey-about-photos${still ? " is-still" : ""}`} role="region" aria-label="About Jamie in photos" tabIndex={still ? 0 : undefined}>
    <ol ref={strip}>
      {PHOTOS.map(photo => <li key={photo.file}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mediaUrl(base, photo.file)} alt={photo.alt} loading="lazy" decoding="async" />
      </li>)}
    </ol>
  </div>;
});
