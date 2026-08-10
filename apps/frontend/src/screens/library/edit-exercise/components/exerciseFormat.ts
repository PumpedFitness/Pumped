import type { WeightUnit } from '@/data/local/schema/userProfile';
import { displayWeight } from '@/utils/units';

/** "Jul 21" — compact month + day. */
export function formatShortDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
  });
}

/** "Tue, Jul 21, 2026" — full weekday + date. */
export function formatFullDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Weight in the user's unit, one decimal, no unit suffix: "87.5". */
export function formatWeightValue(kg: number, unit: WeightUnit): string {
  const value = Math.round(displayWeight(kg, unit) * 10) / 10;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Volume in the user's unit, rounded, thousands-separated: "1,633". */
export function formatVolumeValue(kg: number, unit: WeightUnit): string {
  return Math.round(displayWeight(kg, unit)).toLocaleString();
}
