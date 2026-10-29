"use client";
import { useViewer } from "./viewer-provider";
import { SignInButton } from "./sign-in-button";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const { viewer, configured, editing, setEditing } = useViewer();
  return (
    <header className="site-header">
      <a href="/" className="brand">Jamie Ho</a>
      <nav aria-label="Site" className="site-nav">
        <a href="/projects">Projects</a>
      </nav>
      <span className="spacer" />
      {viewer.status === "owner" ? (
        <button type="button" className={`btn ghost${editing ? " on" : ""}`} aria-pressed={editing} onClick={() => setEditing(!editing)}>
          {editing ? "Done editing" : "Edit site"}
        </button>
      ) : null}
      <ThemeToggle />
      {viewer.status === "loading" ? <span className="who-slot" aria-hidden="true" /> : null}
      {viewer.status === "anonymous" && configured ? <SignInButton /> : null}
      {viewer.status === "member" || viewer.status === "owner" ? (
        <div className="who" aria-label="Signed in">
          <span>{viewer.name}</span>
          {viewer.status === "owner" ? (
            <>
              <span className="badge">Owner</span>
              <a href="/settings">Settings</a>
            </>
          ) : null}
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn ghost">Sign out</button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
