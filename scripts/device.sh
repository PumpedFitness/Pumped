#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACTS="$ROOT/.artifacts"
ANDROID_APP_ID="com.pumpedapp"
IOS_APP_ID="org.reactjs.native.example.PumpedApp"
COMMAND="${1:-help}"
PLATFORM="${2:-}"

if [ "$#" -ge 2 ]; then shift 2; else shift "$#"; fi

DEVICE_ID="${DEVICE_ID:-}"
CONFIRMED=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --device)
      DEVICE_ID="${2:?--device requires an id}"
      shift 2
      ;;
    --yes)
      CONFIRMED=true
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

usage() {
  cat <<'EOF'
Usage: bun run device:<command> -- <ios|android> [--device ID] [--yes]

Commands:
  device:doctor                 Check local mobile-development dependencies
  device:status -- PLATFORM     Show Metro, device, and app-install status
  device:boot -- PLATFORM       Boot the first available simulator/emulator
  device:launch -- PLATFORM     Launch the installed app without rebuilding
  device:reload -- PLATFORM     Stop and relaunch the installed app
  device:screenshot -- PLATFORM
  device:logs -- PLATFORM       Stream logs until interrupted
  device:reset -- PLATFORM --yes
  dev:ready -- PLATFORM         Boot if needed and report readiness

Use --device when more than one device is active. DEVICE_ID is also supported.
EOF
}

need() {
  if command -v "$1" >/dev/null 2>&1; then
    printf '✓ %-18s %s\n' "$1" "$(command -v "$1")"
  else
    printf '✗ %-18s missing\n' "$1"
    return 1
  fi
}

metro_status() {
  local port="${RCT_METRO_PORT:-${METRO_PORT:-8081}}"
  if curl -fsS --max-time 2 "http://127.0.0.1:${port}/status" 2>/dev/null \
    | grep -q 'packager-status:running'; then
    echo "running on :${port}"
  else
    echo "not running on :${port}"
  fi
}

android_devices() {
  adb devices | awk 'NR > 1 && $2 == "device" {print $1}'
}

ios_booted_devices() {
  xcrun simctl list devices booted | awk -F '[()]' '/iPhone/ {print $2}'
}

select_device() {
  local devices count
  if [ -n "$DEVICE_ID" ]; then return; fi

  if [ "$PLATFORM" = "android" ]; then
    devices="$(android_devices)"
  else
    devices="$(ios_booted_devices)"
  fi
  count="$(printf '%s\n' "$devices" | awk 'NF {count++} END {print count+0}')"

  if [ "$count" -eq 0 ]; then
    echo "No booted ${PLATFORM} device. Run: bun run device:boot -- ${PLATFORM}" >&2
    return 1
  fi
  if [ "$count" -gt 1 ]; then
    echo "Multiple ${PLATFORM} devices are active; choose one with --device:" >&2
    printf '%s\n' "$devices" >&2
    return 1
  fi
  DEVICE_ID="$(printf '%s\n' "$devices" | awk 'NF {print; exit}')"
}

validate_platform() {
  case "$PLATFORM" in
    android) command -v adb >/dev/null || { echo 'adb is required' >&2; exit 1; } ;;
    ios) command -v xcrun >/dev/null || { echo 'xcrun is required' >&2; exit 1; } ;;
    *) usage; exit 2 ;;
  esac
}

app_installed() {
  if [ "$PLATFORM" = "android" ]; then
    adb -s "$DEVICE_ID" shell pm path "$ANDROID_APP_ID" >/dev/null 2>&1
  else
    xcrun simctl get_app_container "$DEVICE_ID" "$IOS_APP_ID" app >/dev/null 2>&1
  fi
}

boot_android() {
  if [ -n "$(android_devices)" ]; then
    echo 'Android device already booted.'
    return
  fi
  command -v emulator >/dev/null || { echo 'Android emulator CLI is required' >&2; exit 1; }
  local avd
  avd="$(emulator -list-avds | awk 'NF {print; exit}')"
  [ -n "$avd" ] || { echo 'No Android Virtual Device is configured' >&2; exit 1; }
  echo "Booting Android AVD: $avd"
  mkdir -p "$ARTIFACTS/logs"
  nohup emulator -avd "$avd" >"$ARTIFACTS/logs/android-emulator.log" 2>&1 &
  adb wait-for-device
  until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 2
  done
  echo 'Android emulator is ready.'
}

boot_ios() {
  if [ -n "$(ios_booted_devices)" ]; then
    echo 'iOS simulator already booted.'
    return
  fi
  local udid
  udid="$(xcrun simctl list devices available | awk -F '[()]' '/iPhone/ {print $2; exit}')"
  [ -n "$udid" ] || { echo 'No available iPhone simulator was found' >&2; exit 1; }
  echo "Booting iOS simulator: $udid"
  xcrun simctl boot "$udid"
  xcrun simctl bootstatus "$udid" -b
}

