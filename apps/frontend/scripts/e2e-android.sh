#!/usr/bin/env bash
#
# Android e2e: install the built APK and run the Maestro flows. This runs INSIDE
# reactivecircus/android-emulator-runner — the emulator is already booted and
# only lives for the duration of this script.
#
# It is a committed file rather than an inline `script:` block on purpose: the
# runner executes inline scripts line-by-line in *separate* shells, so shell
# variables (e.g. $APK) and `set -e` don't carry across lines. A single-file
# script invoked in one line runs in one shell with normal bash semantics.
#
# Args: $1 = APP_ID (package name), $2 = maestro-runner version ("latest" ok).
# GITHUB_WORKSPACE is provided by GitHub Actions; cwd is the repo root.
set -euo pipefail

APP_ID="${1:?APP_ID (arg 1) is required}"
MAESTRO_VERSION="${2:-latest}"

shopt -s nullglob
apks=("${GITHUB_WORKSPACE:-.}"/android-apk/*.apk)
if [ ${#apks[@]} -eq 0 ]; then
  echo "::error::No APK found in ./android-apk/ — did build-android upload the artifact?"
  ls -la "${GITHUB_WORKSPACE:-.}/android-apk" 2>/dev/null || true
  exit 1
fi
APK="${apks[0]}"
echo "Installing $APK"
adb install -r "$APK"

# Install maestro-runner only if the cache didn't restore it.
if [ ! -x "$HOME/.maestro-runner/bin/maestro-runner" ]; then
  if [ "$MAESTRO_VERSION" = "latest" ]; then
    curl -fsSL https://open.devicelab.dev/install/maestro-runner | bash
  else
    curl -fsSL https://open.devicelab.dev/install/maestro-runner | bash -s -- --version "$MAESTRO_VERSION"
  fi
fi
export PATH="$HOME/.maestro-runner/bin:$PATH"

maestro-runner --platform android test \
  -e APP_ID="$APP_ID" \
  --output e2e-report-android --flatten \
  apps/frontend/.maestro
