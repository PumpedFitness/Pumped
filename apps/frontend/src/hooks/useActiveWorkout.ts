import {useWorkoutStore} from '../stores/workoutStore';

export function useActiveWorkout() {
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const activeExercises = useWorkoutStore((s) => s.activeExercises);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const logSet = useWorkoutStore((s) => s.logSet);
  const deleteSet = useWorkoutStore((s) => s.deleteSet);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const discardWorkout = useWorkoutStore((s) => s.discardWorkout);

  const isActive = activeSession !== null && activeSession.endedAt === null;

  const totalSets = activeExercises.reduce(
    (sum, e) => sum + e.sets.length,
    0,
  );

  const elapsedMs = activeSession
    ? Date.now() - activeSession.startedAt
    : 0;

  return {
    activeSession,
    activeExercises,
    isActive,
    totalSets,
    elapsedMs,
    startWorkout,
    addExercise,
    logSet,
    deleteSet,
    finishWorkout,
    discardWorkout,
  };
}
