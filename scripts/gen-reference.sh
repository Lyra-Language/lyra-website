#!/bin/sh
# Regenerate the standard library's reference pages (src/content/docs/reference/) from the
# `///` comments in ../lyra/std, with `lyrac doc --strict`: a public declaration without a
# doc comment fails the run rather than reaching the site undescribed.
#
# MODULES is what the site publishes, one entry file per module — for a directory module,
# any of its files (compiling one brings its siblings). The console and game modules
# (std.chips.*, std.game.*, std.genesis.*) are left out until their docs are complete.
#
# Run: ./scripts/gen-reference.sh       (rebuild the compiler first: cd ../lyra && ./build.sh)
set -eu

site="$(cd "$(dirname "$0")/.." && pwd)"
lyra="$site/../lyra"
out="$site/src/content/docs/reference"
lyrac="${LYRAC:-$lyra/build/lyrac}"

if [ ! -x "$lyrac" ]; then
  echo "gen-reference: no lyrac at $lyrac — build it with \`cd ../lyra && ./build.sh\`, or set LYRAC" >&2
  exit 2
fi

MODULES="
std/prelude/prelude.lyra
std/base64.lyra
std/collections/hashmap.lyra
std/compress.lyra
std/env.lyra
std/ffi.lyra
std/io.lyra
std/json.lyra
std/math/math.lyra
std/path.lyra
std/png.lyra
std/rar.lyra
std/sevenzip.lyra
std/temporal/plain_date.lyra
std/tui/screen.lyra
std/xml.lyra
std/zip.lyra
"

cd "$lyra"
for entry in $MODULES; do
  "$lyrac" doc "$entry" -o "$out" --strict
done
