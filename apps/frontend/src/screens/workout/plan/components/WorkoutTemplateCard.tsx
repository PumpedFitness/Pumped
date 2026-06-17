import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { WorkoutTemplateStatus } from '@/data/local/enums';
import type { WorkoutTemplate } from '@/types/workout';
import type { Schedule } from '@/types/schedule';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  countTemplateSets,
  formatTemplateSchedule,
  getWorkoutTemplateColor,
} from '@/components/workout/workoutTemplatePresentation';

type WorkoutTemplateCardProps = {
  template: WorkoutTemplate;
  schedule: Schedule | null;
  exerciseNames: Map<string, string>;
  onStart: (template: WorkoutTemplate) => void;
  onEdit: (template: WorkoutTemplate) => void;
  onStatusChange: (
    template: WorkoutTemplate,
    status: WorkoutTemplateStatus,
  ) => void;
};

function getStatusLabel(t: TFunction, status: WorkoutTemplateStatus): string {
  if (status === 'ACTIVE') {
    return t('plan.status.active');
  }
  if (status === 'INACTIVE') {
    return t('plan.status.inactive');
  }
  return t('plan.status.archived');
}

function getPrimaryActionLabel(
  t: TFunction,
  status: WorkoutTemplateStatus,
): string {
  if (status === 'ARCHIVED') {
    return t('plan.card.restore');
  }
  if (status === 'ACTIVE') {
    return t('plan.card.deactivate');
  }
  return t('plan.card.activate');
}

export function WorkoutTemplateCard({
  template,
  schedule,
  exerciseNames,
  onStart,
  onEdit,
  onStatusChange,
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
  const isActive = template.status === 'ACTIVE';
  const isArchived = template.status === 'ARCHIVED';
  const nextPrimaryStatus: WorkoutTemplateStatus = isArchived
    ? 'INACTIVE'
    : isActive
    ? 'INACTIVE'
    : 'ACTIVE';
  const primaryActionLabel = getPrimaryActionLabel(t, template.status);
  const statusLabel = getStatusLabel(t, template.status);
  const morePreviewLabel: string = t('plan.card.morePreview', {
    count: remainingExercises,
  });

  return (
    <View
      className={`overflow-hidden rounded-[24px] border border-border-hairline bg-surface-card ${
        isArchived ? 'opacity-[0.65]' : ''
      }`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('plan.card.startA11y', { name: template.name })}
        className="p-5 active:bg-surface-sunk"
        onPress={() => onStart(template)}
      >
        <View className="flex-row items-start gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-[14px]"
            style={{ backgroundColor: `${templateColor}22` }}
          >
            <ClayIcon name="dumbbell" size={22} color={templateColor} />
          </View>

          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="t-heading">{template.name}</Text>
              <View
                className={`rounded-full px-2.5 py-1 ${
                  isActive ? 'bg-accent-soft' : 'bg-surface-sunk'
                }`}
              >
                <Text
                  className={`text-[11px] font-bold uppercase tracking-[0.8px] ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>
            <Text className="t-caption mt-1">
              {template.description || formatTemplateSchedule(t, schedule)}
            </Text>
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
          <Text className="t-caption mt-3">
            {t('plan.card.noExercisesYet')}
          </Text>
        )}
      </Pressable>

      <View className="flex-row border-t border-border-soft">
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-1 flex-row items-center justify-center gap-2 active:bg-surface-sunk"
          onPress={() => onEdit(template)}
        >
          <ClayIcon name="edit" size={17} color={colors.ink2} />
          <Text className="t-label text-foreground-secondary">
            {t('plan.card.edit')}
          </Text>
        </Pressable>
        <View className="w-px bg-border-soft" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('plan.card.actionA11y', {
            action: primaryActionLabel,
            name: template.name,
          })}
          className="min-h-12 flex-1 flex-row items-center justify-center gap-2 active:bg-surface-sunk"
          onPress={() => onStatusChange(template, nextPrimaryStatus)}
        >
          <ClayIcon
            name={isArchived ? 'archive' : isActive ? 'pause' : 'play'}
            size={17}
            color={colors.ink2}
          />
          <Text className="t-label text-foreground-secondary">
            {primaryActionLabel}
          </Text>
        </Pressable>
        {!isArchived && (
          <>
            <View className="w-px bg-border-soft" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('plan.card.actionA11y', {
                action: t('plan.card.archive'),
                name: template.name,
              })}
              className="min-h-12 flex-1 flex-row items-center justify-center gap-2 active:bg-surface-sunk"
              onPress={() => onStatusChange(template, 'ARCHIVED')}
            >
              <ClayIcon name="archive" size={17} color={colors.muted} />
              <Text className="t-label text-muted">
                {t('plan.card.archive')}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
