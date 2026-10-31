"use client";
/**
 * A project as a small desktop window (TKT-56). Every card is public; opening a non-public app needs access.
 * In Edit site mode the owner edits the card's name, description, tags and screenshot links.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "./viewer-provider";
import { VISIBILITY_LABEL, type AppRow } from "@/lib/apps";
import { SignInButton } from "./sign-in-button";
import { CARD_LIMITS, DESKTOP_READY, parseLines, parseTags, validateCard, type CardEdit } from "@/lib/projects";
import type { CardResult } from "@/app/actions/projects";
import { logDesktopOpen } from "@/app/actions/desktop";

const GLYPH: Record<string, string> = { notes: "▤", code: "{ }", chat: "❝", gear: "⚙" };

export type OpenState = "visit" | "open" | "sign-in" | "invite-only" | "soon";
export const OPEN_LABEL: Record<OpenState, string> = { visit: "Visit ↗", open: "Open", "sign-in": "Sign in to open", "invite-only": "Invite only · sign in", soon: "Coming soon" };

/** What the card's button does for this viewer. The database still decides what an opened app can read. */
export function openState(app: Pick<AppRow, "kind" | "visibility" | "url">, status: "loading" | "anonymous" | "member" | "owner", desktopReady = DESKTOP_READY): OpenState {
  if (app.kind === "external") return "visit";
  if (!desktopReady && app.url.startsWith("/desktop")) return "soon";
  if (app.visibility === "public" || status === "owner") return "open";
  if (status === "anonymous" || status === "loading") return app.visibility === "invite_only" ? "invite-only" : "sign-in";
  return "open"; // signed in: the app itself checks the invite list (and RLS guards its data)
}

export function ProjectCard({ app, save }: { app: AppRow; save?: (id: string, card: CardEdit) => Promise<CardResult> }) {
  const { viewer, editing, configured } = useViewer();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<CardEdit>({ name: app.name, description: app.description, tags: app.tags, screenshots: app.screenshots });
  const shot = shown.screenshots[0];
  const state = openState(app, viewer.status);

  if (editing && open) return <CardEditor app={app} initial={shown} save={save} onDone={(c) => (c && setShown(c), setOpen(false))} />;

  return (
    <article className="win" aria-label={shown.name}>
      <div className="win-bar">
        <i />
        <i />
        <i />
        <span>{shown.name}</span>
        {app.visibility !== "public" ? <span className="win-vis">{VISIBILITY_LABEL[app.visibility]}</span> : null}
      </div>
      <div className="win-shot">
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot} alt={`Screenshot of ${shown.name}`} loading="lazy" />
        ) : (
          <div className="win-placeholder" aria-hidden="true">
            <span>{GLYPH[app.icon] ?? "◻"}</span>
          </div>
        )}
      </div>
      <div className="win-body">
        <p>{shown.description}</p>
        {shown.tags.length ? (
          <ul className="tags" aria-label="Built with">
            {shown.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        <div className="win-actions">
          {(state === "sign-in" || state === "invite-only") && viewer.status === "anonymous" && configured ? (
            <SignInButton next={app.url} label={OPEN_LABEL[state]} className="btn ghost" />
          ) : state === "open" || state === "visit" ? (
            <a className="btn ghost" href={app.url} onClick={() => { if (state === "visit" && (viewer.status === "member" || viewer.status === "owner")) void logDesktopOpen(app.id); }} {...(state === "visit" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {OPEN_LABEL[state]}
            </a>
          ) : (
            <span className="btn ghost" aria-disabled="true">
              {OPEN_LABEL[state]}
            </span>
          )}
          {editing ? (
            <button type="button" className="btn ghost small" onClick={() => setOpen(true)} aria-label={`Edit ${shown.name} card`}>
              Edit
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CardEditor({ app, initial, save, onDone }: { app: AppRow; initial: CardEdit; save?: (id: string, card: CardEdit) => Promise<CardResult>; onDone(saved: CardEdit | null): void }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [shots, setShots] = useState(initial.screenshots.join("\n"));
  const [status, setStatus] = useState<CardResult | null>(null);
  const [pending, start] = useTransition();
  const card = (): CardEdit => ({ name, description, tags: parseTags(tags), screenshots: parseLines(shots) });

  return (
    <article className="win editing" aria-label={`Editing ${initial.name} card`}>
      <label className="field">
        <span>Name</span>
        <input value={name} maxLength={CARD_LIMITS.name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="field">
        <span>Description</span>
        <textarea rows={3} value={description} maxLength={CARD_LIMITS.description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="field">
        <span>Tags (comma-separated)</span>
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </label>
      <label className="field">
        <span>Screenshot links (https, one per line; the first is shown)</span>
        <textarea rows={2} value={shots} onChange={(e) => setShots(e.target.value)} />
      </label>
      <p className="muted small">Who can open it is set in Settings.</p>
      <div className="edit-bar">
        <button
          type="button"
          className="btn"
          disabled={pending}
          onClick={() => {
            const c = card();
            const invalid = validateCard(c);
            if (invalid) return setStatus({ ok: false, message: invalid });
            start(async () => {
              let r: CardResult;
              try {
                r = await (save ?? (await import("@/app/actions/projects")).saveCard)(app.id, c);
              } catch {
                r = { ok: false, message: "Couldn't save. Your changes are still here, try again." };
              }
              setStatus(r);
              if (r.ok) {
                onDone(c);
                router.refresh();
              }
            });
          }}
        >
          {pending ? "Saving…" : status && !status.ok ? "Retry" : "Save"}
        </button>
        <button type="button" className="btn ghost" disabled={pending} onClick={() => onDone(null)}>
          Cancel
        </button>
        {status ? (
          <span role="status" className={status.ok ? "ok" : "err"}>
            {status.message}
          </span>
        ) : null}
      </div>
    </article>
  );
}
