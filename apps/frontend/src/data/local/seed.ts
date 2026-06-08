import { like } from 'drizzle-orm';
import type { db } from './database';
import {
  exercises,
  exerciseTypes,
  muscleGroups,
  performedSets,
  workoutSessions,
  workoutTemplateExercises,
  workoutTemplateScheduleWeekdays,
  workoutTemplateSets,
  workoutTemplates,
} from './schema';

type LocalDatabase = typeof db;

const LOCAL_USER_ID = 'local';

const MUSCLE_GROUP_IDS = {
  chest: 'default-mg-chest',
  back: 'default-mg-back',
  shoulders: 'default-mg-shoulders',
  biceps: 'default-mg-biceps',
  triceps: 'default-mg-triceps',
  abs: 'default-mg-abs',
  quads: 'default-mg-quads',
  hamstrings: 'default-mg-hamstrings',
  glutes: 'default-mg-glutes',
  calves: 'default-mg-calves',
  forearms: 'default-mg-forearms',
  traps: 'default-mg-traps',
} as const;

const EXERCISE_TYPE_IDS = {
  machine: 'default-et-machine',
  band: 'default-et-band',
  bodyweight: 'default-et-bodyweight',
} as const;

const EXERCISE_IDS = {
  benchPress: 'sample-exercise-bench-press',
  overheadPress: 'sample-exercise-overhead-press',
  barbellRow: 'sample-exercise-barbell-row',
  backSquat: 'sample-exercise-back-squat',
} as const;

function sampleId(entity: string): string {
  return `sample:${entity}`;
}

