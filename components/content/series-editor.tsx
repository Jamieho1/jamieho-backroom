'use client';
import {useState} from 'react';
import Link from 'next/link';
import {saveSeries} from '@/app/actions/content-series';
import {emptySeries,seriesHref,SERIES_TOPICS,SERIES_TOPIC_LABEL,MAX_PLANNED_PARTS,type SeriesRow,type SeriesEdit} from '@/lib/content-series-data';
/** Owner-only series editor: list, create, edit, publish. Posts and guides join a series from their own editors. */
export function SeriesEditor({initial}:{initial:SeriesRow[]}){
 const [rows,setRows]=useState(initial);const [draft,setDraft]=useState<SeriesEdit|null>(null);const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 async function save(){if(!draft||saving)return;setSaving(true);setError('');try{const r=await saveSeries(draft);if(r.ok){setRows(xs=>[r.series,...xs.filter(x=>x.id!==r.series.id)].sort((a,b)=>a.sort-b.sort||a.title.localeCompare(b.title)));setDraft(null);}else setError(r.message);}catch{setError("Couldn't save. Your draft is still here — retry.");}finally{setSaving(false);}}
 return <div className="page articles-page"><header className="articles-heading"><h1>Manage series</h1><Link href="/content/series" prefetch={false}>Published series</Link></header>
 {draft?<form aria-label="Edit series" onSubmit={e=>{e.preventDefault();void save();}}>
  <label className="field"><span>Title</span><input required maxLength={80} value={draft.title} disabled={saving} onChange={e=>setDraft({...draft,title:e.target.value})} /></label>
  <label className="field"><span>URL slug</span><input aria-describedby="series-slug-help" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={draft.slug} disabled={saving} onChange={e=>setDraft({...draft,slug:e.target.value})} /></label><p id="series-slug-help" className="muted small">Lowercase words separated by hyphens. This becomes /content/series/your-slug.</p>
  <label className="field"><span>After this (the goal line, 200 characters at most)</span><textarea rows={2} maxLength={200} value={draft.goal} disabled={saving} onChange={e=>setDraft({...draft,goal:e.target.value})} /></label>
  <fieldset className="field"><legend>Topic</legend><div className="articles-pills">{SERIES_TOPICS.map(t=><button key={t} type="button" className="articles-pill" aria-pressed={draft.topic===t} disabled={saving} onClick={()=>setDraft({...draft,topic:t})}>{SERIES_TOPIC_LABEL[t]}</button>)}</div></fieldset>
  <label className="field"><span>Planned parts (1-{MAX_PLANNED_PARTS})</span><input type="number" required min={1} max={MAX_PLANNED_PARTS} step={1} value={draft.planned_parts} disabled={saving} onChange={e=>setDraft({...draft,planned_parts:Number(e.target.value)})} /></label>
  <label className="field"><span>Order on the Series page (lower comes first)</span><input type="number" min={-1000} max={1000} step={1} value={draft.sort} disabled={saving} onChange={e=>setDraft({...draft,sort:Number(e.target.value)})} /></label>
  <label className="check"><input type="checkbox" checked={draft.published} disabled={saving} onChange={e=>setDraft({...draft,published:e.target.checked})} /> Publish publicly</label>
  <p className="muted">Leave this unticked to save a private draft. Untick and Save to unpublish.</p>
  {error?<p role="alert">{error}</p>:null}<div className="actions"><button className="btn" type="submit" disabled={saving}>{saving?'Saving…':error?'Retry':'Save series'}</button><button className="btn ghost" type="button" disabled={saving} onClick={()=>setDraft(null)}>Cancel</button></div>
 </form>:<><button className="btn" onClick={()=>{setDraft(emptySeries());setError('');}}>New series</button>{!rows.length?<p>No series yet. Create one, then add posts and guides to it from their editors.</p>:<ul className="article-admin-list">{rows.map(x=><li key={x.id}><strong>{x.title}</strong><span className="badge">{x.published?'Published':'Draft'}</span><span className="muted small">{SERIES_TOPIC_LABEL[x.topic]} · {x.planned_parts} planned</span><button className="btn ghost small" onClick={()=>{setDraft({id:x.id,slug:x.slug,title:x.title,goal:x.goal,topic:x.topic,planned_parts:x.planned_parts,sort:x.sort,published:x.published});setError('');}}>Edit {x.title}</button>{x.published?<Link prefetch={false} href={seriesHref(x.slug)}>Open series</Link>:null}</li>)}</ul>}</>}
 </div>;
}
