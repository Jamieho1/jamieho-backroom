/** Supplied public project artwork. Database screenshots always take precedence. */
const PROJECT_ART: Readonly<Record<string, readonly string[]>> = {
  cyterly: ["/project-art/cyterly-action-plan-f356cf5e1908.webp"],
};

export function projectScreenshots(slug: string, screenshots: string[]): string[] {
  return screenshots.length ? screenshots : [...(PROJECT_ART[slug] ?? [])];
}
