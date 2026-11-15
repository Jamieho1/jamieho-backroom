import {SignInButton} from '@/components/sign-in-button';

/** Notes require an account, not a paid membership. Never include note content here. */
export function NotesSignIn({next,configured}:{next:string;configured:boolean}){
 return <section className="page iv-question-page" aria-label="Notes sign-in">
  <h1>Sign in to read Notes</h1>
  <p>Notes are free for everyone with an account. Sign in with Google to continue.</p>
  {configured?<SignInButton next={next}/>:<p>Sign-in is not configured in this environment.</p>}
 </section>;
}
