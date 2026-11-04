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
mkdir -p "$out"
ffmpeg -v error -y -i "$src" -an -vf "${vf}scale=1280:720:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 26 -g 12 -keyint_min 12 -sc_threshold 0 -movflags +faststart "$out/$id-desktop.mp4"
ffmpeg -v error -y -i "$src" -an -vf "${vf}scale=960:540:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 28 -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$out/$id-mobile.mp4"
ffmpeg -v error -y -i "$out/$id-desktop.mp4" -frames:v 1 -q:v 3 "$out/$id-first.jpg"
ffmpeg -v error -y -sseof -0.08 -i "$out/$id-desktop.mp4" -frames:v 1 -update 1 -q:v 3 "$out/$id-last.jpg"
echo "$id: $(du -h "$out/$id-desktop.mp4" | cut -f1) desktop, $(du -h "$out/$id-mobile.mp4" | cut -f1) phone"
