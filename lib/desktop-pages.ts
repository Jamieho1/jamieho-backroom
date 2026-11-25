import type { AppRow } from './apps';
const page=(id:string,name:string,url:string,icon:string):AppRow=>({id,name,url,icon,kind:'internal',visibility:'public',screenshots:[],tags:[],description:'',sort:0,locked:true});
/** Public desktop pages. Articles also has a public registry row for RLS and signed-in launch logging. */
export const DESKTOP_PAGES=[page('home','Journey','/#pivot','home'),page('projects','Projects','/projects','projects'),page('articles','Articles','/content','articles')];
export const PRIVACY_WINDOW=page('privacy','Privacy','/privacy','privacy');
export const SIGNIN_WINDOW=page('signin','Resources','/resources','home');

export const APP_PATHS:Record<string,string>={home:'/#pivot',projects:'/projects',privacy:'/privacy',settings:'/settings',articles:'/content'};
export function appHref(app:Pick<AppRow,'id'|'kind'|'url'>){return app.kind==='internal'?(APP_PATHS[app.id]??'/content/guides'):app.url;}
