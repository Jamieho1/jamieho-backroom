import { redirect } from 'next/navigation';
import { APP_PATHS,practiceHref } from '@/lib/desktop-pages';
import { AppPage } from './app-page';
export const dynamic='force-dynamic';
export default async function DesktopPage({searchParams}:{searchParams:Promise<{app?:string;problem?:string}>}){
 const {app,problem}=await searchParams;
 if(app&&APP_PATHS[app])redirect(app==='practice'?practiceHref(problem):APP_PATHS[app]);
 return <AppPage app={app} problem={problem} />;
}
