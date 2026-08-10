import type { TFunction } from 'i18next';
import type { HomeWidgetData, NextSession } from '@/hooks/useHomeWidgetData';

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

type Headline = { lead: string; subject: string };

/** The two-line display headline based on whether a session is queued. */
export function buildHeadline(
  t: TFunction,
  session: NextSession | null,
): Headline {
  if (session) {
    return { lead: t('home.headline.readyFor'), subject: session.name };
  }
  return {
    lead: t('home.headline.restLead'),
    subject: t('home.headline.restSubject'),
  };
}

/**
 * Plan name for the identity row — or an honest "no active plan". The week
 * count deliberately lives on the hero progress row instead of here: appended
 * to the plan name it pushed the line past the avatar + Edit pill and
 * truncated both facts into unreadability.
 */
export function buildPlanStatus(t: TFunction, data: HomeWidgetData): string {
  return data.scheduleName ?? t('home.planStatus.none');
}

/** "2 / 3" done-of-total for the hero progress row. */
export function buildWeekCount(
  t: TFunction,
  progress: HomeWidgetData['weekProgress'],
): string | null {
  if (!progress) return null;
  return t('home.hero.weekCount', {
    done: progress.done,
    total: progress.total,
  });
}

/** "6 lifts · 18 sets · ~52 min · 6.4 t target" meta line for the hero card. */
export function buildSessionMeta(t: TFunction, session: NextSession): string {
  const parts: string[] = [
    t('home.hero.liftsCount', { count: session.exerciseCount }),
    t('home.hero.setsCount', { count: session.setCount }),
    t('home.hero.minutes', { count: session.estimatedMinutes }),
  ];
  if (session.targetTonnage > 0) {
    parts.push(
      t('home.hero.tonnageTarget', {
        value: session.targetTonnage.toFixed(1),
      }),
    );
  }
  return parts.join(' · ');
}

/**
 * The session's focus description ("Squat, hinge, leg press and calves"), which
 * heads the hero card now that the session name lives only in the display
 * headline. Template descriptions are free text and often end in a full stop,
 * which read as a stray dot next to the card's other lines.
 */
export function buildFocusLine(session: NextSession): string | null {
  const focus = session.focus?.trim().replace(/[.·]+$/, '').trim();
  return focus ? focus : null;
}
