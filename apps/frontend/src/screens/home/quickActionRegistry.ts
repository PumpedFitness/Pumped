import type { IconName } from '@pumped/ui';

/**
 * The quick-action catalog. Entries are metadata only — the press handler is
 * wired per key in HomeScreen, which is where navigation and the current
 * workout live. Keeping the registry free of behaviour is what lets the user's
 * selection be a plain array of keys in MMKV.
 */
export const QUICK_ACTION_KEYS = [
  'startWorkout',
  'logLift',
  'timer',
  'weighIn',
  'trends',
  'schedule',
  'library',
  'history',
  'newExercise',
] as const;

export type QuickActionKey = (typeof QUICK_ACTION_KEYS)[number];

export const quickActionRegistry: Record<QuickActionKey, { icon: IconName }> = {
  startWorkout: { icon: 'play' },
  logLift: { icon: 'dumbbell' },
  timer: { icon: 'clock' },
  weighIn: { icon: 'scale' },
  trends: { icon: 'trend' },
  schedule: { icon: 'calendar' },
  library: { icon: 'archive' },
  history: { icon: 'history' },
  newExercise: { icon: 'plus' },
};

export const DEFAULT_QUICK_ACTIONS: QuickActionKey[] = [
  'startWorkout',
  'timer',
  'weighIn',
  'trends',
];

export function isQuickActionKey(value: string): value is QuickActionKey {
  return value in quickActionRegistry;
}
