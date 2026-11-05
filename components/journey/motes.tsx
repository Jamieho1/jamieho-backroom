"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Floating light motes (dust in sunbeams). Independent of scroll, so the scene still breathes when the visitor
 * stops. Cheap: ~50 soft dots on one canvas at device-pixel size, paused when the tab is hidden.
 */
export interface MotesHandle { setIntensity(n: number): void }

export const Motes = forwardRef<MotesHandle>(function Motes(_props, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const intensity = useRef(0);
  const shown = useRef(0);
  useImperativeHandle(ref, () => ({ setIntensity: (n) => { intensity.current = n; } }), []);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    window.addEventListener("resize", size);
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const dots = Array.from({ length: 52 }, () => ({ x: Math.random(), y: Math.random(), r: rand(0.6, 2.2), s: rand(0.004, 0.012), p: Math.random() * Math.PI * 2, a: rand(0.25, 0.75) }));
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(64, now - last) / 1000; last = now;
      shown.current += (intensity.current - shown.current) * Math.min(1, dt * 2);
      ctx.clearRect(0, 0, w, h);
      if (shown.current > 0.01) {
        for (const d of dots) {
          d.p += dt * 0.6; d.y -= d.s * dt; d.x += Math.sin(d.p) * 0.0006;
          if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
          const x = d.x * w, y = d.y * h, r = d.r * (h / 800 + 0.5);
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
          const a = d.a * shown.current * (0.6 + 0.4 * Math.sin(d.p * 1.7));
          g.addColorStop(0, `rgba(255, 238, 200, ${a})`); g.addColorStop(1, "rgba(255, 238, 200, 0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const vis = () => { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(frame); } };
    document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", vis); };
  }, []);

  return <canvas ref={canvas} className="journey-motes" aria-hidden="true" />;
});
