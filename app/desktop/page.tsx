import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { SignInButton } from "@/components/sign-in-button";
import { Desktop } from "@/components/desktop";
import type { AppRow } from "@/lib/apps";

export const dynamic = "force-dynamic";

export default async function DesktopPage({ searchParams }: { searchParams: Promise<{ app?: string }> }) {
  const { app } = await searchParams;
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role === "anonymous") return (
    <main className="page">
      <h1>Your desktop</h1>
      <p>Sign in with Google to open your apps.</p>
      {sb ? <SignInButton next={app ? `/desktop?app=${encodeURIComponent(app)}` : "/desktop"} /> : <p className="muted">Sign-in is not configured in this environment.</p>}
    </main>
  );
  const result = sb ? await sb.from("desktop_apps").select("*").order("sort").order("id") : null;
  if (!result || result.error) return <main className="page"><h1>Your desktop</h1><p role="alert">Can&apos;t reach the data right now.</p><a href="/desktop">Try again</a></main>;
  return <Desktop apps={(result.data ?? []) as AppRow[]} initialApp={app} />;
}
