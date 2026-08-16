import type { TFunction } from 'i18next';
import type { NextSession } from '@/hooks/useHomeWidgetData';
import type { TodayWorkout } from '@/hooks/useTodayWorkout';
import { SCORE_MAX, type ScoreResult } from '@/lib/health/algorithms/estimator';

/** What the primary button does — the component maps these onto navigation. */
export type TodayActionKind =
  | 'resume'
  | 'start'
  | 'startAnyway'
  | 'view'
  | 'browse'
  | 'free';

export type TodayBadge = 'skipped' | 'done' | null;

export type TodayCardModel = {
  eyebrow: string;
  title: string;
  /** Lift/set/time line, or the reason there is none. */
  meta: string | null;
  badge: TodayBadge;
  actionKind: TodayActionKind;
  actionLabel: string;
  /** Hidden without an active schedule — seven empty blocks say nothing. */
  showWeek: boolean;
};

/** "6 lifts · 18 sets · ~52 min · 6.4 t target" for the session line. */
export function buildSessionMeta(t: TFunction, session: NextSession): string {
  const parts: string[] = [
    t('widgets.today.liftsCount', { count: session.exerciseCount }),
    t('widgets.today.setsCount', { count: session.setCount }),
    t('widgets.today.minutes', { count: session.estimatedMinutes }),
  ];
  if (session.targetTonnage > 0) {
    parts.push(
      t('widgets.today.tonnageTarget', {
        value: session.targetTonnage.toFixed(1),
      }),
    );
  }
  return parts.join(' · ');
}

type ResolvedAction = Pick<TodayCardModel, 'actionKind' | 'actionLabel'>;

/**
 * The button, with a running session overriding whatever today would ask for.
 *
 * Offering "Start" while a workout is open would either discard it or bounce
 * the user into a conflict dialog, and neither is what the button appears to
 * promise. Each kind is also its own label key, so the two cannot drift.
 */
function resolveAction(
  t: TFunction,
  kind: TodayActionKind,
  hasCurrentWorkout: boolean,
): ResolvedAction {
  const actionKind = hasCurrentWorkout ? 'resume' : kind;
  return { actionKind, actionLabel: t(`widgets.today.${actionKind}`) };
}

/** The card's copy and its one primary action, derived from today's state. */
export function buildTodayCard(
  t: TFunction,
  today: TodayWorkout,
  session: NextSession | null,
  hasCurrentWorkout: boolean,
): TodayCardModel {
  const action = (kind: TodayActionKind) =>
    resolveAction(t, kind, hasCurrentWorkout);

  if (today.kind === 'no-schedule') {
    return {
      eyebrow: t('widgets.today.eyebrowPlain'),
      title: t('widgets.today.noPlanTitle'),
      meta: t('widgets.today.noPlanBody'),
      badge: null,
      ...action('browse'),
      showWeek: false,
    };
  }

  if (today.kind === 'rest') {
    return {
      eyebrow: t('widgets.today.eyebrowPlain'),
      title: t('widgets.today.restTitle'),
      meta: t('widgets.today.restBody'),
      badge: null,
      ...action('free'),
      showWeek: true,
    };
  }

  if (today.kind === 'done') {
    return {
      eyebrow: t('widgets.today.eyebrow'),
      title: today.workout.name,
      meta: t('widgets.today.doneBody'),
      badge: 'done',
      ...action('view'),
      showWeek: true,
    };
  }

  // pending | skipped — both have a template queued for today.
  const skipped = today.kind === 'skipped';
  return {
    eyebrow: t('widgets.today.eyebrow'),
    title: session?.name || today.workoutName,
    meta: session ? buildSessionMeta(t, session) : null,
    badge: skipped ? 'skipped' : null,
    ...action(skipped ? 'startAnyway' : 'start'),
    showWeek: true,
  };
}

export type RecoveryReadout = {
  score: number;
  /** 0–100 for the ring, independent of SCORE_MAX. */
  percent: number;
  headline: string;
  label: string;
};

/**
 * The readiness score as one sentence.
 *
 * The message is keyed off the score's own label rather than a second set of
 * thresholds — one place decides what "primed" means, and the wording follows
 * it. `null` whenever there is no score to speak for: an invented number in
 * the hero card is worse than a card without one.
 */
export function buildRecoveryReadout(
  t: TFunction,
  result: ScoreResult,
  hasData: boolean,
): RecoveryReadout | null {
  if (!hasData || result.score === null || result.label === null) {
    return null;
  }
  return {
    score: result.score,
    percent: (result.score / SCORE_MAX) * 100,
    headline: t(`widgets.today.recovery.${result.label}`),
    label: t(`health.label.${result.label}`),
  };
}
