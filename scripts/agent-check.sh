#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

bun run check:precommit
git diff --check
git diff --cached --check

case "${1:-}" in
  "")
    echo "Finish checks passed (format, lint, typecheck, unit tests, diff check)."
    echo "Run 'bun run check:finish -- ios|android' to include Maestro."
    ;;
  ios)
    bun run check:e2e:ios
    ;;
  android)
    bun run check:e2e:android
    ;;
  *)
    echo "Usage: bun run check:finish [ios|android]" >&2
    exit 2
    ;;
esac
