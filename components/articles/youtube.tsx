'use client';
import {useState} from 'react';
/** Click-to-play YouTube: nothing loads from YouTube (and no cookies are set) until the reader presses play. */
export function YouTubeEmbed({id,title='Video'}:{id:string;title?:string}){
 const [on,setOn]=useState(false);
 return <div className="article-video">{on
  ?<iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
  :<button type="button" className="article-video-play" onClick={()=>setOn(true)} aria-label={`Play video: ${title}`}><span aria-hidden="true">▶</span><small>Play video · loads YouTube</small></button>}
 </div>;
}
