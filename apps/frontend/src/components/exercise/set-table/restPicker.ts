// Shared rest-picker config and formatting. Extracted from SetSheets/SetCardHeader
// so the superset editor, which owns rest for a whole group, presents exactly
// the same wheel and the same "2:30" / "45s" text as a single set does.

import type { TFunction } from 'i18next';
import type { OptionalWheelPickerConfig } from '@pumped/ui/forms/OptionalWheelPickerSheet';

const REST_PICKER_VALUES = Array.from(
  { length: 40 },
  (_, index) => (index + 1) * 15,
);

export function formatRestDuration(t: TFunction, seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0
    ? t('currentWorkout.rest.durationMinutes', { minutes, seconds: remainder })
    : t('currentWorkout.rest.durationSeconds', { seconds });
}

/** Compact clock form for a chip or row value: `2:30`, `45s`, `–` for none. */
export function formatRestValue(value: number | null): string {
  if (value == null) {
    return '–';
  }
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`;
}

export function buildRestPickerConfig(
  t: TFunction,
  value: number | null | undefined,
  labels?: { title?: string; description?: string },
): OptionalWheelPickerConfig {
  // A value the wheel doesn't already offer (imported data, a custom rest) is
  // folded in so opening the picker can't silently round it away.
  const values =
    value == null
      ? REST_PICKER_VALUES
      : [...new Set([...REST_PICKER_VALUES, value])].sort(
          (left, right) => left - right,
        );
  return {
    title: labels?.title ?? t('currentWorkout.rest.pickerTitle'),
    description:
      labels?.description ?? t('currentWorkout.rest.pickerDescription'),
    minValue: values[0] ?? 15,
    maxValue: values.at(-1) ?? 600,
    step: 15,
    defaultValue: value ?? 90,
    values,
    formatValue: seconds => formatRestDuration(t, seconds),
  };
}
