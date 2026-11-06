/** Approved public wallpaper layers; generated with prepare-desktop-art.mjs. */
export const DESKTOP_ASSETS={
  "day": "/desktop-art/day-e402d0814d88.webp",
  "night": "/desktop-art/night-4041a2e93fb1.webp",
  "clouds": "/desktop-art/clouds-77f5d270b155.webp",
  "sunDay": "/desktop-art/sunDay-00001a5e6623.webp",
  "emptyNight": "/desktop-art/emptyNight-c94bf294fda1.webp",
  "cutout": "/desktop-art/cutout-b47f7343b1ed.webp",
  "cutoutNight": "/desktop-art/cutoutNight-58dde35bd825.webp",
  "riverDay": "/desktop-art/riverDay-5d1b14570f9b.webp",
  "riverNight": "/desktop-art/riverNight-af1de0df51b6.webp",
  "eyeDay": "/desktop-art/eyeDay-70db3fb1f7d3.webp",
  "eyeNight": "/desktop-art/eyeNight-cbd3487049fe.webp",
  "eyeMatte": "/desktop-art/eyeMatte-7f9bd22ed9f6.webp",
  "dayWide": "/desktop-art/dayWide-6a3597cb6b21.webp",
  "nightWide": "/desktop-art/nightWide-c3fdf0a627b4.webp",
  "dayPortrait": "/desktop-art/dayPortrait-58d1effa814a.webp",
  "nightPortrait": "/desktop-art/nightPortrait-9aed77b783cf.webp"
} as const;

/**
 * Wide (2.4:1) versions of the day/night art, outpainted by Jamie (2026-11-05) to replace the blurred side strips.
 * Measured by feature matching: the original 1672×941 art sits inside the 1942×809 wide image from x = 252.1 with
 * width 1437.8 (same scale both themes, no rotation). So, relative to the art frame's width:
 */
export const DESKTOP_WIDE_FIT = { left: 252.1 / 1437.8, width: 1942 / 1437.8 } as const;

/**
 * 9:16 portrait versions of the day/night art, made by Jamie (2026-11-06) for phones. They fill the screen's width,
 * sit on the bottom edge, and on taller screens the sky continues above them in its own top colour.
 * Below this width-to-height ratio the backdrop uses them instead of the landscape frame.
 */
export const DESKTOP_PORTRAIT = { below: 0.75, dayTop: "#2d65b0", nightTop: "#102336" } as const;
