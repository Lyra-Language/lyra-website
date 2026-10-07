#!/bin/sh
# Put tree-sitter-lyra beside this repo, where astro.config.mjs reads it for highlighting.
#
# A host builds from this repo alone, so the sibling the workspace provides is missing
# there. A checkout that already has one (the workspace) is left alone, so a local build
# keeps highlighting with the grammar on disk, pushed or not.
set -eu

grammar="$(dirname "$0")/../../tree-sitter-lyra"

if [ -f "$grammar/grammar.js" ]; then
  echo "fetch-grammar: using the existing $grammar"
  exit 0
fi

git clone --depth 1 https://github.com/Lyra-Language/tree-sitter-lyra.git "$grammar"