export function seedDevelopmentData(database: LocalDatabase): void {
  const now = Date.now();
  const pushTemplateId = sampleId('template-push');
  const fullBodyTemplateId = sampleId('template-full-body');
  const benchTemplateExerciseId = sampleId('template-exercise-bench');
  const overheadTemplateExerciseId = sampleId('template-exercise-overhead');
  const squatTemplateExerciseId = sampleId('template-exercise-squat');
  const rowTemplateExerciseId = sampleId('template-exercise-row');
  const completedSessionId = sampleId('session-completed-push');

  // Seed exercise types
  database
    .insert(exerciseTypes)
    .values([
      { id: EXERCISE_TYPE_IDS.machine, name: 'Machine', createdAt: now },
      { id: EXERCISE_TYPE_IDS.band, name: 'Band', createdAt: now },
      { id: EXERCISE_TYPE_IDS.bodyweight, name: 'Bodyweight', createdAt: now },
    ])
    .onConflictDoNothing()
    .run();

  // Seed muscle groups
  database
    .insert(muscleGroups)
    .values([
      { id: MUSCLE_GROUP_IDS.chest, name: 'Chest', createdAt: now },
      { id: MUSCLE_GROUP_IDS.back, name: 'Back', createdAt: now },
      { id: MUSCLE_GROUP_IDS.shoulders, name: 'Shoulders', createdAt: now },
      { id: MUSCLE_GROUP_IDS.biceps, name: 'Biceps', createdAt: now },
      { id: MUSCLE_GROUP_IDS.triceps, name: 'Triceps', createdAt: now },
      { id: MUSCLE_GROUP_IDS.abs, name: 'Abs', createdAt: now },
      { id: MUSCLE_GROUP_IDS.quads, name: 'Quads', createdAt: now },
      { id: MUSCLE_GROUP_IDS.hamstrings, name: 'Hamstrings', createdAt: now },
      { id: MUSCLE_GROUP_IDS.glutes, name: 'Glutes', createdAt: now },
      { id: MUSCLE_GROUP_IDS.calves, name: 'Calves', createdAt: now },
      { id: MUSCLE_GROUP_IDS.forearms, name: 'Forearms', createdAt: now },
      { id: MUSCLE_GROUP_IDS.traps, name: 'Traps', createdAt: now },
    ])
    .onConflictDoNothing()
    .run();

  // Seed exercises
  database
    .insert(exercises)
    .values([
      {
        id: EXERCISE_IDS.benchPress,
        name: 'Barbell Bench Press',
        description: 'Horizontal barbell press performed on a flat bench.',
        typeId: null,
        muscleGroups: [
          MUSCLE_GROUP_IDS.chest,
          MUSCLE_GROUP_IDS.shoulders,
          MUSCLE_GROUP_IDS.triceps,
        ],
        createdAt: now,
      },
      {
        id: EXERCISE_IDS.overheadPress,
        name: 'Overhead Press',
        description: 'Standing barbell press from shoulder height.',
        typeId: null,
        muscleGroups: [
          MUSCLE_GROUP_IDS.shoulders,
          MUSCLE_GROUP_IDS.triceps,
        ],
        createdAt: now,
      },
      {
        id: EXERCISE_IDS.barbellRow,
        name: 'Barbell Row',
        description: 'Bent-over horizontal pull with a barbell.',
        typeId: null,
        muscleGroups: [
          MUSCLE_GROUP_IDS.back,
          MUSCLE_GROUP_IDS.biceps,
        ],
        createdAt: now,
      },
      {
        id: EXERCISE_IDS.backSquat,
        name: 'Barbell Back Squat',
        description: 'Barbell squat with the bar supported across the back.',
        typeId: null,
        muscleGroups: [
          MUSCLE_GROUP_IDS.quads,
          MUSCLE_GROUP_IDS.glutes,
          MUSCLE_GROUP_IDS.hamstrings,
        ],
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
        userId: LOCAL_USER_ID,
        name: 'Push Strength',
        description: 'Bench and overhead press strength session.',
        scheduleType: 'WEEKS',
        scheduleInterval: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: fullBodyTemplateId,
        userId: LOCAL_USER_ID,
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
        id: sampleId('template-set-bench-warmup'),
        workoutTemplateExerciseId: benchTemplateExerciseId,
        position: 0,
        setType: 'WARMUP',
      },
      ...[0, 1, 2].map(position => ({
        id: sampleId(`template-set-bench-normal-${position}`),
        workoutTemplateExerciseId: benchTemplateExerciseId,
        position: position + 1,
        setType: 'NORMAL' as const,
      })),
      ...[0, 1, 2].map(position => ({
        id: sampleId(`template-set-overhead-${position}`),
        workoutTemplateExerciseId: overheadTemplateExerciseId,
        position,
        setType: 'NORMAL' as const,
      })),
      {
        id: sampleId('template-set-squat-warmup'),
        workoutTemplateExerciseId: squatTemplateExerciseId,
        position: 0,
        setType: 'WARMUP',
      },
      ...[0, 1, 2].map(position => ({
        id: sampleId(`template-set-squat-normal-${position}`),
        workoutTemplateExerciseId: squatTemplateExerciseId,
        position: position + 1,
        setType: 'NORMAL' as const,
      })),
      ...[0, 1].map(position => ({
        id: sampleId(`template-set-row-normal-${position}`),
        workoutTemplateExerciseId: rowTemplateExerciseId,
        position,
        setType: 'NORMAL' as const,
      })),
      {
        id: sampleId('template-set-row-backoff'),
        workoutTemplateExerciseId: rowTemplateExerciseId,
        position: 2,
        setType: 'BACKOFF',
      },
    ])
    .onConflictDoNothing()
    .run();

  database
    .delete(workoutSessions)
    .where(like(workoutSessions.id, 'sample:%session-active-full-body'))
    .run();

  database
    .insert(workoutSessions)
    .values({
      id: completedSessionId,
      userId: LOCAL_USER_ID,
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
        id: sampleId('performed-bench-warmup'),
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
        id: sampleId(`performed-bench-normal-${position}`),
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
        id: sampleId(`performed-overhead-${position}`),
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
