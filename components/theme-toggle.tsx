"use client";
import { useEffect, useState } from "react";

type Theme = "auto" | "light" | "dark";
export const THEME_KEY = "jb.theme";
/** Apply saved overrides before paint; Auto leaves CSS/system colour preferences in control. */
export const THEME_BOOT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;else delete document.documentElement.dataset.theme}catch(e){}`;

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : document.documentElement.dataset.theme === "light" ? "light" : "auto");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  const next: Theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
  const labels = { auto: "Auto", light: "Day", dark: "Night" };
  return <button type="button" className="theme-control" data-theme-mode={theme}
    aria-label={`Colour mode: ${labels[theme]}. Switch to ${labels[next]}`}
    title={`${labels[theme]} · Switch to ${labels[next]}`} onClick={() => {
      if (next === "auto") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch { /* Storage can be unavailable. */ }
      setTheme(next);
    }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {theme === "auto" ? <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></> : theme === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" /></> : <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />}
    </svg>
  </button>;
}
