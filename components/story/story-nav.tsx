"use client";
import {useEffect,useRef,useState} from "react";

type Item = {id: string; n: string; title: string};

/** The scrolling ancestor (the app page's content pane), else the window. */
export function scrollRoot(el: HTMLElement | null): HTMLElement | Window {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return window;
}
export const rootBox = (root: HTMLElement | Window) => "getBoundingClientRect" in root ? {top: root.getBoundingClientRect().top, height: root.clientHeight} : {top: 0, height: innerHeight};
export const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Chapter index: a sticky rail with gold nodes on desktop (current chapter highlighted, reading progress fill, click
 * to jump) and a sticky "Chapter 0N / 0M" bar with a dropdown on phones. Plain #anchors work without JavaScript.
 */
export function StoryNav({items}: {items: Item[]}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const idx = useRef<HTMLElement>(null);
  const key = items.map(i => i.id).join("|");
  useEffect(() => {
    const root = scrollRoot(idx.current);
    let frame = 0;
    const update = () => {
      frame = 0;
      const {top, height} = rootBox(root);
      let current = 0;
      items.forEach((item, k) => {const el = document.getElementById(item.id); if (el && el.getBoundingClientRect().top - top < height * .4) current = k;});
      const cols = document.getElementById("story-cols");
      let p = 0;
      if (cols) {
        const r = cols.getBoundingClientRect();
        p = Math.max(0, Math.min(1, (top + height * .4 - r.top) / r.height));
        if (r.bottom < top + height * .6) p = 1;
      }
      idx.current?.style.setProperty("--p", p.toFixed(4));
      setActive(current);
    };
    const request = () => {if (!frame) frame = requestAnimationFrame(update);};
    update();
    root.addEventListener("scroll", request, {passive: true});
    addEventListener("resize", request);
    const esc = (e: KeyboardEvent) => {if (e.key === "Escape") setOpen(false);};
    document.addEventListener("keydown", esc);
    return () => {cancelAnimationFrame(frame); root.removeEventListener("scroll", request); removeEventListener("resize", request); document.removeEventListener("keydown", esc);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setOpen(false);
    target.scrollIntoView({behavior: reducedMotion() ? "auto" : "smooth", block: "start"});
    history.replaceState(null, "", `#${id}`);
  };
  const cur = items[Math.min(active, items.length - 1)];
  return <aside ref={idx} className={`sty-idx${open ? " open" : ""}`} aria-label="Chapter index">
    <button className="sty-mbar" type="button" aria-expanded={open} aria-controls="story-rail" onClick={() => setOpen(o => !o)}>
      <span>Chapter <b>{cur.n}</b> / {items[items.length - 1].n}</span><span className="t">{cur.title}</span><span className="car" aria-hidden="true">▾</span>
    </button>
    <ol className="sty-rail" id="story-rail">
      <li className="fill" aria-hidden="true"><i/></li>
      {items.map((item, i) => <li key={item.id} className={i === active ? "on" : i < active ? "done" : undefined}>
        <a href={`#${item.id}`} aria-current={i === active ? "location" : undefined} onClick={e => jump(e, item.id)}><b>{item.n}</b>{item.title}</a>
      </li>)}
    </ol>
  </aside>;
}
