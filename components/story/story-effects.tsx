"use client";
import {useEffect} from "react";
import {reducedMotion,rootBox,scrollRoot} from "./story-nav";

/** Chapter fade/slide-in, headline fit and photo parallax. Absent entirely under reduced motion (everything stays visible). */
export function StoryEffects() {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>(".story-editorial");
    if (!scope) return;
    const h1 = scope.querySelector<HTMLElement>(".sty-hero h1");
    const fit = () => {
      if (!h1) return;
      h1.style.fontSize = "100px";
      const box = h1.parentElement!, cw = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) * 2;
      let widest = 0;
      h1.querySelectorAll("span.sty-line").forEach(sp => {widest = Math.max(widest, sp.getBoundingClientRect().width);});
      if (widest > 0 && cw > 0) h1.style.fontSize = Math.min(168, 100 * cw / widest * .99).toFixed(1) + "px";
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
    const root = scrollRoot(scope), imgs = [...scope.querySelectorAll<HTMLElement>(".sty-ph img")];
    let frame = 0;
    const parallax = () => {
      frame = 0;
      const {top, height} = rootBox(root);
      imgs.forEach(im => {
        const b = im.parentElement!.getBoundingClientRect();
        if (b.bottom < top - 100 || b.top > top + height + 100) return;
        const off = b.top + b.height / 2 - (top + height / 2);
        im.style.setProperty("--py", Math.max(-26, Math.min(26, -off * .05)).toFixed(1) + "px");
      });
    };
    const request = () => {if (!frame) frame = requestAnimationFrame(parallax);};
    parallax();
    root.addEventListener("scroll", request, {passive: true});
    addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame); io?.disconnect(); scope.classList.remove("sty-js");
      root.removeEventListener("scroll", request); removeEventListener("resize", request); removeEventListener("resize", fit);
    };
  }, []);
  return null;
}
