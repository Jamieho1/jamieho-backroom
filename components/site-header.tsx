import { getViewer } from "@/lib/viewer";
import { readSupabaseEnv } from "@/lib/env";
import { SignInButton } from "./sign-in-button";

export async function SiteHeader() {
  const env = readSupabaseEnv();
  const viewer = await getViewer();
  return (
    <header className="site-header">
      <a href="/" className="brand">Jamie Ho</a>
      <span className="spacer" />
      {viewer.role === "anonymous" ? (
        env ? <SignInButton url={env.url} anonKey={env.anonKey} /> : null
      ) : (
        <div className="who" aria-label="Signed in">
          <span>{viewer.name}</span>
          {viewer.role === "owner" ? (
            <>
              <span className="badge">Owner</span>
              <a href="/settings">Settings</a>
            </>
          ) : null}
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn ghost">Sign out</button>
          </form>
        </div>
      )}
    </header>
  );
}
