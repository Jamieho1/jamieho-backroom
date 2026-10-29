"use client";
/**
 * One landing section (TKT-54). Visitors see the pre-rendered Markdown. In Edit site mode the owner edits
 * the Markdown in place; a failed save keeps the draft on screen with Retry, never silently dropping it.
 */
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "./viewer-provider";
import { Markdown } from "./markdown";
import type { SaveResult } from "@/app/actions/site";

export interface EditableSectionProps {
  sectionKey: string;
  title: string;
  body: string;
  heading?: "h1" | "h2";
  /** Injected for tests; defaults to the server action. */
  save?: (key: string, title: string, body: string) => Promise<SaveResult>;
  className?: string;
  children?: ReactNode;
}

export function EditableSection({ sectionKey, title, body, heading = "h2", save, className, children }: EditableSectionProps) {
  const { editing } = useViewer();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftBody, setDraftBody] = useState(body);
  const [saved, setSaved] = useState<{ title: string; body: string } | null>(null);
  const [status, setStatus] = useState<SaveResult | null>(null);
  const [pending, start] = useTransition();
  const H = heading;
  const shownTitle = saved?.title ?? title;
  const shownBody = saved?.body ?? body;

  const doSave = () =>
    start(async () => {
      setStatus(null);
      let result: SaveResult;
      try {
        const fn = save ?? (await import("@/app/actions/site")).saveSection;
        result = await fn(sectionKey, draftTitle, draftBody);
      } catch {
        result = { ok: false, message: "Couldn't save. Your text is still here, try again." };
      }
      setStatus(result);
      if (result.ok) {
        setSaved({ title: draftTitle, body: draftBody });
        setOpen(false);
        router.refresh();
      }
    });

  if (editing && open) {
    return (
      <section className={`${className ?? ""} editing`} aria-label={`Editing ${shownTitle || sectionKey}`}>
        <label className="field">
          <span>Title</span>
          <input value={draftTitle} maxLength={120} onChange={(e) => setDraftTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>Text (Markdown)</span>
          <textarea value={draftBody} rows={Math.min(18, Math.max(5, draftBody.split("\n").length + 2))} onChange={(e) => setDraftBody(e.target.value)} />
        </label>
        <div className="edit-bar">
          <button type="button" className="btn" disabled={pending} onClick={doSave}>
            {pending ? "Saving…" : status && !status.ok ? "Retry" : "Save"}
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={pending}
            onClick={() => {
              setDraftTitle(shownTitle);
              setDraftBody(shownBody);
              setStatus(null);
              setOpen(false);
            }}
          >
            Cancel
          </button>
          {status ? (
            <span role="status" className={status.ok ? "ok" : "err"}>
              {status.message}
            </span>
          ) : null}
        </div>
        <div className="preview" aria-label="Preview">
          <Markdown text={draftBody} />
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      {shownTitle ? <H>{shownTitle}</H> : null}
      {saved ? <Markdown text={shownBody} /> : children ?? <Markdown text={shownBody} />}
      {editing ? (
        <button type="button" className="btn ghost small edit-btn" onClick={() => setOpen(true)} aria-label={`Edit ${shownTitle || sectionKey}`}>
          Edit
        </button>
      ) : null}
      {status?.ok ? (
        <span role="status" className="ok small">
          {status.message}
        </span>
      ) : null}
    </section>
  );
}
