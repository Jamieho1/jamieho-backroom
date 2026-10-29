"use client";
import { useActionState } from "react";
import { BUDGETS, CONTACT_LIMITS, type ContactResult } from "@/lib/contact";

type Action = (prev: ContactResult | null, form: FormData) => Promise<ContactResult>;

export function ContactForm({ action: send }: { action: Action }) {
  const [state, action, pending] = useActionState(send, null);
  if (state?.ok) {
    return (
      <p role="status" className="contact-done">
        {state.message}
      </p>
    );
  }
  const v = state?.values;
  return (
    <form action={action} className="contact-form">
      <div className="contact-row">
        <label className="field">
          <span>Name</span>
          <input name="name" required maxLength={CONTACT_LIMITS.name} autoComplete="name" defaultValue={v?.name} />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required maxLength={CONTACT_LIMITS.email} autoComplete="email" defaultValue={v?.email} />
        </label>
      </div>
      <label className="field">
        <span>What do you need?</span>
        <textarea name="need" rows={5} required maxLength={CONTACT_LIMITS.need} defaultValue={v?.need} />
      </label>
      <label className="field">
        <span>Budget</span>
        <select name="budget" required defaultValue={v?.budget ?? ""}>
          <option value="" disabled>
            Choose one
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      {/* Honeypot for bots: hidden from people and screen readers. */}
      <div className="hp" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="edit-bar">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Sending…" : state && !state.ok ? "Try again" : "Send"}
        </button>
        {state && !state.ok ? (
          <span role="alert" className="err">
            {state.message}
          </span>
        ) : null}
      </div>
      <p className="muted small">
        All fields are required. Your name, email and message are stored so I can reply. See the <a href="/privacy">privacy policy</a>.
      </p>
    </form>
  );
}
