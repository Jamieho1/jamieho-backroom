import type { PreloadItem } from "@/lib/journey/media";

/**
 * TKT-76: fetch each clip whole, one at a time, in the order given, and hand back a blob URL. A fully downloaded
 * clip seeks instantly in every direction (no range requests mid-scrub). Byte progress streams out for the start
 * ring. A failed clip is skipped and its chapter simply keeps showing its still. `front(src)` reorders what is
 * still waiting, e.g. the desk clip after "Skip to desk".
 */
export interface Preloader { front(src: string): void; dispose(): void }

export function startPreloader(
  queue: PreloadItem[],
  url: (item: PreloadItem) => string,
  on: { progress(src: string, bytes: number): void; ready(src: string, blobUrl: string): void },
): Preloader {
  const waiting = [...queue];
  const urls: string[] = [];
  const abort = new AbortController();
  let stopped = false;

  const fetchOne = async (item: PreloadItem) => {
    const res = await fetch(url(item), { mode: "cors", signal: abort.signal });
    if (!res.ok || !res.body) throw new Error(`${item.file}: ${res.status}`);
    const reader = res.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value as Uint8Array<ArrayBuffer>);
      got += value.byteLength;
      on.progress(item.src, got);
    }
    const blobUrl = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
    urls.push(blobUrl);
    on.ready(item.src, blobUrl);
  };

  void (async () => {
    while (!stopped && waiting.length) {
      const item = waiting.shift()!;
      try { await fetchOne(item); } catch { if (stopped) return; /* chapter stays on its still */ }
    }
  })();

  return {
    front(src) {
      const i = waiting.findIndex((w) => w.src === src);
      if (i > 0) waiting.unshift(...waiting.splice(i, 1));
    },
    dispose() {
      stopped = true;
      abort.abort();
      urls.forEach((u) => URL.revokeObjectURL(u));
    },
  };
}

/** Saving data or a 2G-class connection: don't pull ~25 MB of video; the stills carry the story. */
export function shouldSkipVideo(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}

/** Keep fetched media across visits (public/media-sw.js only touches versioned home-media URLs). */
export function registerMediaCache() {
  if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
  navigator.serviceWorker.register("/media-sw.js", { scope: "/" }).catch(() => {});
}
