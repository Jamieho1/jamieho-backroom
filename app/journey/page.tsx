import type { Metadata } from "next";
import { Journey } from "@/components/journey/journey";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import "../journey.css";

/** Home v1 preview (TKT-74): not linked or indexed until TKT-79 moves it onto `/`. */
export const metadata: Metadata = { title: "Journey preview · Jamie Ho", robots: { index: false, follow: false } };

/** Media lives outside git: `public/home-media/` locally (gitignored), the `home-media` bucket later (TKT-75). */
const MEDIA_BASE = (process.env.NEXT_PUBLIC_HOME_MEDIA_URL ?? "/home-media").replace(/\/$/, "");

export default function JourneyPage() {
  return <main className="journey-page"><Journey chapters={HOME_CHAPTERS} base={MEDIA_BASE} /></main>;
}
