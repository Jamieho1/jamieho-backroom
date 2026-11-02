"use client";
import { useState, useTransition } from "react";
import { KINDS, KIND_LABEL, LIMITS, validateItem, type Item, type Kind } from "@/lib/experience";
import type { ExpResult } from "@/app/actions/experience";
import type { ExperienceApi } from "./experience-section";

export function ItemEditor({
  initial,
  api,
  onSaved,
  onCancel,
  isNew = false,
  canUp = false,
  canDown = false,
}: {
  initial: Item;
  api: ExperienceApi;
  onSaved(r: ExpResult): void;
  onCancel?(): void;
  isNew?: boolean;
  canUp?: boolean;
  canDown?: boolean;
}) {
  const [it, setIt] = useState<Item>(initial);
  const [status, setStatus] = useState<ExpResult | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, start] = useTransition();
  const label = it.title || (isNew ? "new item" : "untitled");
  const set = (patch: Partial<Item>) => setIt((x) => ({ ...x, ...patch }));
  const setBullet = (i: number, patch: Partial<Item["bullets"][number]>) => set({ bullets: it.bullets.map((b, k) => (k === i ? { ...b, ...patch } : b)) });
  const moveBullet = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= it.bullets.length) return;
    const next = [...it.bullets];
    [next[i], next[j]] = [next[j], next[i]];
    set({ bullets: next });
  };
  const run = (fn: () => Promise<ExpResult>) =>
    start(async () => {
      setStatus(null);
      let r: ExpResult;
      try {
        r = await fn();
      } catch {
        r = { ok: false, message: "Couldn't save. Your changes are still here, try again." };
      }
      setStatus(r);
      onSaved(r);
    });

  return (
    <article className="xp-edit" aria-label={`Experience: ${label}`}><fieldset className="xp-editor-fields" disabled={pending}>
      <div className="xp-edit-top">
        <span className={`pill ${it.public ? "on" : ""}`}>{it.public ? "Public" : "Hidden"}</span>
        {!isNew ? (
          <>
            <button type="button" className="btn ghost small" disabled={pending || !canUp} aria-label={`Move ${label} up`} onClick={() => run(() => api.move(it.id!, -1))}>
              ↑
            </button>
            <button type="button" className="btn ghost small" disabled={pending || !canDown} aria-label={`Move ${label} down`} onClick={() => run(() => api.move(it.id!, 1))}>
              ↓
            </button>
          </>
        ) : null}
      </div>
      <div className="xp-grid">
        <label className="field">
          <span>Type</span>
          <select value={it.kind} onChange={(e) => set({ kind: e.target.value as Kind })}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Title</span>
          <input value={it.title} maxLength={LIMITS.title} onChange={(e) => set({ title: e.target.value })} />
        </label>
        <label className="field">
          <span>Organisation</span>
          <input value={it.org} maxLength={LIMITS.org} onChange={(e) => set({ org: e.target.value })} />
        </label>
        <label className="field">
          <span>Dates</span>
          <input value={it.dates} maxLength={LIMITS.dates} placeholder="Sep 2024 – Present" onChange={(e) => set({ dates: e.target.value })} />
        </label>
        <label className="field">
          <span>Location</span>
          <input value={it.location} maxLength={LIMITS.location} onChange={(e) => set({ location: e.target.value })} />
        </label>
      </div>
      <label className="field">
        <span>Summary (optional)</span>
        <textarea rows={2} value={it.summary} maxLength={LIMITS.summary} onChange={(e) => set({ summary: e.target.value })} />
      </label>
      <label className="check">
        <input type="checkbox" checked={it.public} onChange={(e) => set({ public: e.target.checked })} /> Show this on the landing page
      </label>

      <fieldset className="xp-bullets">
        <legend>Bullets</legend>
        {it.bullets.map((b, i) => (
          <div key={b.id ?? `new-${i}`} className="xp-bullet">
            <label className="sr-only" htmlFor={`b-${it.id ?? "new"}-${i}`}>
              Bullet {i + 1}
            </label>
            <textarea id={`b-${it.id ?? "new"}-${i}`} rows={2} value={b.text} maxLength={LIMITS.bullet} onChange={(e) => setBullet(i, { text: e.target.value })} />
            <label className="check">
              <input type="checkbox" checked={b.public} onChange={(e) => setBullet(i, { public: e.target.checked })} aria-label={`Bullet ${i + 1} public`} /> Public
            </label>
            <button type="button" className="btn ghost small" aria-label={`Move bullet ${i + 1} up`} disabled={i === 0} onClick={() => moveBullet(i, -1)}>
              ↑
            </button>
            <button type="button" className="btn ghost small" aria-label={`Move bullet ${i + 1} down`} disabled={i === it.bullets.length - 1} onClick={() => moveBullet(i, 1)}>
              ↓
            </button>
            <button type="button" className="btn ghost small" aria-label={`Remove bullet ${i + 1}`} onClick={() => set({ bullets: it.bullets.filter((_, k) => k !== i) })}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn ghost small" onClick={() => set({ bullets: [...it.bullets, { text: "", public: false }] })}>
          Add bullet
        </button>
      </fieldset>

      <div className="edit-bar">
        <button
          type="button"
          className="btn"
          disabled={pending}
          onClick={() => {
            const invalid = validateItem(it);
            if (invalid) return setStatus({ ok: false, message: invalid });
            run(() => api.save(it));
          }}
        >
          {pending ? "Saving…" : status && !status.ok ? "Retry" : "Save"}
        </button>
        {onCancel ? <button type="button" className="btn ghost" disabled={pending} onClick={onCancel}>Cancel</button> : null}
        {!isNew ? (
          <button
            type="button"
            className="btn ghost danger"
            disabled={pending}
            onClick={() => (confirmDelete ? run(() => api.remove(it.id!)) : setConfirmDelete(true))}
            onBlur={() => setConfirmDelete(false)}
          >
            {confirmDelete ? "Click again to delete" : "Delete"}
          </button>
        ) : null}
        {status?.message ? (
          <span role="status" className={status.ok ? "ok" : "err"}>
            {status.message}
          </span>
        ) : null}
      </div>
    </fieldset></article>
  );
}
