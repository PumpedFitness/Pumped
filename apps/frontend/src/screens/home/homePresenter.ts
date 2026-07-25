import type { TFunction } from 'i18next';
import type { NextSession } from './useHomeDashboardData';

/** Up to two uppercase initials from a display name, falling back to "PU". */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Localised "Wednesday · 24 Jul" style date label. */
export function formatDateLabel(language: string, now: Date = new Date()): string {
  const weekday = now.toLocaleDateString(language, { weekday: 'long' });
  const day = now.toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
  });
  return `${weekday} · ${day}`;
}

type Headline = { lead: string; subject: string };

/** The two-line display headline based on whether a session is queued. */
export function buildHeadline(
  t: TFunction,
  session: NextSession | null,
): Headline {
  if (session) {
    return { lead: t('home.headline.readyFor'), subject: session.name };
  }
  return { lead: t('home.headline.restLead'), subject: t('home.headline.restSubject') };
}

/** "18 sets · ~52 min · 6.4 t target" meta line for the hero card. */
export function buildSessionMeta(t: TFunction, session: NextSession): string {
  const parts: string[] = [
    t('home.hero.setsCount', { count: session.setCount }),
    t('home.hero.minutes', { count: session.estimatedMinutes }),
  ];
  if (session.targetTonnage > 0) {
    parts.push(t('home.hero.tonnageTarget', { value: session.targetTonnage.toFixed(1) }));
  }
  return parts.join(' · ');
}

/** "Bench focus · 5 lifts" style focus subtitle for the hero card label area. */
export function buildFocusLine(t: TFunction, session: NextSession): string {
  const lifts = t('home.hero.liftsCount', { count: session.exerciseCount });
  return session.focus ? `${session.focus} · ${lifts}` : lifts;
}
