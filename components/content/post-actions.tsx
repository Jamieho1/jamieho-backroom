'use client';
import Link from 'next/link';
import {useViewer} from '@/components/viewer-provider';
import {SignInButton} from '@/components/sign-in-button';
import {useArticlePins} from '@/components/articles/use-article-pins';
import {articleHref} from '@/lib/articles';

/** By the meta line: a small "☆ Pin" button (pins need sign-in; visitors get a sign-in button instead) and, for the owner, a Manage link. */
export function PostActions({id,slug,title}:{id:string;slug:string;title:string}){
 const {viewer,configured}=useViewer();
 const signedIn=viewer.status==='member'||viewer.status==='owner';
 const pins=useArticlePins(signedIn&&viewer.id?viewer.id:null);
 const pinned=pins.ids.has(id);
 return <div className="post-actions">
  {signedIn?<button type="button" className="post-pin" aria-pressed={pinned} aria-label={`${pinned?'Unpin':'Pin'} ${title}`} disabled={!pins.loaded||pins.saving} onClick={()=>void pins.save(id,!pinned)}><span aria-hidden="true">{pinned?'★':'☆'}</span> {pinned?'Pinned':'Pin'}</button>
   :viewer.status==='anonymous'&&configured?<SignInButton className="post-pin" label="☆ Pin" next={articleHref(slug)}/>:null}
  {viewer.status==='owner'?<Link className="post-pin" prefetch={false} href="/articles/manage">Manage</Link>:null}
  {signedIn&&pins.loadError?<p role="alert" className="post-pin-note">{pins.loadError} <button type="button" onClick={pins.reload}>Retry loading pins</button></p>:null}
  {pins.saveError?<p role="alert" className="post-pin-note">{pins.saveError} <button type="button" onClick={()=>void pins.retry()}>Retry pin change</button></p>:null}
 </div>;
}
