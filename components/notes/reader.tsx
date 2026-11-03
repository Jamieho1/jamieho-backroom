"use client";
import Link from "next/link";
import { practiceHref } from "@/lib/desktop-pages";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { NOTE_TRACKS, type NoteRow, type NoteTrack, noteTrack, parseVisuals, shelfTitle } from "@/lib/notes";
import { PRACTICE_ANCHORS } from "@/lib/notes/neetcode150";
import { galleryGroups } from "@/lib/notes/concepts";
import { ResizeHandle, useResizablePanels } from "../practice/panels";
import { ConceptCards } from "./concept-cards";
import { NoteEditor, type SaveNote } from "./editor";
import { VisualsTab } from "./visuals-tab";
import { Markdown, type AutoLink } from "./markdown";

export function NotesReader({ notes, canEdit = false, save }: { notes: NoteRow[]; canEdit?: boolean; save?: SaveNote }) {
  const panels = useResizablePanels("jamieho.notes.panels.v1");
  const [selected, setSelected] = useState(notes[0]?.id ?? "");
  const [track, setTrack] = useState<NoteTrack>(() => noteTrack(notes[0]?.id ?? ""));
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<Record<string, NoteRow>>({});
  const [savedMessage, setSavedMessage] = useState("");
  const shown = notes.map((n) => saved[n.id] ?? n);
  const note = shown.find((n) => n.id === selected);
  const inTrack = shown.filter((n) => noteTrack(n.id) === track);
  const filtered = inTrack.filter((n) => `${n.title}\n${n.body}\n${n.free ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()));
  const tracks = NOTE_TRACKS.filter((t) => shown.some((n) => noteTrack(n.id) === t.id));
  const nav = NOTE_TRACKS.find((t) => t.id === track)!.nav;
  const switchTrack = (next: NoteTrack) => {
    setTrack(next);
    if (noteTrack(selected) !== next) setSelected(shown.find((n) => noteTrack(n.id) === next)?.id ?? selected);
    setSavedMessage("");
  };
  if (!notes.length) return <div className="desktop-placeholder"><h2>Notes</h2><p>No notes have been added yet.</p></div>;
  return (
    <div className={`notes-reader${panels.state.collapsed ? " notes-collapsed" : ""}`} style={{"--notes-sidebar": `${panels.state.collapsed ? 52 : panels.state.sidebar}px`} as CSSProperties}>
      <aside className="notes-sidebar">
        <button className="btn ghost small" type="button" aria-label={panels.state.collapsed ? "Expand topics" : "Collapse topics"} aria-expanded={!panels.state.collapsed} onClick={() => panels.setState(s => ({...s, collapsed: !s.collapsed}))}>{panels.state.collapsed ? "»" : "«"}</button>
        <div hidden={panels.state.collapsed}>
        {tracks.length > 1 ? (
          <div className="notes-tracks" role="group" aria-label="Note type">
            {tracks.map((t) => <button key={t.id} type="button" className="notes-track" aria-pressed={t.id === track} disabled={editing && canEdit} onClick={() => switchTrack(t.id)}>{t.label}</button>)}
          </div>
        ) : null}
        <label className="field"><span>Search notes</span><input type="search" placeholder="Search notes…" value={query} disabled={editing && canEdit} onChange={(e) => setQuery(e.target.value)} /></label>
        <nav aria-label={nav}>
          {filtered.map((n) => <button className="notes-topic" type="button" key={n.id} disabled={editing && canEdit} aria-current={n.id === selected ? "page" : undefined} onClick={() => { setSelected(n.id); setSavedMessage(""); }}>{shelfTitle(n.title)}</button>)}
          {!filtered.length ? <p className="muted">No matching notes.</p> : null}
        </nav>
        {editing && canEdit ? <p className="hint">Save or cancel before switching topics.</p> : null}
        </div>
      </aside>
      {!panels.state.collapsed ? <ResizeHandle className="notes-resizer" label="Resize topics" value={panels.state.sidebar} min={180} max={420} reset={220} onChange={sidebar => panels.setState(s => ({...s, sidebar}))} /> : <div className="notes-resizer-spacer" />}
      {note ? editing && canEdit ? <NoteEditor key={note.id} note={note} save={save} onCancel={() => setEditing(false)} onSaved={(next) => { setSaved((rows) => ({ ...rows, [next.id]: next })); setEditing(false); setSavedMessage("Saved."); }} />
        : <NoteView key={`${note.id}:${note.updated_at}`} note={note} split={panels.state.split} onSplit={split => panels.setState(s => ({...s, split}))} canEdit={canEdit} savedMessage={savedMessage} onEdit={() => { setSavedMessage(""); setEditing(true); }} /> : null}
    </div>
  );
}

function NoteView({ note, canEdit, onEdit, savedMessage, split, onSplit }: { split: number; onSplit(n: number): void; note: NoteRow; canEdit: boolean; onEdit(): void; savedMessage: string }) {
  const columns = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1);
  useEffect(() => {
    if (!columns.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(columns.current);
    return () => observer.disconnect();
  }, []);
  // Imported Markdown may repeat the topic heading; keep the workspace heading once.
  const body = note.body.replace(/^\s*#{1,2}\s+([^\n]+)\n?/, (heading, title: string) => title.replace(/[*`]/g, "").trim().toLowerCase() === note.title.trim().toLowerCase() ? "" : heading);
  const [focus, setFocus] = useState<{ concept: string; tick: number }>();
  const parsed = useMemo(() => parseVisuals(note.visual), [note.visual]);
  const groups = useMemo(() => galleryGroups(note.body, parsed.visuals), [note.body, parsed]);
  const concepts = useMemo(() => new Set(groups.map((g) => g.concept)), [groups]);
  const problems = PRACTICE_ANCHORS.filter((p) => p.topic === note.id);
  const links: AutoLink[] = problems.map((p) => ({ alias: p.title, href: practiceHref(p.lc), exact: false }));
  const showVisuals = groups.length > 0 || parsed.invalid || noteTrack(note.id) === "coding";
  return (
    <div className={`notes-columns${showVisuals ? "" : " notes-single"}`} ref={columns} style={showVisuals ? ({"--notes-columns": `${split}fr 8px ${100 - split}fr`} as CSSProperties) : undefined}>
      <section className="notes-main" aria-labelledby="notes-topic-title">
        <ConceptCards body={body} links={links} visualConcepts={concepts} onVisual={(concept) => setFocus({concept, tick: Date.now()})} toolbar={(toggle) => <header className="notes-heading"><h2 id="notes-topic-title">{note.title}</h2><div className="actions">{toggle}{canEdit ? <button type="button" className="btn ghost small" onClick={onEdit}>Edit note</button> : null}</div></header>} />
        {savedMessage ? <p role="status">{savedMessage}</p> : null}
        {!body ? <p>No content for this topic yet.</p> : null}
        {note.free ? <section className="notes-free" aria-label="Free notes"><h3>Free notes</h3><Markdown text={note.free} links={links} /></section> : null}
        {problems.length ? <section className="notes-problems" aria-label="Practice problems"><h3>Practice problems</h3><ul>{problems.map((p) => <li key={p.lc}><Link prefetch={false} href={practiceHref(p.lc)}>{p.title} →</Link>{p.extra ? <span className="notes-extra"> · extra</span> : null}</li>)}</ul></section> : null}
      </section>
      {showVisuals ? <>
      <ResizeHandle className="notes-resizer" label="Resize notes and visuals" value={split} min={25} max={75} reset={50} unit="percent" scale={100 / Math.max(1, width - 8)} onChange={onSplit} />
      <section className="notes-visuals" aria-label="Visuals">
        <h2>Visuals</h2>
        {parsed.invalid ? <p role="status">Some visuals could not be loaded. The note is still available.</p> : null}
        <VisualsTab groups={groups} focus={focus} />
      </section>
      </> : null}
    </div>
  );
}
