"use client";
import {useEffect} from "react";
import {reducedMotion} from "./story-nav";

/** Chapter fade/slide-in and headline fit (shrink-only, capped by the shared hero size). Photos never move or crop. Absent entirely under reduced motion (everything stays visible). */
export function StoryEffects() {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>(".story-editorial");
    if (!scope) return;
    const h1 = scope.querySelector<HTMLElement>(".sty-hero h1");
    const fit = () => {
      if (!h1) return;
      // The hero size comes from the shared page scale (CSS); JS only shrinks a line that would overflow.
      h1.style.removeProperty("font-size");
      const cap = parseFloat(getComputedStyle(h1).fontSize) || 56;
      h1.style.fontSize = "100px";
      const box = h1.parentElement!, cw = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) * 2;
      let widest = 0;
      h1.querySelectorAll("span.sty-line").forEach(sp => {widest = Math.max(widest, sp.getBoundingClientRect().width);});
      if (widest > 0 && cw > 0) h1.style.fontSize = Math.min(cap, 100 * cw / widest * .99).toFixed(1) + "px";
      else h1.style.removeProperty("font-size");
    };
    fit();
    addEventListener("resize", fit);
    document.fonts?.ready.then(fit).catch(() => {});
    if (reducedMotion()) return () => removeEventListener("resize", fit);
    scope.classList.add("sty-js");
    const revealed = [...scope.querySelectorAll<HTMLElement>(".sty-rv")];
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(es => es.forEach(e => {if (e.isIntersecting) {e.target.classList.add("in"); io!.unobserve(e.target);}}), {threshold: .2, rootMargin: "0px 0px -6% 0px"});
      revealed.forEach(el => io!.observe(el));
    } else revealed.forEach(el => el.classList.add("in"));
    return () => {
      io?.disconnect(); scope.classList.remove("sty-js");
      removeEventListener("resize", fit);
    };
  }, []);
  return null;
}
