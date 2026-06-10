import { Pressable, Text, View } from 'react-native';
import type { WorkoutTemplateStatus } from '../../data/local/enums';
import type { ExerciseOption } from '../../types/exercise';
import type { WorkoutTemplate } from '../../types/workout';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';
import {
  countTemplateSets,
  formatTemplateSchedule,
  getWorkoutTemplateColor,
} from './services/workoutTemplatePresentationService';

type WorkoutTemplateCardProps = {
  template: WorkoutTemplate;
  exerciseOptions: ExerciseOption[];
  onStart: (template: WorkoutTemplate) => void;
  onEdit: (template: WorkoutTemplate) => void;
  onStatusChange: (
    template: WorkoutTemplate,
    status: WorkoutTemplateStatus,
  ) => void;
};

export function WorkoutTemplateCard({
  template,
  exerciseOptions,
  onStart,
  onEdit,
  onStatusChange,
}: WorkoutTemplateCardProps) {
  const exerciseNames = new Map(
    exerciseOptions.map(exercise => [exercise.id, exercise.name]),
  );
  const preview = template.exercises
    .slice(0, 3)
    .map(exercise => exerciseNames.get(exercise.exerciseId) ?? 'Exercise')
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
  const primaryActionLabel = isArchived
    ? 'Restore'
    : isActive
    ? 'Deactivate'
    : 'Activate';
  const statusLabel =
    template.status === 'ACTIVE'
      ? 'Active'
      : template.status === 'INACTIVE'
      ? 'Inactive'
      : 'Archived';

  return (
    <View
      className={`overflow-hidden rounded-[24px] border border-border-hairline bg-surface-card ${
        isArchived ? 'opacity-[0.65]' : ''
      }`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Start ${template.name}`}
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
              {template.description || formatTemplateSchedule(template)}
            </Text>
          </View>

          <ClayIcon name="chevron" size={18} color={colors.muted} />
        </View>

        <View className="mt-4 flex-row gap-2">
          <View className="rounded-full bg-surface-sunk px-3 py-2">
            <Text className="t-caption text-foreground-secondary">
              {template.exercises.length}{' '}
              {template.exercises.length === 1 ? 'exercise' : 'exercises'}
            </Text>
          </View>
          <View className="rounded-full bg-surface-sunk px-3 py-2">
            <Text className="t-caption text-foreground-secondary">
              {setCount} {setCount === 1 ? 'set' : 'sets'}
            </Text>
          </View>
        </View>

        {preview ? (
          <Text className="t-caption mt-3">
            {preview}
            {remainingExercises > 0 ? ` · +${remainingExercises}` : ''}
          </Text>
        ) : (
          <Text className="t-caption mt-3">No exercises yet</Text>
        )}
      </Pressable>

      <View className="flex-row border-t border-border-soft">
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-1 flex-row items-center justify-center gap-2 active:bg-surface-sunk"
          onPress={() => onEdit(template)}
        >
          <ClayIcon name="edit" size={17} color={colors.ink2} />
          <Text className="t-label text-foreground-secondary">Edit</Text>
        </Pressable>
        <View className="w-px bg-border-soft" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${primaryActionLabel} ${template.name}`}
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
              accessibilityLabel={`Archive ${template.name}`}
              className="min-h-12 flex-1 flex-row items-center justify-center gap-2 active:bg-surface-sunk"
              onPress={() => onStatusChange(template, 'ARCHIVED')}
            >
              <ClayIcon name="archive" size={17} color={colors.muted} />
              <Text className="t-label text-muted">Archive</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
