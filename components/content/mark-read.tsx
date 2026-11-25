"use client";
import {useEffect} from 'react';
import {markRead} from '@/lib/content-read-state';
/** Renders nothing. Remembers, in this browser only, that a post or guide was opened (shows the Read badge on Latest). */
export function MarkRead({id}:{id:string}){
 useEffect(()=>{markRead(id);},[id]);
 return null;
}
