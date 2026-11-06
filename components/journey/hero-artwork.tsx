import { DESKTOP_ASSETS } from "@/components/desktop-scene/assets";

/** Approved artwork stays rigid; only a quiet light veil moves over it. */
export function HeroArtwork() {
  return <div className="journey-hero-art" aria-hidden="true">
    {(["day", "night"] as const).map(theme => <picture key={theme} className={`journey-hero-${theme}`}>
      <source media="(max-aspect-ratio: 3/4)" srcSet={theme === "day" ? DESKTOP_ASSETS.dayPortrait : DESKTOP_ASSETS.nightPortrait} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={theme === "day" ? DESKTOP_ASSETS.dayWide : DESKTOP_ASSETS.nightWide} alt="" fetchPriority="high" />
    </picture>)}
    <div className="journey-hero-light" />
  </div>;
}
