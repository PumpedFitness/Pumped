import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WorkoutTemplate } from '@/types/workout';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  countTemplateSets,
  getWorkoutTemplateColor,
} from '@/components/workout/workoutTemplatePresentation';

type WorkoutTemplateCardProps = {
  template: WorkoutTemplate;
  exerciseNames: Map<string, string>;
  onEdit: (template: WorkoutTemplate) => void;
};

export function WorkoutTemplateCard({
  template,
  exerciseNames,
  onEdit,
}: WorkoutTemplateCardProps) {
  const { t } = useTranslation();
  const preview = template.exercises
    .slice(0, 3)
    .map(
      exercise =>
        exerciseNames.get(exercise.exerciseId) ??
        t('plan.card.fallbackExercise'),
    )
    .join(' · ');
  const remainingExercises = Math.max(template.exercises.length - 3, 0);
  const setCount = countTemplateSets(template);
  const templateColor = getWorkoutTemplateColor(template.color).hex;
  const morePreviewLabel: string = t('plan.card.morePreview', {
    count: remainingExercises,
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('plan.card.editA11y', { name: template.name })}
      className="overflow-hidden rounded-[24px] border border-border-hairline bg-surface-card p-5 active:bg-surface-sunk"
      onPress={() => onEdit(template)}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-[14px]"
          style={{ backgroundColor: `${templateColor}22` }}
        >
          <ClayIcon name="dumbbell" size={22} color={templateColor} />
        </View>

        <View className="flex-1">
          <Text className="t-heading">{template.name}</Text>
          {template.description ? (
            <Text className="t-caption mt-1">{template.description}</Text>
          ) : null}
        </View>

        <ClayIcon name="chevron" size={18} color={colors.muted} />
      </View>

      <View className="mt-4 flex-row gap-2">
        <View className="rounded-full bg-surface-sunk px-3 py-2">
          <Text className="t-caption text-foreground-secondary">
            {t('common.exercise', { count: template.exercises.length })}
          </Text>
        </View>
        <View className="rounded-full bg-surface-sunk px-3 py-2">
          <Text className="t-caption text-foreground-secondary">
            {t('common.set', { count: setCount })}
          </Text>
        </View>
      </View>

      {preview ? (
        <Text className="t-caption mt-3">
          {preview}
          {remainingExercises > 0 ? ` · ${morePreviewLabel}` : ''}
        </Text>
      ) : (
        <Text className="t-caption mt-3">{t('plan.card.noExercisesYet')}</Text>
      )}
    </Pressable>
  );
}
