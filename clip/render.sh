#!/usr/bin/env bash
# Renders the two clips from the live scene code with HyperFrames (pinned; see site/README.md).
# Usage: site/clip/render.sh [out-dir]   Needs Node 22+, ffmpeg and a local Chrome or chrome-headless-shell.
set -euo pipefail
HF_VERSION=0.8.218
here="$(cd "$(dirname "$0")" && pwd)"; site="$(dirname "$here")"
out="${1:-$here/out}"; mkdir -p "$out"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
mkdir -p "$work/project" "$work/tool"
cp "$here"/index.html "$here"/feed.html "$here"/poster.html "$here"/clip.css "$work/project/"
cp -R "$site/assets" "$work/project/assets"
(cd "$work/tool" && npm init -y >/dev/null && npm install --ignore-scripts --no-audit --no-fund "hyperframes@$HF_VERSION" >/dev/null)
export DO_NOT_TRACK=1 HYPERFRAMES_NO_TELEMETRY=1 HF_CLI_TELEMETRY_DISABLED=1
hf() { "$work/tool/node_modules/.bin/hyperframes" "$@"; }
hf render "$work/project" -c feed.html --crf 18 -o "$out/a-week-at-the-desk-4x5.mp4"                       # LinkedIn feed master, 1080x1350
hf render "$work/project" -c index.html --resolution landscape --crf 18 -o "$out/a-week-at-the-desk-16x9.mp4"   # site and wide players
hf render "$work/project" -c poster.html --resolution portrait --crf 23 -o "$out/a-week-at-the-desk-phone.mp4"  # phone poster, 1080x1920
