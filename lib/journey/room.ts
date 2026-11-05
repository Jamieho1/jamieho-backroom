/**
 * TKT-78: the clickable room. Objects are cut out of the room clip's final frame (c7a-last, 1280×720) and sit at the
 * same place over the video; hovering or focusing one makes it glow along its outline with a label, clicking opens
 * its page. Mapping agreed 2026-11-05: monitor → Projects (with the push-in clip), tablet → Articles,
 * shelf books → Practice (Notes · Practice · Behavioral), microphone → YouTube & Instagram, keyboard → Contact.
 */
export const ROOM_FRAME = { w: 1280, h: 720 };

export type RoomAction =
  | { kind: "zoom"; href: string }
  | { kind: "link"; href: string }
  | { kind: "menu"; items: { label: string; href: string }[] }
  | { kind: "socials" }
  | { kind: "contact" };

export interface RoomObject {
  id: "monitor" | "tablet" | "shelf" | "mic" | "keyboard";
  label: string;
  hint: string;
  /** Cut-out position in the 1280×720 frame (from `room-<id>.png`). */
  box: { x: number; y: number; w: number; h: number };
  action: RoomAction;
}

export const ROOM_OBJECTS: RoomObject[] = [
  { id: "monitor", label: "Projects", hint: "Open my projects", box: { x: 365, y: 125, w: 558, h: 242 }, action: { kind: "zoom", href: "/projects" } },
  { id: "tablet", label: "Articles", hint: "Read my articles", box: { x: 559, y: 416, w: 175, h: 100 }, action: { kind: "link", href: "/articles" } },
  {
    id: "shelf", label: "Practice", hint: "Notes, practice and interview stories", box: { x: 1163, y: 61, w: 72, h: 35 },
    action: { kind: "menu", items: [{ label: "Notes", href: "/notes" }, { label: "Practice", href: "/practices" }, { label: "Behavioral", href: "/behavioral" }] },
  },
  { id: "mic", label: "YouTube & Instagram", hint: "Watch what I make", box: { x: 254, y: 192, w: 66, h: 100 }, action: { kind: "socials" } },
  { id: "keyboard", label: "Contact", hint: "Write to me", box: { x: 458, y: 527, w: 327, h: 44 }, action: { kind: "contact" } },
];

/** CSS percentages of the frame for a box, with optional padding (frame px) for an easier click target. */
export function boxStyle(b: RoomObject["box"], pad = 0) {
  const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;
  return {
    left: pct(b.x - pad, ROOM_FRAME.w), top: pct(b.y - pad, ROOM_FRAME.h),
    width: pct(b.w + pad * 2, ROOM_FRAME.w), height: pct(b.h + pad * 2, ROOM_FRAME.h),
  };
}

/** The room is interactive once the camera has settled at the desk. */
export const ROOM_READY_AT = 0.86;
export function roomOpacity(local: number): number {
  const t = (local - ROOM_READY_AT) / (1 - ROOM_READY_AT) * 3;
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
}
