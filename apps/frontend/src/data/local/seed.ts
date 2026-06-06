import { eq } from 'drizzle-orm';
import type { db } from './database';
import {
  exercises,
  performedSets,
  workoutSessions,
  workoutTemplateExercises,
  workoutTemplateScheduleWeekdays,
  workoutTemplateSets,
  workoutTemplates,
} from './schema';

type LocalDatabase = typeof db;

const EXERCISE_IDS = {
  benchPress: 'sample-exercise-bench-press',
  overheadPress: 'sample-exercise-overhead-press',
  barbellRow: 'sample-exercise-barbell-row',
  backSquat: 'sample-exercise-back-squat',
} as const;

function sampleId(userId: string, entity: string): string {
  return `sample:${userId}:${entity}`;
}

export function seedDevelopmentData(
  database: LocalDatabase,
  userId: string,
): void {
  const now = Date.now();
  const pushTemplateId = sampleId(userId, 'template-push');
  const fullBodyTemplateId = sampleId(userId, 'template-full-body');
  const benchTemplateExerciseId = sampleId(userId, 'template-exercise-bench');
  const overheadTemplateExerciseId = sampleId(
    userId,
    'template-exercise-overhead',
  );
  const squatTemplateExerciseId = sampleId(userId, 'template-exercise-squat');
  const rowTemplateExerciseId = sampleId(userId, 'template-exercise-row');
  const completedSessionId = sampleId(userId, 'session-completed-push');
  const activeSessionId = sampleId(userId, 'session-active-full-body');

  database
    .insert(exercises)
    .values([
      {
        id: EXERCISE_IDS.benchPress,
        name: 'Barbell Bench Press',
        description: 'Horizontal barbell press performed on a flat bench.',
        exerciseCategory: 'STRENGTH',
        muscleGroups: ['CHEST', 'SHOULDERS', 'ARMS'],
        equipment: ['BARBELL'],
        createdAt: now,
      },
      {
        id: EXERCISE_IDS.overheadPress,
        name: 'Overhead Press',
        description: 'Standing barbell press from shoulder height.',
        exerciseCategory: 'STRENGTH',
        muscleGroups: ['SHOULDERS', 'ARMS'],
        equipment: ['BARBELL'],
        createdAt: now,
      },
      {
        id: EXERCISE_IDS.barbellRow,
        name: 'Barbell Row',
        description: 'Bent-over horizontal pull with a barbell.',
        exerciseCategory: 'STRENGTH',
        muscleGroups: ['BACK', 'ARMS'],
        equipment: ['BARBELL'],
        createdAt: now,
      },
      {
        id: EXERCISE_IDS.backSquat,
        name: 'Barbell Back Squat',
        description: 'Barbell squat with the bar supported across the back.',
        exerciseCategory: 'STRENGTH',
        muscleGroups: ['LEGS', 'CORE'],
        equipment: ['BARBELL'],
        createdAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  database
    .insert(workoutTemplates)
    .values([
      {
        id: pushTemplateId,
        userId,
        name: 'Push Strength',
        description: 'Bench and overhead press strength session.',
        scheduleType: 'WEEKS',
        scheduleInterval: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: fullBodyTemplateId,
        userId,
        name: 'Full Body Rotation',
        description: 'Simple squat and row session every three days.',
        scheduleType: 'DAYS',
        scheduleInterval: 3,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  database
    .insert(workoutTemplateScheduleWeekdays)
    .values([
      { workoutTemplateId: pushTemplateId, weekday: 'MONDAY' },
      { workoutTemplateId: pushTemplateId, weekday: 'THURSDAY' },
    ])
    .onConflictDoNothing()
    .run();

  database
    .insert(workoutTemplateExercises)
    .values([
      {
        id: benchTemplateExerciseId,
        workoutTemplateId: pushTemplateId,
        exerciseId: EXERCISE_IDS.benchPress,
        position: 0,
        goal: 'Build to 3 working sets of 6-8 reps at RPE 8',
        notes: 'Pause the first rep of each working set.',
      },
      {
        id: overheadTemplateExerciseId,
        workoutTemplateId: pushTemplateId,
        exerciseId: EXERCISE_IDS.overheadPress,
        position: 1,
        goal: '3 sets of 8-10 controlled reps',
        notes: null,
      },
      {
        id: squatTemplateExerciseId,
        workoutTemplateId: fullBodyTemplateId,
        exerciseId: EXERCISE_IDS.backSquat,
        position: 0,
        goal: 'One warmup set, then 3 sets of 5 reps',
        notes: 'Keep two reps in reserve.',
      },
      {
        id: rowTemplateExerciseId,
        workoutTemplateId: fullBodyTemplateId,
        exerciseId: EXERCISE_IDS.barbellRow,
        position: 1,
        goal: '3 sets of 10 reps',
        notes: null,
      },
    ])
    .onConflictDoNothing()
    .run();

  database
    .insert(workoutTemplateSets)
    .values([
      {
        id: sampleId(userId, 'template-set-bench-warmup'),
        workoutTemplateExerciseId: benchTemplateExerciseId,
        position: 0,
        setType: 'WARMUP',
      },
      ...[0, 1, 2].map(position => ({
        id: sampleId(userId, `template-set-bench-normal-${position}`),
        workoutTemplateExerciseId: benchTemplateExerciseId,
        position: position + 1,
        setType: 'NORMAL' as const,
      })),
      ...[0, 1, 2].map(position => ({
        id: sampleId(userId, `template-set-overhead-${position}`),
        workoutTemplateExerciseId: overheadTemplateExerciseId,
        position,
        setType: 'NORMAL' as const,
      })),
      {
        id: sampleId(userId, 'template-set-squat-warmup'),
        workoutTemplateExerciseId: squatTemplateExerciseId,
        position: 0,
        setType: 'WARMUP',
      },
      ...[0, 1, 2].map(position => ({
        id: sampleId(userId, `template-set-squat-normal-${position}`),
        workoutTemplateExerciseId: squatTemplateExerciseId,
        position: position + 1,
        setType: 'NORMAL' as const,
      })),
      ...[0, 1].map(position => ({
        id: sampleId(userId, `template-set-row-normal-${position}`),
        workoutTemplateExerciseId: rowTemplateExerciseId,
        position,
        setType: 'NORMAL' as const,
      })),
      {
        id: sampleId(userId, 'template-set-row-backoff'),
        workoutTemplateExerciseId: rowTemplateExerciseId,
        position: 2,
        setType: 'BACKOFF',
      },
    ])
    .onConflictDoNothing()
    .run();

  database
    .delete(workoutSessions)
    .where(eq(workoutSessions.id, activeSessionId))
    .run();

  database
    .insert(workoutSessions)
    .values({
      id: completedSessionId,
      userId,
      workoutTemplateId: pushTemplateId,
      name: 'Push Strength',
      startedAt: now - 3 * 24 * 60 * 60 * 1000,
      endedAt: now - 3 * 24 * 60 * 60 * 1000 + 62 * 60 * 1000,
      notes: 'Bench moved well. Add 2.5 kg next time.',
    })
    .onConflictDoNothing()
    .run();

  database
    .insert(performedSets)
    .values([
      {
        id: sampleId(userId, 'performed-bench-warmup'),
        workoutSessionId: completedSessionId,
        exerciseId: EXERCISE_IDS.benchPress,
        exercisePosition: 0,
        setPosition: 0,
        setType: 'WARMUP',
        reps: 10,
        weight: 40,
        rpe: 4,
        performedAt: now - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000,
      },
      ...[
        { reps: 8, weight: 80, rpe: 7.5 },
        { reps: 8, weight: 80, rpe: 8 },
        { reps: 7, weight: 80, rpe: 8.5 },
      ].map((set, position) => ({
        id: sampleId(userId, `performed-bench-normal-${position}`),
        workoutSessionId: completedSessionId,
        exerciseId: EXERCISE_IDS.benchPress,
        exercisePosition: 0,
        setPosition: position + 1,
        setType: 'NORMAL' as const,
        ...set,
        performedAt:
          now - 3 * 24 * 60 * 60 * 1000 + (15 + position * 5) * 60 * 1000,
      })),
      ...[
        { reps: 10, weight: 42.5, rpe: 7 },
        { reps: 9, weight: 42.5, rpe: 8 },
        { reps: 8, weight: 42.5, rpe: 8.5 },
      ].map((set, position) => ({
        id: sampleId(userId, `performed-overhead-${position}`),
        workoutSessionId: completedSessionId,
        exerciseId: EXERCISE_IDS.overheadPress,
        exercisePosition: 1,
        setPosition: position,
        setType: 'NORMAL' as const,
        ...set,
        performedAt:
          now - 3 * 24 * 60 * 60 * 1000 + (40 + position * 5) * 60 * 1000,
      })),
    ])
    .onConflictDoNothing()
    .run();
}
