import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { VISIBILITY_HINT, type AppRow } from "@/lib/apps";
import { AddInviteForm, RemoveInviteForm, VisibilityForm } from "./forms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings · Jamie Ho", robots: { index: false } };

/** Owner-only (TKT-53). Everyone else gets a plain 404, so the page's existence isn't advertised. */
export default async function SettingsPage() {
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role !== "owner" || !sb) notFound();

  const [{ data: apps, error: appsError }, { data: invites, error: invitesError }] = await Promise.all([
    sb.from("apps").select("*").order("sort"),
    sb.from("invites").select("email, note, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <main className="page settings">
      <h1>Settings</h1>

      <section aria-labelledby="apps-h">
        <h2 id="apps-h">Apps</h2>
        <p className="muted">Who can open each app. Changes apply straight away.</p>
        {appsError ? <p role="alert" className="alert">Can&apos;t reach the data right now.</p> : null}
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">App</th>
              <th scope="col">Who can open it</th>
            </tr>
          </thead>
          <tbody>
            {((apps ?? []) as AppRow[]).map((app) => (
              <tr key={app.id}>
                <td>
                  <strong>{app.name}</strong>
                  <div className="muted small">{VISIBILITY_HINT[app.visibility]}</div>
                </td>
                <td>
                  <VisibilityForm app={app} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="invites-h">
        <h2 id="invites-h">Invites</h2>
        <p className="muted">These Google emails can open Invite-only apps once signed in.</p>
        <AddInviteForm />
        {invitesError ? <p role="alert" className="alert">Can&apos;t reach the data right now.</p> : null}
        {invites?.length ? (
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Note</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => (
                <tr key={i.email}>
                  <td>{i.email}</td>
                  <td className="muted">{i.note}</td>
                  <td>
                    <RemoveInviteForm email={i.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No one invited yet.</p>
        )}
      </section>
    </main>
  );
}
