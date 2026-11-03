'use client';
import {useState} from 'react';
import Link from 'next/link';
import {saveArticle} from '@/app/actions/articles';
import {emptyArticle,articleHref,CATEGORY_LABEL,PLATFORM_LABEL,type Article,type ArticleEdit} from '@/lib/articles';
import {ArticleMarkdown} from './article-markdown';
import {ImageUploadButton,type Uploader} from './image-upload';
import {imageMarkdown} from '@/lib/article-images';
export function ArticleEditor({initial,projects=[],upload}:{initial:Article[];projects?:{id:string;name:string}[];upload?:Uploader}){
 const [articles,setArticles]=useState(initial);const [draft,setDraft]=useState<ArticleEdit|null>(null);const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 function edit(article:ArticleEdit){setDraft({...article});setError('');}
 async function save(){if(!draft||saving)return;setSaving(true);setError('');try{const result=await saveArticle(draft);if(result.ok){setArticles(xs=>[result.article,...xs.filter(a=>a.id!==result.article.id)]);setDraft(null);}else setError(result.message);}catch{setError("Couldn't save. Your draft is still here — retry.");}finally{setSaving(false);}}
 return <div className="page articles-page"><header className="articles-heading"><h1>Manage articles</h1><Link href="/articles" prefetch={false}>Published articles</Link></header>
 {draft?<form aria-label="Edit article" onSubmit={e=>{e.preventDefault();void save();}}>
  <label className="field"><span>Title</span><input required maxLength={160} value={draft.title} disabled={saving} onChange={e=>setDraft({...draft,title:e.target.value})} /></label>
  <label className="field"><span>URL slug</span><input aria-describedby="article-slug-help" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={draft.slug} disabled={saving} onChange={e=>setDraft({...draft,slug:e.target.value})} /></label><p id="article-slug-help" className="muted small">Lowercase words separated by hyphens. This becomes /articles/your-slug. Changing an existing slug changes its shared link.</p>
  <label className="field"><span>Summary</span><textarea rows={3} maxLength={600} value={draft.summary} disabled={saving} onChange={e=>setDraft({...draft,summary:e.target.value})} /></label>
  <fieldset className="field"><legend>Category</legend><div className="articles-pills">{(Object.keys(CATEGORY_LABEL) as ArticleEdit['category'][]).map(c=><button key={c} type="button" className="articles-pill" aria-pressed={draft.category===c} disabled={saving} onClick={()=>setDraft({...draft,category:c})}>{CATEGORY_LABEL[c]}</button>)}</div></fieldset>
  <fieldset className="field"><legend>Platform</legend><div className="articles-toggle">{(Object.keys(PLATFORM_LABEL) as ArticleEdit['platform'][]).map(p=><button key={p} type="button" aria-pressed={draft.platform===p} disabled={saving} onClick={()=>setDraft({...draft,platform:p})}>{PLATFORM_LABEL[p]}</button>)}</div></fieldset>
  <label className="field"><span>Cover image URL (optional)</span><input type="url" placeholder="https://…" maxLength={2048} value={draft.cover_url} disabled={saving} onChange={e=>setDraft({...draft,cover_url:e.target.value})} /></label>
  <ImageUploadButton slug={draft.slug} label="Upload cover" disabled={saving} upload={upload} onUploaded={([f])=>setDraft(d=>d&&{...d,cover_url:f.url})} />
  {projects.length?<label className="field"><span>Part of project (optional)</span><select value={draft.project_id??''} disabled={saving} onChange={e=>setDraft({...draft,project_id:e.target.value||null})}><option value="">None</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>:null}
  <label className="field"><span>Video or post URL (optional; YouTube links play in the article)</span><input type="url" placeholder="https://…" maxLength={2048} value={draft.source_url} disabled={saving} onChange={e=>setDraft({...draft,source_url:e.target.value})} /></label>
  <label className="field"><span>Article (Markdown)</span><textarea aria-describedby="article-body-help" rows={20} maxLength={200000} value={draft.body} disabled={saving} onChange={e=>setDraft({...draft,body:e.target.value})} /></label><ImageUploadButton slug={draft.slug} label="Add pictures" multiple disabled={saving} upload={upload} onUploaded={files=>setDraft(d=>d&&{...d,body:`${d.body.trimEnd()}\n\n${files.map(f=>imageMarkdown(f.url,f.name)).join('\n\n')}\n`})} />
  <p id="article-body-help" className="muted small">Use <code>## Section</code> headings. Pictures: use Add pictures (they're added at the end; move each line where you want it), or paste <code>![Caption](https://…image.png)</code>. A YouTube link on its own line becomes a video.</p>
  <label className="check"><input type="checkbox" checked={draft.published} disabled={saving} onChange={e=>setDraft({...draft,published:e.target.checked})} /> Publish publicly</label>
  <p className="muted">Leave this unticked to save a private draft. Untick and Save to unpublish.</p>
  {error?<p role="alert">{error}</p>:null}<div className="actions"><button className="btn" type="submit" disabled={saving}>{saving?'Saving…':error?'Retry':'Save article'}</button><button className="btn ghost" type="button" disabled={saving} onClick={()=>setDraft(null)}>Cancel</button></div>
  <details className="article-preview"><summary>Preview article</summary><ArticleMarkdown text={draft.body} /></details>
 </form>:<><button className="btn" onClick={()=>edit(emptyArticle())}>New article</button>{!articles.length?<p>No articles yet. Create a draft to get started.</p>:<ul className="article-admin-list">{articles.map(a=><li key={a.id}><strong>{a.title}</strong><span className="badge">{a.published?'Published':'Draft'}</span><button className="btn ghost small" onClick={()=>edit(a)}>Edit {a.title}</button>{a.published?<Link prefetch={false} href={articleHref(a.slug)}>Open article</Link>:null}</li>)}</ul>}</>}
 </div>;
}
