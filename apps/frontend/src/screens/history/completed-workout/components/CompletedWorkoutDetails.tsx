import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'heroui-native';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { setWorkoutSessionTemplate } from '@/data/local/workouts/sessions';
import { workoutSessionToTemplateInput } from '@/data/local/workouts/workoutTemplateConversion';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import {
  useWorkoutSession,
  type WorkoutHistoryItem,
} from '@/hooks/useWorkoutHistory';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import type { PerformedSet } from '@/types/workout';
import { displayWeight } from '@/utils/units';
import {
  ExerciseSetTable,
  type SetTypeOption,
} from '@/components/exercise/set-table';
import { ExerciseSectionHeader } from '@/components/exercise/ExerciseSectionHeader';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@/theme/tokens';
import type { SetTypeWithFields } from '@/types/setType';

type CompletedWorkoutDetailsProps = {
  workoutId: string;
  weightUnit: WeightUnit;
};

type CompletedWorkoutTemplateActionProps = {
  hasTemplate: boolean;
  onPress: () => void;
};

function CompletedWorkoutTemplateAction({
  hasTemplate,
  onPress,
}: CompletedWorkoutTemplateActionProps) {
  const { t } = useTranslation();

  return (
    <Button
      className="mx-5 rounded-full"
      variant="secondary"
      feedbackVariant="scale"
      onPress={onPress}
    >
      <Button.Label>
        {t(
          hasTemplate
            ? 'completedWorkout.editTemplate'
            : 'completedWorkout.createTemplate',
        )}
      </Button.Label>
    </Button>
  );
}

type CompletedExercise = {
  key: string;
  exerciseId: string;
  sets: PerformedSet[];
};

type ExerciseStats = {
  sets: number;
  volumeKg: number;
  topWeightKg: number | null;
};

function groupCompletedExercises(
  workout: WorkoutHistoryItem,
): CompletedExercise[] {
  const groups = new Map<string, CompletedExercise>();

  workout.sets.forEach(set => {
    const key = `${set.exercisePosition}:${set.exerciseId}`;
    const group = groups.get(key) ?? {
      key,
      exerciseId: set.exerciseId,
      sets: [],
    };
    group.sets.push(set);
    groups.set(key, group);
  });

  return [...groups.values()];
}

function formatDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleTimeString(language, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatVolume(volumeKg: number, weightUnit: WeightUnit): string {
  const volume = displayWeight(volumeKg, weightUnit);
  return `${Math.round(volume).toLocaleString()} ${weightUnit}`;
}

function buildExerciseStats(sets: PerformedSet[]): ExerciseStats {
  return sets.reduce<ExerciseStats>(
    (stats, set) => {
      const { weight: weightKg, reps } = resolveSetWeightReps(set);
      const volumeKg = weightKg !== null && reps !== null ? weightKg * reps : 0;
      return {
        sets: stats.sets + 1,
        volumeKg: stats.volumeKg + volumeKg,
        topWeightKg:
          weightKg === null
            ? stats.topWeightKg
            : Math.max(stats.topWeightKg ?? weightKg, weightKg),
      };
    },
    { sets: 0, volumeKg: 0, topWeightKg: null },
  );
}

type StatTileProps = {
  label: string;
  value: string;
};

function StatTile({ label, value }: StatTileProps) {
  return (
    <View className="flex-1 rounded-[14px] bg-surface-card/10 px-3 py-2.5">
      <Text className="t-eyebrow text-surface-card/60">{label}</Text>
      <Text className="t-label mt-1 text-surface-card">{value}</Text>
    </View>
  );
}

function ExerciseStatPill({ label, value }: StatTileProps) {
  return (
    <View className="min-w-0 flex-1">
      <Text className="text-[9px] font-bold uppercase tracking-[0.6px] text-muted">
        {label}
      </Text>
      <Text className="mt-0.5 text-[13px] font-bold tabular-nums text-foreground">
        {value}
      </Text>
    </View>
  );
}

type CompletedExerciseSectionProps = {
  exercise: CompletedExercise;
  index: number;
  name: string;
  isCollapsed: boolean;
  onOpen?: () => void;
  onToggleCollapsed: () => void;
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  weightUnit: WeightUnit;
};

function CompletedExerciseSection({
  exercise,
  index,
  name,
  isCollapsed,
  onOpen,
  onToggleCollapsed,
  setTypeOptions,
  setTypesById,
  weightUnit,
}: CompletedExerciseSectionProps) {
  const { t } = useTranslation();
  const setCount = exercise.sets.length;
  const stats = buildExerciseStats(exercise.sets);
  const topWeight =
    stats.topWeightKg === null
      ? '–'
      : `${displayWeight(stats.topWeightKg, weightUnit)} ${weightUnit}`;

  return (
    <View className="-mx-5 overflow-hidden border-y border-border-hairline bg-background">
      <ExerciseSectionHeader
        index={index}
        name={name}
        doneCount={setCount}
        totalCount={setCount}
        state="finished"
        onOpen={onOpen}
        isCollapsed={isCollapsed}
        onToggleCollapsed={onToggleCollapsed}
      />
      <View className="border-b border-border-hairline bg-surface-card px-4 py-2.5">
        <View className="flex-row gap-3">
          <ExerciseStatPill
            label={t('completedWorkout.exerciseStats.sets')}
            value={`${stats.sets}`}
          />
          <ExerciseStatPill
            label={t('completedWorkout.exerciseStats.volume')}
            value={formatVolume(stats.volumeKg, weightUnit)}
          />
          <ExerciseStatPill
            label={t('completedWorkout.exerciseStats.topWeight')}
            value={topWeight}
          />
        </View>
      </View>
      {!isCollapsed ? (
        <View className="px-4 py-3">
          <ExerciseSetTable
            readOnly
            sets={exercise.sets}
            setTypeOptions={setTypeOptions}
            setTypesById={setTypesById}
            weightUnit={weightUnit}
          />
        </View>
      ) : null}
    </View>
  );
}

export function CompletedWorkoutDetails({
  workoutId,
  weightUnit,
}: CompletedWorkoutDetailsProps) {
  const { t, i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const workout = useWorkoutSession(workoutId);
  const { saveTemplate } = useWorkoutTemplates();
  const exerciseOptions = useExerciseOptions();
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();

  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(
    () =>
      new Set(
        (workout ? groupCompletedExercises(workout) : []).map(
          exercise => exercise.key,
        ),
      ),
  );
  const toggleCollapsed = (exerciseKey: string) => {
    setCollapsedExercises(previous => {
      const next = new Set(previous);
      if (next.has(exerciseKey)) {
        next.delete(exerciseKey);
      } else {
        next.add(exerciseKey);
      }
      return next;
    });
  };

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <ClayIcon name="history" size={28} color={colors.muted} />
        <Text className="t-heading text-center">
          {t('completedWorkout.notFoundTitle')}
        </Text>
        <Text className="t-caption text-center">
          {t('completedWorkout.notFoundBody')}
        </Text>
      </View>
    );
  }

  const handleOpenTemplate = () => {
    const openTemplate = (templateId: string) => {
      navigation.navigate('WorkoutTemplateEditor', { templateId });
    };

    if (workout.workoutTemplateId) {
      openTemplate(workout.workoutTemplateId);
      return;
    }

    try {
      const template = saveTemplate(workoutSessionToTemplateInput(workout));
      setWorkoutSessionTemplate(workout.id, template.id);
      openTemplate(template.id);
    } catch {
      Alert.alert(
        t('completedWorkout.templateErrorTitle'),
        t('completedWorkout.templateErrorBody'),
      );
    }
  };

  const exercises = groupCompletedExercises(workout);
  const exerciseById = new Map(
    exerciseOptions.map(exercise => [exercise.id, exercise] as const),
  );
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-4 px-5 pb-8 pt-5"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4 rounded-[24px] bg-moss px-5 py-5">
        <View>
          <Text className="t-eyebrow text-surface-card/70">
            {formatDate(workout.startedAt, i18n.language)}
          </Text>
          <Text className="t-title mt-1 text-surface-card">{workout.name}</Text>
          <Text className="t-caption mt-2 text-surface-card/70">
            {t('completedWorkout.timeRange', {
              start: formatTime(workout.startedAt, i18n.language),
              end: formatTime(
                workout.endedAt ?? workout.startedAt,
                i18n.language,
              ),
            })}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <StatTile
            label={t('completedWorkout.stats.duration')}
            value={t('common.minutesShort', { count: workout.durationMinutes })}
          />
          <StatTile
            label={t('completedWorkout.stats.sets')}
            value={`${workout.sets.length}`}
          />
          <StatTile
            label={t('completedWorkout.stats.volume')}
            value={formatVolume(workout.totalVolumeKg, weightUnit)}
          />
        </View>
      </View>

      <CompletedWorkoutTemplateAction
        hasTemplate={Boolean(workout.workoutTemplateId)}
        onPress={handleOpenTemplate}
      />

      {exercises.map((exercise, index) => {
        const option = exerciseById.get(exercise.exerciseId);
        const isCollapsed = collapsedExercises.has(exercise.key);

        return (
          <CompletedExerciseSection
            key={exercise.key}
            exercise={exercise}
            index={index}
            name={option?.name ?? t('common.unknownExercise')}
            isCollapsed={isCollapsed}
            onOpen={
              option
                ? () =>
                    navigation.navigate('EditExercise', {
                      exerciseId: exercise.exerciseId,
                    })
                : undefined
            }
            onToggleCollapsed={() => toggleCollapsed(exercise.key)}
            setTypeOptions={setTypeOptions}
            setTypesById={setTypesById}
            weightUnit={weightUnit}
          />
        );
      })}

      {workout.notes ? (
        <View className="rounded-[22px] border border-border-hairline bg-surface-card p-4">
          <Text className="t-eyebrow">{t('completedWorkout.notes')}</Text>
          <Text className="t-body mt-2">{workout.notes}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
