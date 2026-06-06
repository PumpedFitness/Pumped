import type { WorkoutTemplateColor } from '../../data/local/enums';

export type WorkoutTemplateColorOption = {
  value: WorkoutTemplateColor;
  label: string;
  hex: string;
};

export const WORKOUT_TEMPLATE_COLORS: WorkoutTemplateColorOption[] = [
  { value: 'TERRACOTTA', label: 'Terracotta', hex: '#C67B52' },
  { value: 'HONEY', label: 'Honey', hex: '#C2974C' },
  { value: 'SAGE', label: 'Sage', hex: '#7E9061' },
  { value: 'ROSE', label: 'Rose', hex: '#B26B62' },
  { value: 'MOSS', label: 'Moss', hex: '#46583C' },
  { value: 'SLATE', label: 'Slate', hex: '#68706A' },
];

export function getWorkoutTemplateColor(
  color: WorkoutTemplateColor,
): WorkoutTemplateColorOption {
  return (
    WORKOUT_TEMPLATE_COLORS.find(option => option.value === color) ??
    WORKOUT_TEMPLATE_COLORS[0]
  );
}
