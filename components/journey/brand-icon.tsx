import type { MediaPlatform } from "@/lib/journey/timeline";

/** Small brand marks for the Creator section (simple, recognisable glyphs; not the official logo files). */
export function BrandIcon({ platform, size = 18 }: { platform: MediaPlatform; size?: number }) {
  if (platform === "youtube") return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="5" width="21" height="14" rx="4" fill="currentColor" /><path d="M10 9l5 3-5 3z" fill="#fff" /></svg>
  );
  if (platform === "instagram") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
  );
  if (platform === "xiaohongshu") return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" /><text x="12" y="15.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">小红书</text></svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h7M9 8h3" /></svg>
  );
}
