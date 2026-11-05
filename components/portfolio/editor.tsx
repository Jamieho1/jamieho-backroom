"use client";
/**
 * TKT-86: the owner's project editor (/projects/manage). Add, edit, feature, show/hide, reorder and delete
 * projects, and upload up to 6 screenshots to the project-media bucket. A failed save keeps the draft with Retry.
 */
import { useState } from "react";
import Link from "next/link";
import { deleteProject, saveProject } from "@/app/actions/portfolio";
import { ImageUploadButton, makeUploader, type Uploader } from "@/components/articles/image-upload";
import { Markdown } from "@/components/markdown";
import {
  FEATURED_LIMIT, PROJECT_LIMITS, emptyProject, moveItem, parseProjectTags, projectHref, slugify, sortProjects,
  type Project, type ProjectEdit,
} from "@/lib/portfolio-core";

export const uploadProjectMedia: Uploader = makeUploader("project-media");

type Actions = { save?: typeof saveProject; remove?: typeof deleteProject; upload?: Uploader };

export function ProjectEditor({ initial, startWith, save = saveProject, remove = deleteProject, upload = uploadProjectMedia }: { initial: Project[]; startWith?: string } & Actions) {
  const [projects, setProjects] = useState(initial);
  const first = startWith ? initial.find((p) => p.slug === startWith) : undefined;
  const [draft, setDraft] = useState<ProjectEdit | null>(first ? { ...first } : null);
  const [tags, setTags] = useState(first ? first.tags.join(", ") : "");
  const [shotUrl, setShotUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const isNew = !!draft && !projects.some((p) => p.id === draft.id);
  const featuredCount = projects.filter((p) => p.featured && p.public).length;

  function edit(p: ProjectEdit) { setDraft({ ...p }); setTags(p.tags.join(", ")); setShotUrl(""); setError(""); setConfirming(null); }
  const set = (patch: Partial<ProjectEdit>) => setDraft((d) => d && { ...d, ...patch });

  async function submit() {
    if (!draft || busy) return;
    setBusy(true); setError("");
    try {
      const result = await save({ ...draft, tags: parseProjectTags(tags) });
      if (result.ok) { setProjects((xs) => [result.project, ...xs.filter((p) => p.id !== result.project.id)]); setDraft(null); }
      else setError(result.message);
    } catch { setError("Couldn't save. Your changes are still here — retry."); }
    finally { setBusy(false); }
  }

  async function destroy(p: Project) {
    if (confirming !== p.id) { setConfirming(p.id); return; }
    setBusy(true); setError("");
    try {
      const r = await remove(p.id);
      if (r.ok) setProjects((xs) => xs.filter((x) => x.id !== p.id)); else setError(r.message);
    } catch { setError("Couldn't delete. Try again."); }
    finally { setBusy(false); setConfirming(null); }
  }

  if (draft) {
    const shots = draft.screenshots;
    return (
      <div className="page projects-manage">
        <header className="articles-heading"><h1>{isNew ? "New project" : `Edit ${draft.name || "project"}`}</h1><Link href="/projects" prefetch={false}>All projects</Link></header>
        <form aria-label="Edit project" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <label className="field"><span>Name</span><input required maxLength={PROJECT_LIMITS.name} value={draft.name} disabled={busy}
            onChange={(e) => set({ name: e.target.value, ...(isNew && (!draft.slug || draft.slug === slugify(draft.name)) ? { slug: slugify(e.target.value) } : {}) })} /></label>
          <label className="field"><span>URL slug</span><input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={draft.slug} disabled={busy} aria-describedby="project-slug-help"
            onChange={(e) => set({ slug: e.target.value })} /></label>
          <p id="project-slug-help" className="muted small">Lowercase words with hyphens; becomes /projects/your-slug. Changing it later changes the shared link.</p>
          <label className="field"><span>Tagline (one line)</span><input maxLength={PROJECT_LIMITS.tagline} value={draft.tagline} disabled={busy} onChange={(e) => set({ tagline: e.target.value })} /></label>
          <label className="field"><span>Tags (comma-separated, up to {PROJECT_LIMITS.tags})</span><input value={tags} disabled={busy} placeholder="Next.js, Python, AWS" onChange={(e) => setTags(e.target.value)} /></label>
          <label className="field"><span>Website (optional; leave empty for &quot;Website coming soon&quot;)</span><input type="url" placeholder="https://…" maxLength={2048} value={draft.url} disabled={busy} onChange={(e) => set({ url: e.target.value })} /></label>

          <fieldset className="field">
            <legend>Screenshots ({shots.length} / {PROJECT_LIMITS.screenshots}) · the first is the cover; tall full-page shots scroll in the showcase</legend>
            {shots.length ? (
              <ol className="project-shots-edit">
                {shots.map((src, i) => (
                  <li key={src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Screenshot ${i + 1}`} />
                    <span className="project-shot-actions">
                      <button type="button" className="btn ghost small" disabled={busy || i === 0} onClick={() => set({ screenshots: moveItem(shots, i, -1) })} aria-label={`Move screenshot ${i + 1} up`}>↑</button>
                      <button type="button" className="btn ghost small" disabled={busy || i === shots.length - 1} onClick={() => set({ screenshots: moveItem(shots, i, 1) })} aria-label={`Move screenshot ${i + 1} down`}>↓</button>
                      <button type="button" className="btn ghost small" disabled={busy} onClick={() => set({ screenshots: shots.filter((_, j) => j !== i) })} aria-label={`Remove screenshot ${i + 1}`}>Remove</button>
                    </span>
                  </li>
                ))}
              </ol>
            ) : <p className="muted small">No screenshots yet.</p>}
            <ImageUploadButton slug={draft.slug} label="Upload screenshots" multiple disabled={busy || shots.length >= PROJECT_LIMITS.screenshots} upload={upload}
              onUploaded={(files) => setDraft((d) => d && { ...d, screenshots: [...d.screenshots, ...files.map((f) => f.url).filter((u) => !d.screenshots.includes(u))].slice(0, PROJECT_LIMITS.screenshots) })} />
            <span className="project-shot-url">
              <input type="url" placeholder="…or paste an image link (https://)" aria-label="Screenshot link" value={shotUrl} disabled={busy || shots.length >= PROJECT_LIMITS.screenshots} onChange={(e) => setShotUrl(e.target.value)} />
              <button type="button" className="btn ghost small" disabled={busy || !/^https:\/\/\S+$/.test(shotUrl) || shots.length >= PROJECT_LIMITS.screenshots}
                onClick={() => { set({ screenshots: [...shots, shotUrl.trim()] }); setShotUrl(""); }}>Add link</button>
            </span>
          </fieldset>

          <label className="field"><span>Write-up (Markdown: what it is, the problem, how it works, what you learned)</span>
            <textarea rows={16} maxLength={PROJECT_LIMITS.body} value={draft.body} disabled={busy} onChange={(e) => set({ body: e.target.value })} /></label>
          <details className="article-preview"><summary>Preview write-up</summary><Markdown text={draft.body} /></details>

          <label className="field project-sort"><span>Order (lower comes first)</span><input type="number" min={-1000} max={1000} step={1} value={draft.sort} disabled={busy}
            onChange={(e) => set({ sort: Math.round(Number(e.target.value) || 0) })} /></label>
          <label className="check"><input type="checkbox" checked={draft.public} disabled={busy} onChange={(e) => set({ public: e.target.checked })} /> Show publicly</label>
          <label className="check"><input type="checkbox" checked={draft.featured} disabled={busy} onChange={(e) => set({ featured: e.target.checked })} /> Feature on the homepage journey</label>
          <p className="muted small">The journey shows up to {FEATURED_LIMIT} featured public projects, in order. Hidden projects are only visible to you.</p>

          {error ? <p role="alert">{error}</p> : null}
          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : error ? "Retry" : "Save project"}</button>
            <button className="btn ghost" type="button" disabled={busy} onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  const list = sortProjects(projects);
  return (
    <div className="page projects-manage">
      <header className="articles-heading"><h1>Manage projects</h1><Link href="/projects" prefetch={false}>All projects</Link></header>
      <button className="btn" onClick={() => edit(emptyProject())}>New project</button>
      {featuredCount > FEATURED_LIMIT ? <p className="muted small">{featuredCount} projects are featured; the journey shows the first {FEATURED_LIMIT}.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!list.length ? <p>No projects yet. Add one to get started.</p> : (
        <ul className="article-admin-list">
          {list.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong>
              <span className="badge">{p.public ? "Public" : "Hidden"}</span>
              {p.featured ? <span className="badge">Featured</span> : null}
              <button className="btn ghost small" disabled={busy} onClick={() => edit(p)}>Edit {p.name}</button>
              {p.public ? <Link prefetch={false} href={projectHref(p.slug)}>Open</Link> : null}
              <button className="btn ghost small danger" disabled={busy} onClick={() => void destroy(p)}>{confirming === p.id ? `Confirm delete ${p.name}` : `Delete ${p.name}`}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
