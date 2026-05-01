import {useMemo} from 'react';
import * as SetRepo from '../data/repositories/WorkoutSetRepository';
import * as SessionRepo from '../data/repositories/WorkoutSessionRepository';
import type {Exercise} from '../types/domain';

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

export function useProgress(exercises: Exercise[]) {
  const personalRecords = useMemo(() => {
    const records: PersonalRecord[] = [];
    for (const exercise of exercises) {
      const pr = SetRepo.getPersonalRecord(exercise.id);
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
  }, [exercises]);

  const heatmapData = useMemo(() => {
    const sessions = SessionRepo.getAllSessions();
    const dayMap = new Map<string, number>();

    for (const session of sessions) {
      const date = new Date(session.startedAt).toISOString().slice(0, 10);
      dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
    }

    const data: DayActivity[] = [];
    for (const [date, count] of dayMap) {
      data.push({date, count});
    }
    return data.sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const totalWorkouts = useMemo(() => {
    return SessionRepo.getAllSessions().filter((s) => s.endedAt !== null).length;
  }, []);

  return {personalRecords, heatmapData, totalWorkouts};
}
