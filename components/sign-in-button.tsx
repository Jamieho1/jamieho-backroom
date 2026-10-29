"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function SignInButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const next = window.location.pathname + window.location.search;
        await supabaseBrowser(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
      }}
    >
      {busy ? "Opening Google…" : "Sign in with Google"}
    </button>
  );
}
