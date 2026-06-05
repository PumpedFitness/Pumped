import { useMemo } from 'react';
import { eq, desc, asc, and, isNotNull } from 'drizzle-orm';
import { useRepository } from '../data/local/useRepository';
import {
  exercises as exerciseTable,
  workoutSessions,
  workoutSessionSets,
} from '../data/local/schema';
import type { Exercise } from '../types/domain';

type PersonalRecord = {
  exercise: Exercise;
  weight: number;
  reps: number;
  date: number;
};

type DayActivity = {
  date: string; // YYYY-MM-DD
  count: number;
};

export function useProgress() {
  const exerciseRepo = useRepository(exerciseTable);
  const sessionRepo = useRepository(workoutSessions);
  const setRepo = useRepository(workoutSessionSets);

  const allExercises = exerciseRepo.query({ orderBy: [asc(exerciseTable.name)] });

  const personalRecords = useMemo(() => {
    const records: PersonalRecord[] = [];
    for (const exercise of allExercises) {
      const pr = setRepo.query({
        where: and(
          eq(workoutSessionSets.exerciseId, exercise.id),
          isNotNull(workoutSessionSets.weight),
        ),
        orderBy: [
          desc(workoutSessionSets.weight),
          desc(workoutSessionSets.reps),
        ],
        limit: 1,
      })[0];
      if (pr && pr.weight !== null) {
        records.push({
          exercise,
          weight: pr.weight,
          reps: pr.reps,
          date: pr.performedAt,
        });
      }
    }
    return records.sort((a, b) => b.date - a.date);
  }, [allExercises, setRepo]);

  const sessions = sessionRepo.query({
    orderBy: [desc(workoutSessions.startedAt)],
  });

  const heatmapData = useMemo(() => {
    const dayMap = new Map<string, number>();
    for (const session of sessions) {
      const date = new Date(session.startedAt).toISOString().slice(0, 10);
      dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
    }
    const data: DayActivity[] = [];
    for (const [date, count] of dayMap) {
      data.push({ date, count });
    }
    return data.sort((a, b) => a.date.localeCompare(b.date));
  }, [sessions]);

  const totalWorkouts = useMemo(
    () => sessions.filter(s => s.endedAt !== null).length,
    [sessions],
  );

  return { personalRecords, heatmapData, totalWorkouts };
}
