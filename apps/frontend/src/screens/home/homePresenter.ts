import type { TFunction } from 'i18next';
import type { HomeWidgetData } from '@/hooks/useHomeWidgetData';

/** Up to two uppercase initials from a display name, falling back to "PU". */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Localised "Wednesday · 24 Jul" style date label. */
export function formatDateLabel(
  language: string,
  now: Date = new Date(),
): string {
  const weekday = now.toLocaleDateString(language, { weekday: 'long' });
  const day = now.toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
  });
  return `${weekday} · ${day}`;
}

/**
 * Plan name for the header's second line — or an honest "no active plan". The
 * week count deliberately lives on the session widget instead of here: two
 * readings of the same week, a few pixels apart, only invite comparison.
 */
export function buildPlanStatus(t: TFunction, data: HomeWidgetData): string {
  return data.scheduleName ?? t('home.planStatus.none');
}
