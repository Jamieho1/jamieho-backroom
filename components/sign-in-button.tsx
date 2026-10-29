"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function SignInButton({ next: nextPath, label = "Sign in with Google", className = "btn" }: { next?: string; label?: string; className?: string } = {}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const next = nextPath ?? window.location.pathname + window.location.search;
        await supabaseBrowser(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
      }}
    >
      {busy ? "Opening Google…" : label}
    </button>
  );
}
