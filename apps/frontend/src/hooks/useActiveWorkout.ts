import { useMemo } from 'react';
import { eq, asc } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import { useRepository } from '../data/local/useRepository';
import {
  workoutSessions,
  workoutSessionSets,
  exercises as exerciseTable,
} from '../data/local/schema';
import { useWorkoutStore } from '../stores/workoutStore';
import { useAuthStore } from '../stores/authStore';
import type { Exercise, WorkoutSessionSet } from '../types/domain';

export function useActiveWorkout() {
  const userId = useAuthStore(s => s.userId);
  const activeSessionId = useWorkoutStore(s => s.activeSessionId);
  const selectedExerciseIds = useWorkoutStore(s => s.selectedExerciseIds);
  const setActiveSession = useWorkoutStore(s => s.setActiveSession);
  const addExerciseId = useWorkoutStore(s => s.addExerciseId);
  const resetStore = useWorkoutStore(s => s.reset);

  const sessionRepo = useRepository(workoutSessions);
  const setRepo = useRepository(workoutSessionSets);
  const exerciseRepo = useRepository(exerciseTable);

  const activeSession = activeSessionId
    ? sessionRepo.getById(activeSessionId)
    : null;

  const sets = activeSessionId
    ? setRepo.query({
        where: eq(workoutSessionSets.workoutSessionId, activeSessionId),
        orderBy: [asc(workoutSessionSets.setIndex)],
      })
    : [];

  const activeExercises = useMemo(() => {
    // Collect exercise IDs from both selected list and logged sets
    const idsFromSets = new Set(sets.map(s => s.exerciseId));
    const allIds = [...new Set([...selectedExerciseIds, ...idsFromSets])];

    return allIds.map(id => {
      const exercise = exerciseRepo.getById(id) as Exercise | null;
      const exerciseSets = sets.filter(s => s.exerciseId === id);
      return {
        exercise: exercise ?? {
          id,
          name: 'Unknown',
          description: null,
          exerciseCategory: 'OTHER' as const,
          muscleGroups: [],
          equipment: [],
          createdAt: 0,
        },
        sets: exerciseSets,
      };
    });
  }, [selectedExerciseIds, sets, exerciseRepo]);

  const isActive = activeSession !== null && activeSession.endedAt === null;
  const totalSets = sets.length;
  const elapsedMs = activeSession ? Date.now() - activeSession.startedAt : 0;

  function startWorkout(name: string, workoutTemplateId?: string) {
    const id = randomUUID();
    sessionRepo.create({
      id,
      userId,
      workoutTemplateId: workoutTemplateId ?? null,
      name,
      startedAt: Date.now(),
      endedAt: null,
      notes: null,
    });
    setActiveSession(id);
  }

  function addExercise(exercise: Exercise) {
    addExerciseId(exercise.id);
  }

  function logSet(exerciseId: string, weight: number | null, reps: number) {
    if (!activeSessionId) return;
    const exerciseSets = sets.filter(s => s.exerciseId === exerciseId);
    setRepo.create({
      id: randomUUID(),
      workoutSessionId: activeSessionId,
      exerciseId,
      setIndex: exerciseSets.length + 1,
      reps,
      weight,
      restSeconds: null,
      durationSeconds: null,
      notes: null,
      performedAt: Date.now(),
      rpe: null,
    });
  }

  function deleteSet(setId: string) {
    setRepo.deleteById(setId);
  }

  function finishWorkout(notes?: string) {
    if (!activeSessionId) return;
    sessionRepo.update(activeSessionId, {
      endedAt: Date.now(),
      notes: notes ?? null,
    });
  }

  function discardWorkout() {
    if (activeSessionId) {
      sessionRepo.deleteById(activeSessionId);
    }
    resetStore();
  }

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
