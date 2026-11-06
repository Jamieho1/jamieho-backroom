import type { MediaPlatform } from "@/lib/journey/timeline";

/** Small brand marks for the Creator section (simple, recognisable glyphs; not the official logo files). */
export function BrandIcon({ platform, size = 18 }: { platform: MediaPlatform; size?: number }) {
  if (platform === "linkedin") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="5" r="2" /><path d="M3 9h4v12H3zM10 9h4v1.6c.8-1.2 2-1.9 3.5-1.9 3 0 4.5 1.9 4.5 5.2V21h-4v-6.3c0-1.7-.6-2.5-1.9-2.5-1.4 0-2.1 1-2.1 2.5V21h-4z" /></svg>
  );
  if (platform === "youtube") return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="5" width="21" height="14" rx="4" fill="#ff0033" /><path d="M10 9l5 3-5 3z" fill="#fff" /></svg>
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
