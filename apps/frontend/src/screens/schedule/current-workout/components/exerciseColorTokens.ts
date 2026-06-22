import type { WorkoutTemplateColor } from '@/data/local/enums';
import { colors } from '@/theme/tokens';
import { getWorkoutTemplateColor } from '@/components/workout/workoutTemplatePresentation';

export type ExerciseColorTokens = {
  /** The accent hex — badge, icon tile, and active border. */
  fg: string;
  /** Tinted surface for the tray header band. */
  soft: string;
  /** Icon color on the solid tile (dark on the light HONEY swatch). */
  onTile: string;
};

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Header-band tokens for an exercise's resolved color. Keyed off the UPPERCASE
 *  WorkoutTemplateColor and sourced from the shared template-color palette. */
export function exerciseColorTokens(
  color: WorkoutTemplateColor,
): ExerciseColorTokens {
  const hex = getWorkoutTemplateColor(color).hex;
  return {
    fg: hex,
    soft: withAlpha(hex, 0.14),
    onTile: color === 'HONEY' ? colors.accentInk : colors.cream,
  };
}
