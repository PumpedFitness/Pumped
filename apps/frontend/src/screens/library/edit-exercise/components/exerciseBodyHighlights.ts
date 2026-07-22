import {
  MUSCLE_GROUP_BODY_PARTS,
  type BodyPartHighlight,
  type MuscleGroupBodyPartKey,
} from '@/components/body';
import { colors } from '@/theme/tokens';

const MUSCLE_GROUP_NAME_KEYS = {
  Abs: 'abs',
  Back: 'back',
  Biceps: 'biceps',
  Calves: 'calves',
  Chest: 'chest',
  Forearms: 'forearms',
  Glutes: 'glutes',
  Hamstrings: 'hamstrings',
  Quads: 'quads',
  Shoulders: 'shoulders',
  Traps: 'traps',
  Triceps: 'triceps',
} as const satisfies Record<string, MuscleGroupBodyPartKey>;

export const EXERCISE_BODY_PALETTE = [
  'rgba(198, 123, 82, 0.48)',
  colors.accent,
  colors.accentHoney,
  colors.cream,
] as const;

function getMuscleGroupKey(name: string): MuscleGroupBodyPartKey | undefined {
  const key = name as keyof typeof MUSCLE_GROUP_NAME_KEYS;
  return Object.prototype.hasOwnProperty.call(MUSCLE_GROUP_NAME_KEYS, key)
    ? MUSCLE_GROUP_NAME_KEYS[key]
    : undefined;
}

export function buildBodyHighlights(
  muscleGroups: string[],
): BodyPartHighlight[] {
  const parts = new Set<BodyPartHighlight['part']>();

  muscleGroups.forEach(group => {
    const key = getMuscleGroupKey(group);
    if (!key) return;
    MUSCLE_GROUP_BODY_PARTS[key].forEach(part => parts.add(part));
  });

  return [...parts].map(part => ({ part, intensity: 3 }));
}
