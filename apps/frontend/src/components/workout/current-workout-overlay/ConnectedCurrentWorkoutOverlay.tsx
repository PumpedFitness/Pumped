import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCurrentWorkout } from '../../../hooks/useCurrentWorkout';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
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
  const { currentWorkout, exerciseOptions } = useCurrentWorkout();
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
    Math.max(0, now - currentWorkout.startedAt) / 60_000,
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
