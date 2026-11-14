"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveContentChange, discardContentChange } from "@/app/actions/content-drafts";
import type { DraftResult, ReviewDraft } from "@/lib/content-drafts/types";

export function ContentReviewList({ drafts, error }: { drafts: ReviewDraft[]; error?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, DraftResult>>({});
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  async function review(id: string, approve: boolean) {
    setPending(id);
    try {
      const result = await (approve ? approveContentChange(id) : discardContentChange(id));
      setMessages(current => ({ ...current, [id]: result }));
      if (result.ok) { setReviewed(current => new Set(current).add(id)); router.refresh(); }
    } catch { setMessages(current => ({ ...current, [id]: { ok: false, message: "Connection failed. Reload to check the draft before retrying." } })); }
    finally { setPending(null); }
  }
  return <>
    {error ? <div role="alert"><p>{error}</p><button type="button" onClick={() => router.refresh()}>Try again</button></div> : null}
    {!error && drafts.length === 0 ? <p>No drafts are waiting for review.</p> : null}
    {Object.entries(messages).filter(([, result]) => result.ok).map(([id, result]) => <p key={id} role="status" className="review-feedback">{result.message}</p>)}
    {drafts.filter(set => !reviewed.has(set.id)).map(set => <article className="catalog-card review-set" key={set.id} aria-labelledby={`review-${set.id}`}>
      <header><h2 id={`review-${set.id}`}>{set.summary}</h2><time dateTime={set.created_at}>{new Date(set.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</time></header>
      {set.validationError ? <p role="alert">{set.validationError}</p> : <div className="review-table-wrap" tabIndex={0} role="region" aria-label={`Changes: ${set.summary}`}>
        <table><thead><tr><th scope="col">Field</th><th scope="col">Current live value</th><th scope="col">Proposed value</th></tr></thead>
          <tbody>{set.fields.map(field => <tr key={field.field}><th scope="row">{field.field}</th><td><pre>{field.current || "(empty)"}</pre></td><td><pre>{field.proposed || "(empty)"}</pre></td></tr>)}</tbody>
        </table>
      </div>}
      {messages[set.id] && !messages[set.id].ok ? <p role="alert">{messages[set.id].message}</p> : null}
      <footer><button className="site-auth-button" disabled={!!pending || !!set.validationError} onClick={() => review(set.id, true)}>{pending === set.id ? "Saving…" : "Approve"}</button>
        <button disabled={!!pending} onClick={() => review(set.id, false)}>Discard</button></footer>
    </article>)}
  </>;
}
