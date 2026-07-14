#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/images"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
CURL=(curl -fsSL -A "$UA" --retry 3 --retry-delay 2)

mkdir -p "$OUT"

download() {
  local url="$1"
  local file="$2"
  echo "→ $file"
  "${CURL[@]}" "$url" -o "$OUT/$file"
}

pexels() {
  local id="$1"
  local file="$2"
  local w="${3:-1200}"
  download "https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}" "$file"
}

pexels_avatar() {
  local id="$1"
  local file="$2"
  download "https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop" "$file"
}

make_slideshow() {
  local output="$1"
  shift
  local inputs=("$@")
  local n=${#inputs[@]}
  local filter=""
  local maps=""

  for i in "${!inputs[@]}"; do
    filter+="[${i}:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,"
    filter+="zoompan=z='min(zoom+0.0015,1.25)':d=100:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=25,"
    filter+="format=yuv420p[v${i}];"
  done

  local prev="v0"
  for ((i = 1; i < n; i++)); do
    local offset
    offset=$(awk "BEGIN {print ($i * 4) - 0.8}")
    local next="v${i}"
    if ((i < n - 1)); then
      next="x${i}"
    fi
    filter+="[${prev}][v${i}]xfade=transition=fade:duration=0.8:offset=${offset}[${next}];"
    prev="$next"
  done

  local cmd=(ffmpeg -y -loglevel error)
  for img in "${inputs[@]}"; do
    cmd+=(-loop 1 -t 4 -i "$OUT/$img")
  done
  cmd+=(-filter_complex "${filter%?}" -map "[${prev}]" -c:v libx264 -t $((n * 4 - (n - 1))) -pix_fmt yuv420p -movflags +faststart "$OUT/$output")
  "${cmd[@]}"
}

add_silent_audio() {
  local file="$1"
  local tmp="$OUT/${file%.mp4}-tmp.mp4"
  ffmpeg -y -loglevel error -i "$OUT/$file" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -c:v copy -c:a aac -shortest -movflags +faststart "$tmp"
  mv "$tmp" "$OUT/$file"
}

echo "Downloading event images…"
pexels 1105666 concert.jpg
pexels 1763075 concert-wide.jpg 1600
pexels 937784 jazz.jpg
pexels 2531546 workshop.jpg
pexels 61127 festival.jpg
pexels 2070033 warehouse.jpg
pexels 2147491 skyline.jpg
pexels 274099 crowd.jpg
pexels 1763075 memory-1.jpg
pexels 1105666 memory-2.jpg

echo "Downloading food & drink images…"
pexels 1279330 cocktail.jpg 800
pexels 1581384 beer.jpg 800
pexels 1640777 fries.jpg 800
pexels 1267320 food.jpg 800
pexels 2747449 drink.jpg 800

echo "Downloading banners…"
pexels 1763075 banner-concert.jpg 1600
pexels 937784 banner-jazz.jpg 1600
pexels 1105666 banner-profile.jpg 1600

echo "Downloading avatars…"
pexels_avatar 774909 avatar-reza.jpg
pexels_avatar 220453 avatar-alex.jpg
pexels_avatar 1681010 avatar-sarah.jpg
pexels_avatar 1181690 avatar-emma.jpg
pexels_avatar 91227 avatar-jordan.jpg
pexels_avatar 1043471 avatar-marcus.jpg
pexels_avatar 1222271 avatar-neon.jpg
pexels_avatar 1130626 avatar-mia.jpg
pexels_avatar 1181519 avatar-chris.jpg
pexels_avatar 1239291 avatar-skyline.jpg

echo "Generating event promo videos from footage…"
if command -v ffmpeg >/dev/null 2>&1; then
  make_slideshow event-concert.mp4 crowd.jpg concert.jpg memory-1.jpg
  make_slideshow event-dj.mp4 warehouse.jpg concert-wide.jpg crowd.jpg
  make_slideshow event-festival.mp4 festival.jpg crowd.jpg memory-2.jpg
  make_slideshow event-jazz.mp4 jazz.jpg skyline.jpg cocktail.jpg

  # Shorter clips for auth / story composer
  ffmpeg -y -loglevel error -loop 1 -i "$OUT/crowd.jpg" \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='min(zoom+0.0018,1.25)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=25" \
    -c:v libx264 -t 6 -pix_fmt yuv420p -movflags +faststart "$OUT/auth-concert.mp4"

  ffmpeg -y -loglevel error -loop 1 -i "$OUT/warehouse.jpg" \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='min(zoom+0.002,1.3)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=25" \
    -c:v libx264 -t 5 -pix_fmt yuv420p -movflags +faststart "$OUT/auth-dj.mp4"

  for video in event-concert event-dj event-festival event-jazz auth-concert auth-dj; do
    add_silent_audio "${video}.mp4"
    echo "→ ${video}.mp4"
  done
else
  echo "⚠ ffmpeg not found — skipped video generation"
fi

echo "✓ $(ls -1 "$OUT" | wc -l | tr -d ' ') media files in public/images/"
