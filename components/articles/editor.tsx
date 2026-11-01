'use client';
import {useState} from 'react';
import Link from 'next/link';
import {saveArticle} from '@/app/actions/articles';
import {emptyArticle,articleHref,PLATFORM_LABEL,type Article,type ArticleEdit} from '@/lib/articles';
import {Markdown} from '@/components/markdown';
export function ArticleEditor({initial}:{initial:Article[]}){
 const [articles,setArticles]=useState(initial);const [draft,setDraft]=useState<ArticleEdit|null>(null);const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 function edit(article:ArticleEdit){setDraft({...article});setError('');}
 async function save(){if(!draft||saving)return;setSaving(true);setError('');try{const result=await saveArticle(draft);if(result.ok){setArticles(xs=>[result.article,...xs.filter(a=>a.id!==result.article.id)]);setDraft(null);}else setError(result.message);}catch{setError("Couldn't save. Your draft is still here — retry.");}finally{setSaving(false);}}
 return <div className="page articles-page"><header className="articles-heading"><h1>Manage articles</h1><Link href="/articles" prefetch={false}>Published articles</Link></header>
 {draft?<form aria-label="Edit article" onSubmit={e=>{e.preventDefault();void save();}}>
  <label className="field"><span>Title</span><input required maxLength={160} value={draft.title} disabled={saving} onChange={e=>setDraft({...draft,title:e.target.value})} /></label>
  <label className="field"><span>URL slug</span><input aria-describedby="article-slug-help" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={draft.slug} disabled={saving} onChange={e=>setDraft({...draft,slug:e.target.value})} /></label><p id="article-slug-help" className="muted small">Lowercase words separated by hyphens. This becomes /articles/your-slug. Changing an existing slug changes its shared link.</p>
  <label className="field"><span>Summary</span><textarea rows={3} maxLength={600} value={draft.summary} disabled={saving} onChange={e=>setDraft({...draft,summary:e.target.value})} /></label>
  <label className="field"><span>Platform</span><select value={draft.platform} disabled={saving} onChange={e=>setDraft({...draft,platform:e.target.value as ArticleEdit['platform']})}>{Object.entries(PLATFORM_LABEL).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
  <label className="field"><span>Original video or post URL (optional)</span><input type="url" placeholder="https://…" maxLength={2048} value={draft.source_url} disabled={saving} onChange={e=>setDraft({...draft,source_url:e.target.value})} /></label>
  <label className="field"><span>Article and references (Markdown)</span><textarea rows={20} maxLength={200000} value={draft.body} disabled={saving} onChange={e=>setDraft({...draft,body:e.target.value})} /></label>
  <label className="check"><input type="checkbox" checked={draft.published} disabled={saving} onChange={e=>setDraft({...draft,published:e.target.checked})} /> Publish publicly</label>
  <p className="muted">Leave this unticked to save a private draft. Untick and Save to unpublish.</p>
  {error?<p role="alert">{error}</p>:null}<div className="actions"><button className="btn" type="submit" disabled={saving}>{saving?'Saving…':error?'Retry':'Save article'}</button><button className="btn ghost" type="button" disabled={saving} onClick={()=>setDraft(null)}>Cancel</button></div>
  <details className="article-preview"><summary>Preview article</summary><Markdown text={draft.body} /></details>
 </form>:<><button className="btn" onClick={()=>edit(emptyArticle())}>New article</button>{!articles.length?<p>No articles yet. Create a draft to get started.</p>:<ul className="article-admin-list">{articles.map(a=><li key={a.id}><strong>{a.title}</strong><span className="badge">{a.published?'Published':'Draft'}</span><button className="btn ghost small" onClick={()=>edit(a)}>Edit {a.title}</button>{a.published?<Link prefetch={false} href={articleHref(a.slug)}>Open article</Link>:null}</li>)}</ul>}</>}
 </div>;
}
