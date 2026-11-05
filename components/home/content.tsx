"use client";

import type { ReactNode } from "react";
import { useViewer } from "@/components/viewer-provider";
import { EditableSection } from "@/components/editable-section";
import { Markdown } from "@/components/markdown";
import type { Section } from "@/lib/sections";

/** Empty personal sections stay unpublished; the owner can still reach them in Edit site mode. */
export function HomeStop({ id, empty = false, children, className = "" }: { id: string; empty?: boolean; children: ReactNode; className?: string }) {
  const { editing } = useViewer();
  if (empty && !editing) return null;
  return <div id={`home-${id}`} data-home-stop={id} className={`home-content-stop ${className}`} tabIndex={-1}><div className="home-reading-pane">{children}</div></div>;
}

export function HomeEditableStop({ section, fallback }: { section: Section; fallback?: ReactNode }) {
  const { editing } = useViewer();
  return (
    <HomeStop id={section.key} empty={!section.body.trim() && !fallback}>
      <EditableSection sectionKey={section.key} title={section.title} body={section.body} className="block" emptyContent={fallback}>
        {section.body.trim() ? <Markdown text={section.body} /> : fallback}
      </EditableSection>
      {editing ? <p className="home-edit-hint">{fallback ? "Leave the text blank to use the technologies from your project tags."
        : section.key === "now" ? "What you're doing right now, in two or three lines. It also shows at the desk in the journey. Leave it blank to hide it."
        : "Add your interests here. Leave the text blank to hide this section from visitors."}</p> : null}
    </HomeStop>
  );
}
