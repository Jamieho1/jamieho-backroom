import {Desktop} from '@/components/desktop';
import {AuthErrorNotice} from '@/components/auth-error-notice';
export const revalidate=86400;
/** Public, pre-rendered arrival. About Me opens only through its clean route. */
export default function Home(){return <Desktop apps={[]} discoverApps notice={<AuthErrorNotice/>}/>}
