"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { GRID, gridSegments, lerpInto, shapePoints, type LineState, type Shape } from "@/lib/journey/lines";

/**
 * TKT-95: a slow-turning wireframe behind the section titles that morphs between shapes as sections hand over.
 * Desktop only: never created on phones, with reduced motion (the still version has no canvas at all) or without
 * WebGL. three.js is fetched only when it is needed. The journey's draw loop calls frame() each tick; nothing is
 * drawn while no section with a shape is on screen, and the canvas moves into the active section so it sits under
 * that section's text.
 */
export interface LineShapeHandle { frame(layer: HTMLElement | null, s: LineState, tone: "light" | "dark", dt: number): void }

const TONE = { light: { color: 0x15110c, alpha: 0.16 }, dark: { color: 0xf2e6d2, alpha: 0.14 } } as const;
const WIDE = "(min-width: 900px)";

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

export const LineShape = forwardRef<LineShapeHandle>(function LineShape(_props, ref) {
  const draw = useRef<LineShapeHandle["frame"] | null>(null);
  useImperativeHandle(ref, () => ({ frame: (...a) => draw.current?.(...a) }), []);

  useEffect(() => {
    if (!matchMedia(WIDE).matches || matchMedia("(prefers-reduced-motion: reduce)").matches || !hasWebGL()) return;
    // Made here rather than rendered by React: the draw loop moves it between section layers.
    const c = document.createElement("canvas");
    c.className = "journey-lines";
    c.setAttribute("aria-hidden", "true");
    c.style.opacity = "0";
    let alive = true;
    let dispose = () => {};
    // Fetched once the page is idle, well before the visitor scrolls to the first section.
    const idle = (fn: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 600));
    new Promise<void>((r) => idle(r)).then(() => (alive ? import("three") : Promise.reject())).then((T) => {
      if (!alive) return;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ canvas: c, alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { return; } // WebGL refused at the last moment: no wireframe, no error
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 0, 5.2);
      const shapes = Object.fromEntries((["sphere", "torus", "wave", "helix"] as Shape[]).map((s) => [s, shapePoints(s)])) as Record<Shape, Float32Array>;
      const pos = new Float32Array(GRID.u * GRID.v * 3);
      const geo = new T.BufferGeometry();
      const attr = new T.BufferAttribute(pos, 3).setUsage(T.DynamicDrawUsage);
      geo.setAttribute("position", attr);
      geo.setIndex(new T.BufferAttribute(gridSegments(), 1));
      const mat = new T.LineBasicMaterial({ transparent: true, depthWrite: false });
      const lines = new T.LineSegments(geo, mat);
      lines.rotation.x = 0.42;
      scene.add(lines);

      const size = () => {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Sit behind the titles (left of centre), a little smaller on narrower screens.
        lines.position.x = -camera.aspect * 0.62;
        lines.scale.setScalar(Math.min(1.1, 0.6 + camera.aspect * 0.26));
        camera.updateProjectionMatrix();
      };
      size();
      window.addEventListener("resize", size);

      // Warm up now (shader compile + first upload, the one slow step) so the first section doesn't stutter.
      lerpInto(pos, shapes.sphere, shapes.sphere, 1);
      attr.needsUpdate = true;
      mat.opacity = 0;
      renderer.render(scene, camera);

      let key = "";
      draw.current = (layer, s, tone, dt) => {
        if (!s.shape || s.opacity <= 0.001 || !layer) { if (c.style.opacity !== "0") c.style.opacity = "0"; return; }
        if (c.parentElement !== layer) layer.prepend(c);
        c.style.opacity = "1";
        const k = `${s.from}>${s.shape}@${s.morph.toFixed(3)}`;
        if (k !== key) { key = k; lerpInto(pos, shapes[s.from ?? s.shape], shapes[s.shape], s.morph); attr.needsUpdate = true; }
        const t = TONE[tone];
        mat.color.setHex(t.color);
        mat.opacity = t.alpha * s.opacity;
        lines.rotation.y += Math.min(0.064, dt / 1000) * 0.12;
        renderer.render(scene, camera);
      };
      dispose = () => { window.removeEventListener("resize", size); geo.dispose(); mat.dispose(); renderer.dispose(); draw.current = null; };
    }).catch(() => {});
    return () => { alive = false; dispose(); c.remove(); };
  }, []);

  return null;
});
