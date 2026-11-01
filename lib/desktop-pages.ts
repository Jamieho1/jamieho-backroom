import type { AppRow } from './apps';
const page=(id:string,name:string,url:string,icon:string):AppRow=>({id,name,url,icon,kind:'internal',visibility:'public',screenshots:[],tags:[],description:'',sort:0,locked:true});
/** Public site pages, not registry apps: no sign-in or app-open records are needed. */
export const DESKTOP_PAGES=[page('home','Home','/','home'),page('projects','Projects','/projects','projects')];
export const PRIVACY_WINDOW=page('privacy','Privacy','/privacy','notes');
export const SIGNIN_WINDOW=page('signin','Your desktop','/desktop','home');
