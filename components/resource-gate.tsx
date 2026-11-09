import Link from "next/link";
import { SignInButton } from "./sign-in-button";
import { RESOURCE_PAGES } from "@/lib/resources";
export function ResourceGate({ app, next, configured, signedIn = false }: { app?: string; next: string; configured: boolean; signedIn?: boolean }) {
  const resource = RESOURCE_PAGES.find(item => item.id === app);
  return <section className="page resource-card is-locked resource-gate">
    <header><h1>{resource?.name ?? "Resources"}</h1><p>{resource?.description ?? "Your account resources."}</p></header>
    <div className="resource-preview" aria-hidden="true"><span /><span /><span /><span /></div>
    <div className="resource-access"><strong>{signedIn ? "Membership access required" : "Sign in to unlock"}</strong>
      {!signedIn && configured ? <SignInButton next={next} className="site-auth-button" /> : null}
      {!signedIn && !configured ? <span>Sign-in is not configured in this environment.</span> : null}
      <Link href="/resources">Back to Resources</Link>
    </div>
  </section>;
}
