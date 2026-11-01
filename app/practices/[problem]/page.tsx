import { AppPage } from '@/app/desktop/app-page';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{problem:string}>}){const {problem}=await params;return <AppPage app="practice" problem={problem} />;}
