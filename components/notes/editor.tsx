"use client";

import { useState, useTransition } from "react";
import { NOTE_TEXT_LIMIT, type NoteRow, type NoteEdit } from "@/lib/notes";
import { saveNote, type NoteSaveResult } from "@/app/actions/notes";

export type SaveNote = (id: string, edit: NoteEdit) => Promise<NoteSaveResult>;

export function NoteEditor({ note, onSaved, onCancel, save = saveNote }: {
  note: NoteRow;
  onSaved(note: NoteRow): void;
  onCancel(): void;
  save?: SaveNote;
}) {
  const [body, setBody] = useState(note.body);
  const [free, setFree] = useState(note.free ?? "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <section className="notes-main" aria-label={`Editing ${note.title}`}>
      <h2>{note.title}</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setError("");
          let result: NoteSaveResult;
          try { result = await save(note.id, { body, free }); }
          catch { result = { ok: false, message: "Couldn't save. Your draft is still here — retry." }; }
          if (result.ok) onSaved({ ...note, body: result.body, free: result.free, updated_at: result.updated_at });
          else setError(result.message);
        });
      }}>
        <label className="field"><span>Note body (Markdown)</span><textarea rows={18} maxLength={NOTE_TEXT_LIMIT} value={body} disabled={pending} onChange={(e) => setBody(e.target.value)} /></label>
        <label className="field"><span>Free notes (Markdown)</span><textarea rows={8} maxLength={NOTE_TEXT_LIMIT} value={free} disabled={pending} onChange={(e) => setFree(e.target.value)} /></label>
        <div className="actions">
          <button className="btn" type="submit" disabled={pending}>{pending ? "Saving…" : error ? "Retry" : "Save"}</button>
          <button className="btn ghost" type="button" disabled={pending} onClick={onCancel}>Cancel</button>
          {error ? <p role="alert">{error}</p> : null}
        </div>
      </form>
    </section>
  );
}
