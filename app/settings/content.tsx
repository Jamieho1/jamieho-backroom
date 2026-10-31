import { notFound } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { VISIBILITY_HINT, type AppRow } from "@/lib/apps";
import { FREE_LIMITS, formatMB, opsWarnings, usageOf, type OpsRow } from "@/lib/ops";
import { buildVisitors, type OpenRow, type ProfileRow, type SigninRow } from "@/lib/visitors";
import { AddInviteForm, DeleteMessageForm, MessageReadForm, RemoveInviteForm, VisibilityForm } from "./forms";

interface Message {
  id: string;
  name: string;
  email: string;
  need: string;
  budget: string;
  read: boolean;
  created_at: string;
}
const WHEN = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });

/** Owner-only (TKT-53). Everyone else gets a plain 404, so the page's existence isn't advertised. */
export async function SettingsContent() {
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role !== "owner" || !sb) notFound();

  const [
    { data: apps, error: appsError },
    { data: invites, error: invitesError },
    { data: messages, error: messagesError },
    { data: profiles, error: profilesError },
    { data: signins, error: signinsError },
    { data: opens, error: opensError },
    { data: ops },
  ] = await Promise.all([
    sb.from("apps").select("*").order("sort"),
    sb.from("invites").select("email, note, created_at").order("created_at", { ascending: false }),
    sb.from("messages").select("id, name, email, need, budget, read, created_at").order("created_at", { ascending: false }).limit(200),
    sb.from("profiles").select("id, email, full_name, role, created_at"),
    sb.from("signins").select("user_id, at").order("at", { ascending: false }).limit(5000),
    sb.from("app_opens").select("user_id, app_id").limit(5000),
    sb.from("ops_status").select("job, ran_at, ok, detail"),
  ]);
  const opsRows = (ops ?? []) as OpsRow[];
  const warnings = opsWarnings(opsRows);
  const usage = usageOf(opsRows.find((r) => r.job === "ping"));
  const appNames = Object.fromEntries(((apps ?? []) as AppRow[]).map((a) => [a.id, a.name]));
  const visitors = buildVisitors((profiles ?? []) as ProfileRow[], (signins ?? []) as SigninRow[], (opens ?? []) as OpenRow[], appNames);
  const visitorsError = profilesError || signinsError || opensError;
  const inbox = (messages ?? []) as Message[];
  const unread = inbox.filter((m) => !m.read).length;

  return (
    <div className="page settings">
      <h1>Settings</h1>
      {warnings.length ? (
        <div role="alert" className="ops-banner">
          <strong>Needs a look</strong>
          <ul>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section aria-labelledby="inbox-h" id="inbox">
        <h2 id="inbox-h">
          Inbox {unread ? <span className="badge">{unread} new</span> : null}
        </h2>
        <p className="muted">Messages from the contact form. Reply from your own email.</p>
        {messagesError ? <p role="alert" className="alert">Can&apos;t reach the data right now.</p> : null}
        {inbox.length ? (
          <ul className="inbox">
            {inbox.map((m) => (
              <li key={m.id} className={m.read ? "msg" : "msg unread"}>
                <div className="msg-head">
                  <strong>{m.name}</strong>
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}>{m.email}</a>
                  {m.budget ? <span className="badge">{m.budget}</span> : null}
                  <time className="muted small" dateTime={m.created_at}>
                    {WHEN.format(new Date(m.created_at))}
                  </time>
                </div>
                <p className="msg-body">{m.need}</p>
                <div className="msg-actions">
                  <MessageReadForm id={m.id} read={m.read} />
                  <DeleteMessageForm id={m.id} from={m.name} />
                </div>
              </li>
            ))}
          </ul>
        ) : messagesError ? null : (
          <p className="muted">No messages yet.</p>
        )}
      </section>

      <section aria-labelledby="visitors-h" id="visitors">
        <h2 id="visitors-h">Visitors</h2>
        <p className="muted">
          People who signed in with Google (you&apos;re left out). Page views are in Vercel → Analytics.
        </p>
        {visitorsError ? <p role="alert" className="alert">Can&apos;t reach the data right now.</p> : null}
        {visitors.length ? (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Who</th>
                  <th scope="col">First visit</th>
                  <th scope="col">Last visit</th>
                  <th scope="col">Sign-ins</th>
                  <th scope="col">Apps opened</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.name}</strong>
                      <div className="muted small">
                        <a href={`mailto:${v.email}`}>{v.email}</a>
                      </div>
                    </td>
                    <td>{WHEN.format(new Date(v.firstVisit))}</td>
                    <td>{WHEN.format(new Date(v.lastVisit))}</td>
                    <td>{v.signins}</td>
                    <td>{v.apps.length ? v.apps.join(", ") : <span className="muted">None yet</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : visitorsError ? null : (
          <p className="muted">No one else has signed in yet.</p>
        )}
      </section>

      <section aria-labelledby="ops-h" id="ops">
        <h2 id="ops-h">Ops</h2>
        <p className="muted">Run by the Ops workflow in GitHub → Actions. Exports download from that run&apos;s page (encrypted).</p>
        <table className="tbl">
          <tbody>
            {(["ping", "export"] as const).map((job) => {
              const r = opsRows.find((x) => x.job === job);
              return (
                <tr key={job}>
                  <th scope="row">{job === "ping" ? "Daily keep-alive ping" : "Weekly export"}</th>
                  <td>{r ? `${r.ok ? "OK" : "Failed"} · ${WHEN.format(new Date(r.ran_at))}` : <span className="muted">Not run yet</span>}</td>
                </tr>
              );
            })}
            {usage ? (
              <tr>
                <th scope="row">Database size</th>
                <td>
                  {formatMB(usage.db_bytes)} of {formatMB(FREE_LIMITS.db_bytes)} · emails today {usage.messages_today}/{FREE_LIMITS.emails_day}, this month{" "}
                  {usage.messages_month}/{FREE_LIMITS.emails_month}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

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
    </div>
  );
}
