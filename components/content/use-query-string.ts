"use client";
import {useCallback,useSyncExternalStore} from 'react';
const EVENT='jb:querychange';
function subscribe(cb:()=>void){window.addEventListener('popstate',cb);window.addEventListener(EVENT,cb);return()=>{window.removeEventListener('popstate',cb);window.removeEventListener(EVENT,cb);};}
/**
 * The page's query string ("?topic=ai"), read in the browser so the page itself stays pre-rendered and cookie-free.
 * The server snapshot is empty, so hydration matches the static HTML; the real value arrives right after.
 */
export function useQueryString():[string,(next:string)=>void]{
 const search=useSyncExternalStore(subscribe,()=>window.location.search,()=>'');
 const set=useCallback((query:string)=>{window.history.replaceState(null,'',window.location.pathname+query+window.location.hash);window.dispatchEvent(new Event(EVENT));},[]);
 return [search,set];
}
