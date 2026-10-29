"use client";
import { useActionState } from "react";
import { addInvite, removeInvite, setVisibility, type ActionResult } from "./actions";
import { VISIBILITIES, VISIBILITY_HINT, VISIBILITY_LABEL, type AppRow } from "@/lib/apps";

function Status({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <span role="status" className={state.ok ? "ok" : "err"}>
      {state.message}
    </span>
  );
}

export function VisibilityForm({ app }: { app: AppRow }) {
  const [state, action, pending] = useActionState(setVisibility, null);
  return (
    <form action={action} className="row-form">
      <input type="hidden" name="id" value={app.id} />
      <label className="sr-only" htmlFor={`vis-${app.id}`}>
        Visibility of {app.name}
      </label>
      <select id={`vis-${app.id}`} name="visibility" defaultValue={app.visibility} disabled={app.locked || pending} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        {VISIBILITIES.filter((v) => app.locked || v !== "owner_only").map((v) => (
          <option key={v} value={v} title={VISIBILITY_HINT[v]}>
            {VISIBILITY_LABEL[v]}
          </option>
        ))}
      </select>
      {app.locked ? <span className="muted">fixed</span> : <Status state={state} />}
    </form>
  );
}

export function AddInviteForm() {
  const [state, action, pending] = useActionState(addInvite, null);
  return (
    <form action={action} className="row-form">
      <label className="sr-only" htmlFor="invite-email">
        Email to invite
      </label>
      <input id="invite-email" name="email" type="email" required placeholder="name@example.com" />
      <label className="sr-only" htmlFor="invite-note">
        Note (optional)
      </label>
      <input id="invite-note" name="note" placeholder="Note, e.g. recruiter at Acme (optional)" />
      <button type="submit" className="btn" disabled={pending}>
        Invite
      </button>
      <Status state={state} />
    </form>
  );
}

export function RemoveInviteForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(removeInvite, null);
  return (
    <form action={action} className="row-form">
      <input type="hidden" name="email" value={email} />
      <button type="submit" className="btn ghost" disabled={pending} aria-label={`Remove ${email}`}>
        Remove
      </button>
      <Status state={state} />
    </form>
  );
}
