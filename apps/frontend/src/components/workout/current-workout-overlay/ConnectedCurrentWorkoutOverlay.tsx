import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import { useCurrentWorkoutStore } from '@/stores/currentWorkoutStore';
import { currentWorkoutElapsedMs } from '@/stores/currentWorkoutModel';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { CurrentWorkoutOverlay } from './CurrentWorkoutOverlay';

const ELAPSED_TIME_REFRESH_MS = 30_000;

type ConnectedCurrentWorkoutOverlayProps = {
  visible: boolean;
};

export function ConnectedCurrentWorkoutOverlay({
  visible,
}: ConnectedCurrentWorkoutOverlayProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Read the draft straight from the store + the exercise catalog. Going through
  // useCurrentWorkout here would also run getWorkoutTemplate and recompute
  // canFinish/structureChanged on every mutation — dead work this overlay never
  // reads, in an always-mounted component.
  const currentWorkout = useCurrentWorkoutStore(state => state.currentWorkout);
  const exerciseOptions = useExerciseOptions();
  const [now, setNow] = useState(Date.now());
  const currentWorkoutId = currentWorkout?.id;

  useEffect(() => {
    if (!visible || !currentWorkoutId) {
      return;
    }

    setNow(Date.now());
    const interval = setInterval(
      () => setNow(Date.now()),
      ELAPSED_TIME_REFRESH_MS,
    );

    return () => clearInterval(interval);
  }, [currentWorkoutId, visible]);

  const exerciseNames = useMemo(
    () =>
      new Map(
        exerciseOptions.map(exercise => [exercise.id, exercise.name] as const),
      ),
    [exerciseOptions],
  );

  if (!currentWorkout) {
    return null;
  }

  const allSets = currentWorkout.exercises.flatMap(exercise => exercise.sets);
  const currentExercise = currentWorkout.exercises.find(exercise =>
    exercise.sets.some(set => !set.isDone),
  );
  const elapsedMinutes = Math.floor(
    currentWorkoutElapsedMs(currentWorkout, now) / 60_000,
  );

  return (
    <CurrentWorkoutOverlay
      visible={visible}
      workoutName={currentWorkout.name}
      completedSets={allSets.filter(set => set.isDone).length}
      totalSets={allSets.length}
      elapsedMinutes={elapsedMinutes}
      currentExerciseName={
        currentExercise
          ? exerciseNames.get(currentExercise.exerciseId)
          : undefined
      }
      onOpenWorkout={() => navigation.navigate('CurrentWorkout')}
    />
  );
}
