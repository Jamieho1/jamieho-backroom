/**
 * PassLoop (interview practice) lives in its own repo and Vercel project. This is the one place the personal site
 * learns its address. Set NEXT_PUBLIC_PASSLOOP_URL in Vercel once PassLoop is deployed (e.g. a custom domain later).
 */
export const PASSLOOP_FALLBACK_URL = "https://pass-loop.vercel.app";

/** Accepts only an absolute http(s) origin/path; anything else falls back. Trailing slashes are dropped. */
export function resolvePassloopUrl(raw?: string): string {
  const value = raw?.trim();
  if (!value) return PASSLOOP_FALLBACK_URL;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return PASSLOOP_FALLBACK_URL;
    return url.toString().replace(/\/+$/, "");
  } catch { return PASSLOOP_FALLBACK_URL; }
}

// The literal process.env access lets Next inline the value into client bundles.
export const PASSLOOP_URL = resolvePassloopUrl(process.env.NEXT_PUBLIC_PASSLOOP_URL);
export const PASSLOOP_PRIVACY_URL = `${PASSLOOP_URL}/privacy`;
export const PASSLOOP_NAME = "PassLoop";
export const PASSLOOP_DESCRIPTION = "Interview practice for coding, SQL, system design and behavioural questions.";
