"use client";
import { useState } from "react";
import { approvePreviewChange, discardPreviewChange, exitContentPreview } from "@/app/actions/content-preview";

export function ContentPreviewBar({ summary }: { summary: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function run(action: "approve" | "discard" | "exit") {
    setPending(true); setError("");
    try {
      const result = await (action === "approve" ? approvePreviewChange() : action === "discard" ? discardPreviewChange() : exitContentPreview());
      if (result.ok) { window.location.assign(action === "exit" ? "/manage/review" : "/"); return; }
      setError(result.message);
    } catch { setError("Could not finish. Reload to check this draft before retrying."); }
    setPending(false);
  }
  return <aside className="content-preview-bar" aria-label="Content preview" data-lenis-prevent>
    <p>Previewing: <strong>{summary}</strong></p>
    <div className="content-preview-actions">
      <button className="site-auth-button" disabled={pending} onClick={() => run("approve")}>Approve</button>
      <button disabled={pending} onClick={() => run("discard")}>Discard</button>
      <button disabled={pending} onClick={() => run("exit")}>Back to list</button>
    </div>
    {pending ? <span role="status">Saving…</span> : null}
    {error ? <p role="alert">{error}</p> : null}
  </aside>;
}
