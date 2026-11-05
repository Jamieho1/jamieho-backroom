#!/usr/bin/env bash
# Encode one raw clip for the Home journey (TKT-75). Run locally; outputs go to public/home-media/ (gitignored),
# then upload the files to the Supabase Storage bucket `home-media`.
#   scripts/home-media/encode.sh "<raw clip.mp4>" <id> [crop-filter]
# Example (2:1 source cropped to 16:9): scripts/home-media/encode.sh "Cloud scene 1.mp4" c1 "crop=1365:768,"
# Settings (scroll-craft "dense GOP": seeking walks from the previous keyframe):
#   desktop 1280x720 H.264 CRF 26, keyframe every 12 frames; phone 960x540 CRF 28, every 8; no audio; faststart.
#   Posters: first and last frame of the encoded desktop clip.
set -euo pipefail
src="$1"; id="$2"; vf="${3:-}"; out="$(dirname "$0")/../../public/home-media"
# One warm "golden hour" grade for every clip (polish pass, 2026-11-05), so the illustrated art, stills and AI video
# read as one film. Vignette and grain are drawn in CSS, not baked in. Set GRADE=none to skip.
GRADE_DEFAULT="eq=contrast=1.08:brightness=-0.02:saturation=1.06,colorbalance=rs=-0.04:gs=-0.01:bs=0.05:rm=0.03:bm=-0.02:rh=0.08:gh=0.03:bh=-0.07,curves=all='0/0 0.25/0.21 0.75/0.80 1/0.97',"
grade="${GRADE:-$GRADE_DEFAULT}"; [ "$grade" = "none" ] && grade=""
vf="${vf}${grade}"
mkdir -p "$out"
ffmpeg -v error -y -i "$src" -an -vf "${vf}scale=1280:720:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 26 -g 12 -keyint_min 12 -sc_threshold 0 -movflags +faststart "$out/$id-desktop.mp4"
ffmpeg -v error -y -i "$src" -an -vf "${vf}scale=960:540:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 28 -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$out/$id-mobile.mp4"
ffmpeg -v error -y -i "$out/$id-desktop.mp4" -frames:v 1 -q:v 3 "$out/$id-first.jpg"
ffmpeg -v error -y -sseof -0.08 -i "$out/$id-desktop.mp4" -frames:v 1 -update 1 -q:v 3 "$out/$id-last.jpg"
echo "(next: node scripts/home-media/manifest.mjs, upload, commit the manifest)"
echo "$id: $(du -h "$out/$id-desktop.mp4" | cut -f1) desktop, $(du -h "$out/$id-mobile.mp4" | cut -f1) phone"