doctor() {
  local failed=0
  echo 'Core'
  need bun || failed=1
  need git || failed=1
  need curl || failed=1
  need maestro-runner || failed=1
  echo
  echo 'Android'
  need adb || failed=1
  need emulator || failed=1
  echo
  echo 'iOS (macOS only)'
  if [ "$(uname -s)" = "Darwin" ]; then
    need xcrun || failed=1
  else
    echo '• skipped on non-macOS host'
  fi
  echo
  echo "Metro: $(metro_status)"
  return "$failed"
}

status() {
  validate_platform
  echo "Platform: $PLATFORM"
  echo "Metro:   $(metro_status)"
  if ! select_device; then
    echo 'Device:  unavailable'
    echo 'App:     unavailable'
    return 1
  fi
  echo "Device:  $DEVICE_ID"
  if app_installed; then echo 'App:     installed'; else echo 'App:     not installed'; fi
}

launch() {
  validate_platform
  select_device || exit 1
  app_installed || { echo "Pumped is not installed; run bun run frontend:${PLATFORM}" >&2; exit 1; }
  if [ "$PLATFORM" = "android" ]; then
    adb -s "$DEVICE_ID" shell monkey -p "$ANDROID_APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null
  else
    xcrun simctl launch "$DEVICE_ID" "$IOS_APP_ID"
  fi
  echo "Launched Pumped on $DEVICE_ID"
}

stop_app() {
  if [ "$PLATFORM" = "android" ]; then
    adb -s "$DEVICE_ID" shell am force-stop "$ANDROID_APP_ID"
  else
    xcrun simctl terminate "$DEVICE_ID" "$IOS_APP_ID" >/dev/null 2>&1 || true
  fi
}

screenshot() {
  validate_platform
  select_device || exit 1
  local stamp path
  stamp="$(date '+%Y%m%d-%H%M%S')"
  mkdir -p "$ARTIFACTS/screenshots"
  path="$ARTIFACTS/screenshots/${PLATFORM}-${stamp}.png"
  if [ "$PLATFORM" = "android" ]; then
    adb -s "$DEVICE_ID" exec-out screencap -p >"$path"
  else
    xcrun simctl io "$DEVICE_ID" screenshot "$path" >/dev/null
  fi
  echo "$path"
}

logs() {
  validate_platform
  select_device || exit 1
  mkdir -p "$ARTIFACTS/logs"
  echo "Streaming Pumped logs from $DEVICE_ID (Ctrl+C to stop)"
  if [ "$PLATFORM" = "android" ]; then
    local pid
    pid="$(adb -s "$DEVICE_ID" shell pidof "$ANDROID_APP_ID" | tr -d '\r')"
    [ -n "$pid" ] || { echo 'Pumped is not running' >&2; exit 1; }
    adb -s "$DEVICE_ID" logcat --pid="$pid"
  else
    xcrun simctl spawn "$DEVICE_ID" log stream --level info \
      --predicate 'process == "PumpedApp"'
  fi
}

reset_app() {
  validate_platform
  select_device || exit 1
  if [ "$CONFIRMED" != true ]; then
    echo "This clears all Pumped data on $DEVICE_ID." >&2
    echo "Re-run with: bun run device:reset -- $PLATFORM --device $DEVICE_ID --yes" >&2
    exit 2
  fi
  if [ "$PLATFORM" = "android" ]; then
    adb -s "$DEVICE_ID" shell pm clear "$ANDROID_APP_ID"
  else
    xcrun simctl uninstall "$DEVICE_ID" "$IOS_APP_ID"
    echo 'iOS app uninstalled because simctl cannot clear one app’s data in place.'
  fi
  echo "Cleared Pumped data on $DEVICE_ID"
}

ready() {
  validate_platform
  if [ "$PLATFORM" = "android" ]; then boot_android; else boot_ios; fi
  select_device || exit 1
  echo "Device: $DEVICE_ID"
  echo "Metro:  $(metro_status)"
  if app_installed; then
    echo 'App:    installed'
  else
    echo "App:    not installed (run bun run frontend:${PLATFORM})"
    return 1
  fi
}

case "$COMMAND" in
  help|-h|--help) usage ;;
  doctor) doctor ;;
  status) status ;;
  boot) validate_platform; if [ "$PLATFORM" = android ]; then boot_android; else boot_ios; fi ;;
  launch) launch ;;
  reload) validate_platform; select_device || exit 1; stop_app; launch ;;
  screenshot) screenshot ;;
  logs) logs ;;
  reset) reset_app ;;
  ready) ready ;;
  *) echo "Unknown command: $COMMAND" >&2; usage; exit 2 ;;
esac
