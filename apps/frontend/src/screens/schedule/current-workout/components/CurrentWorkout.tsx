import { useEffect, useMemo, useRef } from 'react';
import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'heroui-native';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { CurrentWorkoutExercise } from '@/stores/currentWorkoutModel';
import { colors } from '@/theme/tokens';
import type { ExerciseSelectionResult } from '@/types/exercise';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { SetSheetHost } from '@/components/exercise/set-table';
import { SessionHeader } from './SessionHeader';
import { SessionExerciseList } from './SessionExerciseList';
import { CurrentWorkoutFooter } from './CurrentWorkoutFooter';
import { RestTimerOverlay } from './rest-timer/RestTimerOverlay';
import { RestTimerPill } from './rest-timer/RestTimerPill';
import { useRestTimer } from './rest-timer/useRestTimer';

type CurrentWorkoutProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CurrentWorkout'>;
  exerciseSelection?: ExerciseSelectionResult;
  onChooseExercises: (selectedExerciseIds: string[]) => void;
};

type EmptyWorkoutProps = {
  onBack: () => void;
};

function EmptyWorkout({ onBack }: EmptyWorkoutProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-surface-card">
        <ClayIcon name="dumbbell" size={26} color={colors.muted} />
      </View>
      <Text className="t-heading text-center">
        {t('currentWorkout.empty.title')}
      </Text>
      <Text className="t-caption text-center">
        {t('currentWorkout.empty.body')}
      </Text>
      <Button
        className="mt-2 rounded-full"
        variant="secondary"
        feedbackVariant="scale"
        onPress={onBack}
      >
        <Button.Label>{t('currentWorkout.empty.backToPlan')}</Button.Label>
      </Button>
    </View>
  );
}

function applyExerciseSelection(
  t: TFunction,
  currentExercises: CurrentWorkoutExercise[],
  selection: ExerciseSelectionResult,
  updateExercises: (exerciseIds: string[]) => void,
) {
  const selectedIds = new Set(selection.exerciseIds);
  const removesCompletedExercise = currentExercises.some(
    exercise =>
      !selectedIds.has(exercise.exerciseId) &&
      exercise.sets.some(set => set.isDone),
  );
  if (!removesCompletedExercise) {
    updateExercises(selection.exerciseIds);
    return;
  }
  Alert.alert(
    t('currentWorkout.alerts.removeExercisesTitle'),
    t('currentWorkout.alerts.removeExercisesBody'),
    [
      { text: t('currentWorkout.alerts.keepExercises'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => updateExercises(selection.exerciseIds),
      },
    ],
  );
}

export function CurrentWorkout({
  navigation,
  exerciseSelection,
  onChooseExercises,
}: CurrentWorkoutProps) {
  const { t } = useTranslation();
  const appliedSelectionId = useRef<string | null>(null);
  const {
    options: setTypeOptions,
    byId: setTypesById,
    createSetType,
  } = useSetTypeLibrary();
  const { profile } = useUserProfile();
  const rest = useRestTimer();
  const restTimerFullscreen = useAppSettingsStore(
    state => state.restTimerFullscreen,
  );
  const setRestTimerFullscreen = useAppSettingsStore(
    state => state.setRestTimerFullscreen,
  );
  const {
    currentWorkout,
    exerciseOptions,
    discardWorkout,
    finishWorkout,
    updateSet,
    toggleSetDone,
    addSet,
    removeSet,
    updateExercises,
    removeExercise,
    pauseWorkout,
    resumeWorkout,
    canFinish,
    structureChanged,
  } = useCurrentWorkout();

  const optionById = useMemo(
    () => new Map(exerciseOptions.map(option => [option.id, option] as const)),
    [exerciseOptions],
  );

  useEffect(() => {
    if (!currentWorkout) {
      // Mark any selection param present while no workout exists as consumed
      // so a stale param can't apply to a workout started later while this
      // screen stays mounted.
      appliedSelectionId.current = exerciseSelection?.id ?? null;
      return;
    }
    if (
      exerciseSelection &&
      exerciseSelection.id !== appliedSelectionId.current
    ) {
      appliedSelectionId.current = exerciseSelection.id;
      applyExerciseSelection(
        t,
        currentWorkout.exercises,
        exerciseSelection,
        updateExercises,
      );
    }
  }, [currentWorkout, exerciseSelection, t, updateExercises]);

  if (!currentWorkout) {
    return <EmptyWorkout onBack={() => navigation.goBack()} />;
  }

  const allSets = currentWorkout.exercises.flatMap(exercise => exercise.sets);
  const completedSetCount = allSets.filter(set => set.isDone).length;

  return (
    <SetSheetHost
      setTypeOptions={setTypeOptions}
      onCreateSetType={createSetType}
    >
      <View className="flex-1">
        <SessionHeader
          workoutName={currentWorkout.name}
          startedAt={currentWorkout.startedAt}
          pausedAt={currentWorkout.pausedAt}
          pausedMs={currentWorkout.pausedMs}
          completedSets={completedSetCount}
          totalSets={allSets.length}
          onTogglePause={
            currentWorkout.pausedAt != null ? resumeWorkout : pauseWorkout
          }
          onBack={() => navigation.goBack()}
        />

        <SessionExerciseList
          exercises={currentWorkout.exercises}
          optionById={optionById}
          setTypeOptions={setTypeOptions}
          setTypesById={setTypesById}
          weightUnit={profile.weightUnit}
          onCreateSetType={createSetType}
          addSet={addSet}
          updateSet={updateSet}
          toggleSetDone={toggleSetDone}
          restStart={rest.start}
          activeRestSetId={rest.isRunning ? rest.sourceSetId : null}
          removeSet={removeSet}
          removeExercise={removeExercise}
          onChooseExercises={onChooseExercises}
        />

        <RestTimerPill
          visible={rest.isActive && rest.isMinimized}
          isRunning={rest.isRunning}
          remainingMs={rest.remainingMs}
          totalMs={rest.totalMs}
          onToggle={rest.toggle}
          onAddSeconds={rest.addSeconds}
          onSkip={rest.skip}
          onExpand={rest.expand}
          canExpand={restTimerFullscreen}
        />

        <CurrentWorkoutFooter
          canFinish={canFinish}
          shouldPromptForTemplate={structureChanged}
          navigation={navigation}
          finishWorkout={finishWorkout}
          discardWorkout={discardWorkout}
        />

        <RestTimerOverlay
          visible={rest.isActive && !rest.isMinimized && restTimerFullscreen}
          isRunning={rest.isRunning}
          remainingMs={rest.remainingMs}
          totalMs={rest.totalMs}
          onToggle={rest.toggle}
          onAddSeconds={rest.addSeconds}
          onSkip={rest.skip}
          onMinimize={rest.minimize}
          onNeverShowAgain={() => {
            setRestTimerFullscreen(false);
            rest.minimize();
          }}
        />
      </View>
    </SetSheetHost>
  );
}
