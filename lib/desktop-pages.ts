import type { AppRow } from './apps';
const page=(id:string,name:string,url:string,icon:string):AppRow=>({id,name,url,icon,kind:'internal',visibility:'public',screenshots:[],tags:[],description:'',sort:0,locked:true});
/** Public desktop pages. Articles also has a public registry row for RLS and signed-in launch logging. */
export const DESKTOP_PAGES=[page('home','About Me','/','home'),page('projects','Projects','/projects','projects'),page('articles','Articles','/articles','articles')];
export const PRIVACY_WINDOW=page('privacy','Privacy','/privacy','notes');
export const SIGNIN_WINDOW=page('signin','Your desktop','/desktop','home');

export const APP_PATHS:Record<string,string>={home:'/',projects:'/projects',privacy:'/privacy',notes:'/notes',practice:'/practices',behavioral:'/behavioral',settings:'/settings',articles:'/articles'};
export const practiceHref=(problem?:number|string)=>problem?`/practices/${encodeURIComponent(String(problem))}`:'/practices';
export function appHref(app:Pick<AppRow,'id'|'kind'|'url'>){return app.kind==='internal'?(APP_PATHS[app.id]??`/desktop?app=${encodeURIComponent(app.id)}`):app.url;}
