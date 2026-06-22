import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkoutTemplateColor } from '@/data/local/enums';
import { colors } from '@/theme/tokens';
import { WORKOUT_TEMPLATE_COLORS } from '@/components/workout/workoutTemplatePresentation';
import type { ColorSwatchOption } from './ColorSwatchPicker';

/** The shared swatch options for the template + per-exercise color pickers.
 *  HONEY is light, so its check mark uses dark ink for contrast. */
export function useWorkoutColorOptions(): ColorSwatchOption<WorkoutTemplateColor>[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      WORKOUT_TEMPLATE_COLORS.map(option => ({
        value: option.value,
        label: t(option.labelKey),
        color: option.hex,
        checkColor: option.value === 'HONEY' ? colors.accentInk : colors.cream,
      })),
    [t],
  );
}
