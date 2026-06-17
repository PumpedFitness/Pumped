import type { WorkoutTemplateColor } from '@/data/local/enums';
import type { WorkoutTemplate } from '@/types/workout';

type WorkoutTemplateColorLabelKey =
  | 'templateEditor.appearance.colors.terracotta'
  | 'templateEditor.appearance.colors.honey'
  | 'templateEditor.appearance.colors.sage'
  | 'templateEditor.appearance.colors.rose'
  | 'templateEditor.appearance.colors.moss'
  | 'templateEditor.appearance.colors.slate';

type WorkoutTemplateColorOption = {
  value: WorkoutTemplateColor;
  labelKey: WorkoutTemplateColorLabelKey;
  hex: string;
};

export const WORKOUT_TEMPLATE_COLORS: WorkoutTemplateColorOption[] = [
  {
    value: 'TERRACOTTA',
    labelKey: 'templateEditor.appearance.colors.terracotta',
    hex: '#C67B52',
  },
  {
    value: 'HONEY',
    labelKey: 'templateEditor.appearance.colors.honey',
    hex: '#C2974C',
  },
  {
    value: 'SAGE',
    labelKey: 'templateEditor.appearance.colors.sage',
    hex: '#7E9061',
  },
  {
    value: 'ROSE',
    labelKey: 'templateEditor.appearance.colors.rose',
    hex: '#B26B62',
  },
  {
    value: 'MOSS',
    labelKey: 'templateEditor.appearance.colors.moss',
    hex: '#46583C',
  },
  {
    value: 'SLATE',
    labelKey: 'templateEditor.appearance.colors.slate',
    hex: '#68706A',
  },
];

export function getWorkoutTemplateColor(
  color: WorkoutTemplateColor,
): WorkoutTemplateColorOption {
  return (
    WORKOUT_TEMPLATE_COLORS.find(option => option.value === color) ??
    WORKOUT_TEMPLATE_COLORS[0]
  );
}

export function countTemplateSets(template: WorkoutTemplate): number {
  return template.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
}
