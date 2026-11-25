import Link from 'next/link';
import {CATEGORY_LABEL,PLATFORM_LABEL,articleDate,articleHref,type Platform} from '@/lib/articles';
import {seriesChip,timeLabel,type HubPost,type HubSeries} from '@/lib/content-hub';

const MARK:Record<Platform,string>={instagram:'IG',youtube:'YT',xiaohongshu:'XHS',other:'•'};
/** The platform icon: a small coloured mark with a text alternative. */
export function PlatformMark({platform}:{platform:Platform}){
 return <span className={`hub-plat hub-plat-${platform}`} role="img" aria-label={PLATFORM_LABEL[platform]}>{MARK[platform]}</span>;
}
const FALLBACK_TONE={ai:'a',career:'b',productivity:'c',building:'d'} as const;
/** 16:10 cover: the post's cover image, else its first carousel slide, else the title set as type. */
export function Cover({post,square=false}:{post:HubPost;square?:boolean}){
 const src=post.cover_url||post.firstSlide;
 return <span className={`hub-cover${square?' is-square':''}`}>
  {src?/* eslint-disable-next-line @next/next/no-img-element */<img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" />:
   <span className={`hub-cover-fallback tone-${FALLBACK_TONE[post.category]}${post.platform==='youtube'?' is-video':''}`} aria-hidden="true"><span className="hub-cover-top"><span>{CATEGORY_LABEL[post.category]}</span></span><span className="hub-cover-title">{post.title}</span></span>}
 </span>;
}
interface Props{post:HubPost;series:HubSeries[];isNew:boolean;isRead:boolean}
export function PostCard({post,series,isNew,isRead}:Props){
 const chip=seriesChip(post,series);
 return <Link className="hub-card" href={articleHref(post.slug)} prefetch={false} data-draft-changed={post.draftChanged||undefined}>
  <span className="hub-card-cover"><Cover post={post}/><span className="hub-card-plat"><PlatformMark platform={post.platform}/></span>
   {isRead?<span className="hub-badge is-read">Read</span>:isNew?<span className="hub-badge">New</span>:null}</span>
  <span className="hub-card-body">
   <span className="hub-meta">{articleDate(post.created_at)} · {CATEGORY_LABEL[post.category]}</span>
   <h3 className="hub-card-title">{post.title}</h3>
   {post.takeaway?<span className="hub-take"><b>You&apos;ll learn:</b> {post.takeaway}</span>:null}
   <span className="hub-chips"><span className="hub-chip">{timeLabel(post)}</span>{chip?<span className="hub-chip is-gold">{chip}</span>:null}</span>
  </span>
 </Link>;
}
export function PostRow({post,series,isRead}:Omit<Props,'isNew'>){
 const chip=seriesChip(post,series);
 return <Link className="hub-row" href={articleHref(post.slug)} prefetch={false} data-draft-changed={post.draftChanged||undefined}>
  <Cover post={post} square/>
  <span className="hub-row-main"><b>{post.title}</b><small>{articleDate(post.created_at)} · {CATEGORY_LABEL[post.category]} · {timeLabel(post)}</small></span>
  <span className="hub-row-end">{chip?<span className="hub-chip is-gold">{chip}</span>:null}{isRead?<span className="hub-chip">Read</span>:null}</span>
 </Link>;
}
