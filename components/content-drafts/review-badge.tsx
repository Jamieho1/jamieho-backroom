"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getContentDraftCount } from "@/app/actions/content-draft-count";
import { useViewer } from "@/components/viewer-provider";

export function ContentReviewBadge() {
  const { viewer } = useViewer();
  const ownerId = viewer.status === "owner" ? viewer.id : undefined;
  const pathname = usePathname();
  const [state, setState] = useState<{ ownerId: string; count: number } | null>(null);
  useEffect(() => {
    if (!ownerId) return;
    let active = true, generation = 0;
    async function refresh() {
      const request = ++generation;
      try {
        const count = await getContentDraftCount();
        if (active && request === generation) setState(count === null ? null : { ownerId: ownerId!, count });
      } catch { if (active && request === generation) setState(null); }
    }
    const visible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh();
    window.addEventListener("focus", visible);
    window.addEventListener("content-drafts-changed", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false; ++generation;
      window.removeEventListener("focus", visible);
      window.removeEventListener("content-drafts-changed", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [ownerId, pathname]);
  if (!ownerId || state?.ownerId !== ownerId || state.count <= 0) return null;
  return <Link className="site-review-badge" href="/manage/review" prefetch={false}>{state.count} to review</Link>;
}
