"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { mediaUrl } from "@/lib/journey/media";

/**
 * Library pass in code (Jamie 2026-11-04: the generated clip was poor). Layers built offline from the three library
 * stills: a wide plate (lawn, tower, desk; props and window frame removed), the notebook + cup cut-out, and window
 * mullions drawn in CSS. The camera slides LEFT: start = S3c framing (where clip C3b lands), middle = S3b (props),
 * end = S3a (where clip C4 starts). Everything is in the stills' 1672×941 frame units, converted to %.
 *
 * Depth: plate moves 200 units, mullions 600, props 2200 over the pass, so near things sweep past far ones.
 */
const FW = 1672, FH = 941;
const pctX = (u: number) => `${(u / FW) * 100}%`;
const pctY = (u: number) => `${(u / FH) * 100}%`;
const PLATE = { w: 1872, pad: 100 };
// Measured from S3b (`lib-props.json`): top-left and size of the cut-out.
const PROPS = { x: 763, y: 753, w: 314, h: 192 };
const MULLION = { w: 46, h: 843 };

export interface LibrarySceneHandle { setProgress(p: number): void }

export const LibraryScene = forwardRef<LibrarySceneHandle, { base: string }>(function LibraryScene({ base }, ref) {
  const plate = useRef<HTMLImageElement>(null);
  const props = useRef<HTMLImageElement>(null);
  const m1 = useRef<HTMLDivElement>(null);
  const m2 = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    // xPercent is relative to each element's own width, so convert frame units to that.
    const t = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 1 } });
    t.fromTo(plate.current, { xPercent: (-100 / PLATE.w) * 100 }, { xPercent: (100 / PLATE.w) * 100 }, 0)
      .fromTo(m1.current, { xPercent: 0 }, { xPercent: (600 / MULLION.w) * 100 }, 0)
      .fromTo(m2.current, { xPercent: 0 }, { xPercent: (600 / MULLION.w) * 100 }, 0)
      .fromTo(props.current, { xPercent: (-1100 / PROPS.w) * 100 }, { xPercent: (1100 / PROPS.w) * 100 }, 0);
    tl.current = t;
    return () => { t.kill(); tl.current = null; };
  }, []);

  useImperativeHandle(ref, () => ({ setProgress: (p) => tl.current?.progress(p) }), []);

  return (
    <div className="journey-frame journey-library" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={plate} className="journey-layer" src={mediaUrl(base, "lib-plate.jpg")} alt="" draggable={false}
        style={{ left: pctX(-PLATE.pad), top: 0, width: pctX(PLATE.w), height: "100%" }} />
      <div ref={m1} className="journey-mullion" style={{ left: pctX(1390), top: 0, width: pctX(MULLION.w), height: pctY(MULLION.h) }} />
      <div ref={m2} className="journey-mullion" style={{ left: pctX(1390 - 1630), top: 0, width: pctX(MULLION.w), height: pctY(MULLION.h) }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={props} className="journey-layer journey-props" src={mediaUrl(base, "lib-props.png")} alt="" draggable={false}
        style={{ left: pctX(PROPS.x), top: pctY(PROPS.y), width: pctX(PROPS.w), height: pctY(PROPS.h) }} />
    </div>
  );
});
