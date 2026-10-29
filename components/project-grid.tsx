import type { AppRow } from "@/lib/apps";
import { ProjectCard } from "./project-card";

export function ProjectGrid({ apps }: { apps: AppRow[] }) {
  if (!apps.length) return <p className="muted">Projects are on their way.</p>;
  return (
    <div className="win-grid">
      {apps.map((a) => (
        <ProjectCard key={a.id} app={a} />
      ))}
    </div>
  );
}
