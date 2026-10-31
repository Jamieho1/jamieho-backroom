"use client";

import { useMemo, useState } from "react";
import { type NoteRow, parseVisuals } from "@/lib/notes";
import { NEETCODE_150, leetcodeUrl } from "@/lib/notes/neetcode150";
import { galleryGroups } from "@/lib/notes/concepts";
import { ConceptCards } from "./concept-cards";
import { NoteEditor, type SaveNote } from "./editor";
import { VisualsTab } from "./visuals-tab";
import { Markdown, type AutoLink } from "./markdown";

export function NotesReader({ notes, canEdit = false, save }: { notes: NoteRow[]; canEdit?: boolean; save?: SaveNote }) {
  const [selected, setSelected] = useState(notes[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<Record<string, NoteRow>>({});
  const [savedMessage, setSavedMessage] = useState("");
  const shown = notes.map((n) => saved[n.id] ?? n);
  const note = shown.find((n) => n.id === selected);
  const filtered = shown.filter((n) => `${n.title}\n${n.body}\n${n.free ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()));
  if (!notes.length) return <div className="desktop-placeholder"><h2>Notes</h2><p>No notes have been added yet.</p></div>;
  return (
    <div className="notes-reader">
      <aside className="notes-sidebar">
        <label className="field"><span>Search notes</span><input type="search" value={query} disabled={editing && canEdit} onChange={(e) => setQuery(e.target.value)} /></label>
        <nav aria-label="Coding topics">
          {filtered.map((n) => <button className="notes-topic" type="button" key={n.id} disabled={editing && canEdit} aria-current={n.id === selected ? "page" : undefined} onClick={() => { setSelected(n.id); setSavedMessage(""); }}>{n.title}</button>)}
          {!filtered.length ? <p className="muted">No matching notes.</p> : null}
        </nav>
        {editing && canEdit ? <p className="hint">Save or cancel before switching topics.</p> : null}
      </aside>
      {note ? editing && canEdit ? <NoteEditor key={note.id} note={note} save={save} onCancel={() => setEditing(false)} onSaved={(next) => { setSaved((rows) => ({ ...rows, [next.id]: next })); setEditing(false); setSavedMessage("Saved."); }} />
        : <NoteView key={`${note.id}:${note.updated_at}`} note={note} canEdit={canEdit} savedMessage={savedMessage} onEdit={() => { setSavedMessage(""); setEditing(true); }} /> : null}
    </div>
  );
}

function NoteView({ note, canEdit, onEdit, savedMessage }: { note: NoteRow; canEdit: boolean; onEdit(): void; savedMessage: string }) {
  const [tab, setTab] = useState("Notes");
  const [recall, setRecall] = useState(false);
  const [focus, setFocus] = useState<{ concept: string; tick: number }>();
  const parsed = useMemo(() => parseVisuals(note.visual), [note.visual]);
  const groups = useMemo(() => galleryGroups(note.body, parsed.visuals), [note.body, parsed]);
  const concepts = useMemo(() => new Set(groups.map((g) => g.concept)), [groups]);
  const problems = NEETCODE_150.filter((p) => p.topic === note.id);
  const links: AutoLink[] = problems.map((p) => ({ alias: p.title, href: leetcodeUrl(p), exact: false }));
  return (
    <section className="notes-main" aria-labelledby="notes-topic-title">
      <header className="notes-heading"><h2 id="notes-topic-title">{note.title}</h2><div className="actions"><button className="btn ghost small" type="button" aria-pressed={recall} onClick={() => setRecall(!recall)}>Recall mode</button>{canEdit ? <button type="button" className="btn ghost small" onClick={onEdit}>Edit note</button> : null}</div></header>
      {savedMessage ? <p role="status">{savedMessage}</p> : null}
      <div className="notes-tabs" role="tablist" aria-label="Note view">
        {["Notes", "Visuals"].map((t) => <button type="button" key={t} id={`notes-tab-${t}`} role="tab" aria-selected={tab === t} aria-controls="notes-panel" onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div role="tabpanel" id="notes-panel" aria-labelledby={`notes-tab-${tab}`}>
        {tab === "Notes" ? <>
          {note.body ? <ConceptCards key={String(recall)} body={note.body} recall={recall} links={links} visualConcepts={concepts} onVisual={(concept) => { setFocus({ concept, tick: Date.now() }); setTab("Visuals"); }} /> : <p>No content for this topic yet.</p>}
          {note.free ? <section className="notes-free" aria-label="Free notes"><h3>Free notes</h3><Markdown key={String(recall)} text={note.free} recall={recall} links={links} /></section> : null}
          {problems.length ? <section className="notes-problems" aria-label="NeetCode problems"><h3>NeetCode problems</h3><ul>{problems.map((p) => <li key={p.lc}><a href={leetcodeUrl(p)} target="_blank" rel="noopener noreferrer">{p.title} ↗</a></li>)}</ul></section> : null}
        </> : <>
          {parsed.invalid ? <p role="status">Some visuals could not be loaded. The note is still available.</p> : null}
          <VisualsTab groups={groups} focus={focus} />
        </>}
      </div>
    </section>
  );
}
