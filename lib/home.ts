import type { AppRow } from "./apps";

// These are technology names, not a person's skills. Only tags actually present on public cards appear.
const TECHNOLOGIES = new Map([
  "Next.js", "React", "TypeScript", "JavaScript", "Python", "Pyodide", "CodeMirror", "Supabase", "PostgreSQL",
  "Markdown", "Three.js", "GSAP", "Node.js", "Docker", "AWS", "Vercel", "Tailwind CSS", "Redis", "Go", "Rust",
].map(name => [name.toLowerCase(), name]));

export function projectTechnologies(apps: AppRow[]) {
  const tools = new Map<string, { name: string; projects: { id: string; name: string }[] }>();
  for (const app of apps) {
    if (app.visibility === "owner_only") continue;
    for (const tag of app.tags) {
      const name = TECHNOLOGIES.get(tag.trim().toLowerCase());
      if (!name) continue;
      if (!tools.has(name)) tools.set(name, { name, projects: [] });
      const projects = tools.get(name)!.projects;
      if (!projects.some(project => project.id === app.id)) projects.push({ id: app.id, name: app.name });
    }
  }
  return [...tools.values()];
}

/** Map real section positions to a camera score. Long reading panels receive a hold, not extra travel. */
export function journeyPosition(tops: number[], scroll: number, viewport: number): { time: number; hold: boolean } {
  if (tops.length < 2 || scroll <= tops[0]) return { time: 0, hold: true };
  // Native anchor scrolling rounds fractional layout positions to device pixels.
  for (let i = tops.length - 1; i >= 0; i--) {
    if (Math.abs(scroll - tops[i]) <= 1.5) return { time: i, hold: true };
  }
  for (let i = 1; i < tops.length; i++) {
    if (scroll < tops[i]) {
      const start = i === 1 ? tops[i - 1] : Math.max(tops[i - 1], tops[i] - viewport * 0.55);
      const progress = Math.max(0, Math.min(1, (scroll - start) / Math.max(1, tops[i] - start)));
      return { time: i - 1 + progress, hold: progress === 0 };
    }
  }
  return { time: tops.length - 1, hold: true };
}
