#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLATFORM="${1:-}"
FLOW="${2:-smoke}"

case "$PLATFORM" in
  android) APP_ID="com.pumpedapp" ;;
  ios) APP_ID="org.reactjs.native.example.PumpedApp" ;;
  *)
    echo 'Usage: bun run e2e:flow -- <ios|android> [flow-name]' >&2
    exit 2
    ;;
esac

if [[ ! "$FLOW" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "Invalid flow name: $FLOW" >&2
  exit 2
fi

FLOW_PATH="$ROOT/apps/frontend/.maestro/${FLOW}.yaml"
if [ ! -f "$FLOW_PATH" ]; then
  echo "Unknown Maestro flow: $FLOW" >&2
  echo 'Available flows:' >&2
  find "$ROOT/apps/frontend/.maestro" -maxdepth 1 -name '*.yaml' \
    ! -name 'config.yaml' -exec basename {} .yaml \; | sort >&2
  exit 1
fi

command -v maestro-runner >/dev/null || {
  echo 'maestro-runner is required: https://open.devicelab.dev/install/maestro-runner' >&2
  exit 1
}

(cd "$ROOT/apps/frontend" && bun run scripts/ensure-metro.ts)
mkdir -p "$ROOT/.artifacts/maestro"

stamp="$(date '+%Y%m%d-%H%M%S')"
output="$ROOT/.artifacts/maestro/${PLATFORM}-${FLOW}-${stamp}"
maestro-runner --platform "$PLATFORM" test \
  -e APP_ID="$APP_ID" \
  --output "$output" --flatten \
  "$FLOW_PATH"

echo "$output"
