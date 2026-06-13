// Completed workout session reads/writes. Plain functions over the local
// database — always consumed through domain hooks (useWorkoutHistory,
// useCurrentWorkout). Writes notify table subscribers.

import { randomUUID } from 'expo-crypto';
import { asc, desc, eq } from 'drizzle-orm';
import { i18n } from '@/i18n';
import type { WorkoutSetType } from '@/data/local/enums';
import type {
  PerformedSet,
  WorkoutSession,
  WorkoutSessionDetails,
} from '@/types/workout';
import { db } from '@/data/local/database';
import { notifyTableChanged } from '@/data/local/tableVersions';
import { performedSets, workoutSessions } from '@/data/local/schema';
import { LOCAL_USER_ID, requireText } from './validation';
import { assertTemplateExists } from './templates';

export type PerformedSetInput = {
  id?: string;
  exerciseId: string;
  exercisePosition: number;
  setPosition: number;
  setType: WorkoutSetType;
  reps: number;
  weight?: number | null;
  rpe?: number | null;
  performedAt?: number;
};

export type SaveCompletedWorkoutInput = {
  id?: string;
  workoutTemplateId?: string | null;
  name: string;
  startedAt: number;
  endedAt: number;
  notes?: string | null;
  sets: PerformedSetInput[];
};

export function getWorkoutSession(
  sessionId: string,
): WorkoutSessionDetails | null {
  const session = db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, sessionId))
    .get();

  if (!session) {
    return null;
  }

  const sets: PerformedSet[] = db
    .select()
    .from(performedSets)
    .where(eq(performedSets.workoutSessionId, sessionId))
    .orderBy(
      asc(performedSets.exercisePosition),
      asc(performedSets.setPosition),
    )
    .all();

  return { ...session, sets };
}

export function listWorkoutSessions(): WorkoutSession[] {
  return db
    .select()
    .from(workoutSessions)
    .orderBy(desc(workoutSessions.startedAt))
    .all();
}

export function saveCompletedWorkout(
  input: SaveCompletedWorkoutInput,
): WorkoutSessionDetails {
  const sessionId = input.id ?? randomUUID();
  const name = requireText(input.name, i18n.t('errors.fields.workoutName'));

  if (input.endedAt < input.startedAt) {
    throw new Error(i18n.t('errors.endBeforeStart'));
  }

  if (input.workoutTemplateId) {
    assertTemplateExists(input.workoutTemplateId);
  }

  db.transaction(tx => {
    const existing = tx
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .get();

    if (existing) {
      tx.update(workoutSessions)
        .set({
          workoutTemplateId: input.workoutTemplateId ?? null,
          name,
          startedAt: input.startedAt,
          endedAt: input.endedAt,
          notes: input.notes ?? null,
        })
        .where(eq(workoutSessions.id, sessionId))
        .run();
    } else {
      tx.insert(workoutSessions)
        .values({
          id: sessionId,
          userId: LOCAL_USER_ID,
          workoutTemplateId: input.workoutTemplateId ?? null,
          name,
          startedAt: input.startedAt,
          endedAt: input.endedAt,
          notes: input.notes ?? null,
        })
        .run();
    }

    tx.delete(performedSets)
      .where(eq(performedSets.workoutSessionId, sessionId))
      .run();

    if (input.sets.length > 0) {
      tx.insert(performedSets)
        .values(
          input.sets.map(set => ({
            id: set.id ?? randomUUID(),
            workoutSessionId: sessionId,
            exerciseId: set.exerciseId,
            exercisePosition: set.exercisePosition,
            setPosition: set.setPosition,
            setType: set.setType,
            reps: set.reps,
            weight: set.weight ?? null,
            rpe: set.rpe ?? null,
            performedAt: set.performedAt ?? Date.now(),
          })),
        )
        .run();
    }
  });

  notifyTableChanged(workoutSessions, performedSets);

  return getWorkoutSession(sessionId)!;
}
