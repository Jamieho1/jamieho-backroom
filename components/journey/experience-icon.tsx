import type { JourneyIconName } from "@/lib/journey/experience-curve";
/** Original built-in icons: one 24px grid and one rounded stroke throughout. */
export function ExperienceIcon({name}:{name:JourneyIconName}){
 const paths:Record<JourneyIconName,React.ReactNode>={
  "graduation-cap":<><path d="m2 8 10-5 10 5-10 5Z"/><path d="M6 10v7q6 5 12 0v-7M22 8v9"/></>,
  microscope:<><path d="m10 3 5 3-4 7-5-3ZM11 13l-2 4M5 21h15M15 9a6 6 0 0 1 2 11M4 17h8"/><path d="m9 2 2 1M5 10l2 1"/></>,
  "neural-network":<><circle cx="4" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="20" cy="19" r="2"/><path d="m6 6 4.5 4.5M6 18l4.5-4.5m3-3L18 6m-4.5 7.5L18 18"/></>,
  "streams-plug":<><path d="M2 4h3l5 6M2 12h7M2 20h3l5-6"/><circle cx="11" cy="12" r="2"/><path d="M13 12h3m0-3v6h3l3-2v-2l-3-2Zm3-3v3m0 6v3"/></>,
  code:<><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/></>,
  "heart-hands":<><path d="M12 12 7 8a3 3 0 0 1 5-4 3 3 0 0 1 5 4ZM2 12v7l6 3h8l6-3v-7M2 14l6 3h8l6-3M8 17l-2-4m10 4 2-4"/></>,
  rocket:<><path d="M9 15c-1-6 4-12 12-12 0 8-6 13-12 12ZM9 9H5l-3 6h7m6 0v4l-6 3v-7M6 18l-3 3"/><circle cx="16" cy="8" r="2"/></>,
  briefcase:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V3h8v4M2 12q10 6 20 0M10 13h4v4h-4Z"/></>,
 };
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
