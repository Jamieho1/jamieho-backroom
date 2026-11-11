"use client";
import Link from "next/link";
import { useDesktopApps } from "./desktop-apps-provider";
import { useViewer } from "./viewer-provider";
import { SignInButton } from "./sign-in-button";
import { ICONS } from "./desktop-icons";

import { RESOURCE_PAGES } from "@/lib/resources";
export function ResourceCatalog() {
  const { viewer, configured, editing, setEditing } = useViewer();
  const { apps, loading, loadError } = useDesktopApps();
  const signedIn = viewer.status === "member" || viewer.status === "owner";
  return <>
    {loadError ? <p role="alert">Access couldn’t be checked. <a href="/resources">Try again</a></p> : null}
    {viewer.status === "owner" ? <div className="resource-owner"><Link href="/settings">Settings</Link><Link href="/guides/manage" prefetch={false}>Manage guides</Link><button type="button" className="btn ghost" aria-pressed={editing} onClick={() => setEditing(!editing)}>{editing ? "Done editing" : "Edit site"}</button></div> : null}
    <ul className="resource-grid">{RESOURCE_PAGES.map(resource => {
      const allowed = signedIn && apps.some(app => app.id === resource.id);
      return <li className={`resource-card${allowed ? "" : " is-locked"}`} key={resource.id}>
        <header><span className="resource-icon" aria-hidden="true">{ICONS[resource.icon]}</span><h2>{resource.name}</h2><p>{resource.description}</p></header>
        <div className="resource-preview" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="resource-access">{allowed ? <Link className="site-auth-button" href={resource.href} prefetch={false}>Open {resource.name}</Link> : viewer.status === "loading" || loading ? <span role="status">Checking access…</span> : <>
          <strong>{signedIn ? "Membership access required" : "Sign in to unlock"}</strong>
          {!signedIn && configured ? <SignInButton label="Sign in" next={resource.href} className="site-auth-button" /> : null}
          {!signedIn && !configured ? <span>Sign-in is not configured in this environment.</span> : null}
        </>}</div>
      </li>;
    })}</ul>
  </>;
}
