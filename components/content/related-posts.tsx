'use client';
import {useEffect,useState} from 'react';
import {PostCard} from './post-card';
import {isNew,type HubPost,type HubSeries} from '@/lib/content-hub';
import {readIds} from '@/lib/content-read-state';

/** "More like this": the same cards as Latest. New / Read badges are decided in the browser (the page itself stays cacheable). */
export function RelatedPosts({posts,series}:{posts:HubPost[];series:HubSeries[]}){
 const [read,setRead]=useState<ReadonlySet<string>>(new Set());
 const [now,setNow]=useState<number|null>(null);
 useEffect(()=>{setRead(readIds());setNow(Date.now());},[]);
 if(!posts.length)return null;
 return <section className="post-related" aria-labelledby="post-related-h">
  <h2 id="post-related-h" className="hub-eyebrow">More like this</h2>
  <div className="hub-grid">{posts.map(p=><PostCard key={p.id} post={p} series={series} isNew={now!==null&&isNew(p.created_at,now)} isRead={read.has(p.id)}/>)}</div>
 </section>;
}
