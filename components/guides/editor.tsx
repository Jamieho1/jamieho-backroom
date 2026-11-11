'use client';
import {useState} from 'react';
import Link from 'next/link';
import {saveGuide} from '@/app/actions/guides';
import {emptyGuide,guideHref,type Guide,type GuideEdit} from '@/lib/guides';
import {ArticleMarkdown} from '@/components/articles/article-markdown';
import {ImageUploadButton,type Uploader} from '@/components/articles/image-upload';
import {imageMarkdown} from '@/lib/article-images';
/** Pictures share the article-images bucket under a guides-<slug> folder. */
const folder=(slug:string)=>slug?`guides-${slug}`:'';
export function GuideEditor({initial,upload}:{initial:Guide[];upload?:Uploader}){
 const [guides,setGuides]=useState(initial);const [draft,setDraft]=useState<GuideEdit|null>(null);const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 async function save(){if(!draft||saving)return;setSaving(true);setError('');try{const r=await saveGuide(draft);if(r.ok){setGuides(xs=>[r.guide,...xs.filter(g=>g.id!==r.guide.id)]);setDraft(null);}else setError(r.message);}catch{setError("Couldn't save. Your draft is still here — retry.");}finally{setSaving(false);}}
 const url=(k:'notion_url'|'doc_url'|'cover_url',label:string)=>draft?<label className="field"><span>{label}</span><input type="url" placeholder="https://…" maxLength={2048} value={draft[k]} disabled={saving} onChange={e=>setDraft({...draft,[k]:e.target.value})} /></label>:null;
 return <div className="page articles-page"><header className="articles-heading"><h1>Manage guides</h1><Link href="/guides" prefetch={false}>Published guides</Link></header>
 {draft?<form aria-label="Edit guide" onSubmit={e=>{e.preventDefault();void save();}}>
  <label className="field"><span>Title</span><input required maxLength={160} value={draft.title} disabled={saving} onChange={e=>setDraft({...draft,title:e.target.value})} /></label>
  <label className="field"><span>URL slug</span><input aria-describedby="guide-slug-help" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={draft.slug} disabled={saving} onChange={e=>setDraft({...draft,slug:e.target.value})} /></label><p id="guide-slug-help" className="muted small">This becomes /guides/your-slug. Keep it generic so every post on the topic can link here.</p>
  <label className="field"><span>Summary</span><textarea rows={3} maxLength={600} value={draft.summary} disabled={saving} onChange={e=>setDraft({...draft,summary:e.target.value})} /></label>
  {url('notion_url','Notion toolkit link (optional)')}{url('doc_url','Google Doc link (optional)')}{url('cover_url','Cover image URL (optional)')}
  <ImageUploadButton slug={folder(draft.slug)} label="Upload cover" disabled={saving} upload={upload} onUploaded={([f])=>setDraft(d=>d&&{...d,cover_url:f.url})} />
  <label className="field"><span>Guide (Markdown)</span><textarea rows={20} maxLength={200000} value={draft.body} disabled={saving} onChange={e=>setDraft({...draft,body:e.target.value})} /></label><ImageUploadButton slug={folder(draft.slug)} label="Add pictures" multiple disabled={saving} upload={upload} onUploaded={files=>setDraft(d=>d&&{...d,body:`${d.body.trimEnd()}\n\n${files.map(f=>imageMarkdown(f.url,f.name)).join('\n\n')}\n`})} />
  <label className="check"><input type="checkbox" checked={draft.published} disabled={saving} onChange={e=>setDraft({...draft,published:e.target.checked})} /> Publish publicly</label>
  <p className="muted">Leave this unticked to save a private draft. Untick and Save to unpublish.</p>
  {error?<p role="alert">{error}</p>:null}<div className="actions"><button className="btn" type="submit" disabled={saving}>{saving?'Saving…':error?'Retry':'Save guide'}</button><button className="btn ghost" type="button" disabled={saving} onClick={()=>setDraft(null)}>Cancel</button></div>
  <details className="article-preview"><summary>Preview guide</summary><ArticleMarkdown text={draft.body} /></details>
 </form>:<><button className="btn" onClick={()=>{setDraft(emptyGuide());setError('');}}>New guide</button>{!guides.length?<p>No guides yet. Create a draft to get started.</p>:<ul className="article-admin-list">{guides.map(g=><li key={g.id}><strong>{g.title}</strong><span className="badge">{g.published?'Published':'Draft'}</span><button className="btn ghost small" onClick={()=>{setDraft({...g});setError('');}}>Edit {g.title}</button>{g.published?<Link prefetch={false} href={guideHref(g.slug)}>Open guide</Link>:null}</li>)}</ul>}</>}
 </div>;
}
