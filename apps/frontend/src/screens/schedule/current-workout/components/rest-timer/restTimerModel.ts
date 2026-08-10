// Pure time math for the rest timer. All durations are in milliseconds and the
// remaining time is derived from a target timestamp (never tick-counted), so it
// stays accurate across re-renders and app backgrounding.

/** Hard ceiling so repeated +15 taps can't overflow the ring. */
export const REST_MAX_MS = 60 * 60 * 1000;

/** The −15s / +15s adjustment step. */
export const REST_STEP_SECONDS = 15;

export function clampRestMs(ms: number): number {
  if (!Number.isFinite(ms)) {
    return 0;
  }
  return Math.max(0, Math.min(REST_MAX_MS, Math.round(ms)));
}

/** Remaining time as M:SS, rounded up so the last second reads "0:01" not "0:00". */
export function formatRestClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** 0–100 ring fill: the share of the target duration still remaining. */
export function restRingPercentage(
  remainingMs: number,
  totalMs: number,
): number {
  if (totalMs <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
}
