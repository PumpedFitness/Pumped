import { randomUUID } from 'expo-crypto';
import { asc, desc, eq } from 'drizzle-orm';
import type {
  WorkoutScheduleType,
  WorkoutSetType,
  WorkoutTemplateColor,
  WorkoutTemplateStatus,
  WorkoutWeekday,
} from '../enums';
import type {
  PerformedSet,
  WorkoutSession,
  WorkoutSessionDetails,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
} from '../../../types/workout';
import { db } from '../database';
import {
  performedSets,
  workoutSessions,
  workoutTemplateExercises,
  workoutTemplateScheduleWeekdays,
  workoutTemplateSets,
  workoutTemplates,
} from '../schema';

type LocalDatabase = typeof db;

const LOCAL_USER_ID = 'local';

export type WorkoutTemplateSetInput = {
  setType: WorkoutSetType;
  targetReps?: number | null;
  targetPercentage1Rm?: number | null;
  targetRpe?: number | null;
};

export type WorkoutTemplateExerciseInput = {
  exerciseId: string;
  goal?: string | null;
  notes?: string | null;
  sets: WorkoutTemplateSetInput[];
};

export type WorkoutTemplateScheduleInput = {
  type: WorkoutScheduleType;
  interval: number;
  weekdays?: WorkoutWeekday[];
};

export type SaveWorkoutTemplateInput = {
  id?: string;
  name: string;
  description?: string | null;
  status?: WorkoutTemplateStatus;
  color?: WorkoutTemplateColor;
  schedule?: WorkoutTemplateScheduleInput | null;
  exercises: WorkoutTemplateExerciseInput[];
};

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

function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} must not be blank`);
  }
  return normalized;
}

function validateSchedule(
  schedule: WorkoutTemplateScheduleInput | null | undefined,
): WorkoutTemplateScheduleInput | null {
  if (!schedule) {
    return null;
  }
  if (!Number.isInteger(schedule.interval) || schedule.interval < 1) {
    throw new Error('Schedule interval must be a positive integer');
  }

  const weekdays = [...new Set(schedule.weekdays ?? [])];
  if (schedule.type === 'DAYS' && weekdays.length > 0) {
    throw new Error('Day schedules cannot define weekdays');
  }
  if (schedule.type === 'WEEKS' && weekdays.length === 0) {
    throw new Error('Week schedules require at least one weekday');
  }

  return { ...schedule, weekdays };
}

function validateTemplateSet(
  set: WorkoutTemplateSetInput,
): WorkoutTemplateSetInput {
  if (
    set.targetReps !== null &&
    set.targetReps !== undefined &&
    (!Number.isInteger(set.targetReps) || set.targetReps < 1)
  ) {
    throw new Error('Target reps must be a positive whole number');
  }
  if (
    set.targetPercentage1Rm !== null &&
    set.targetPercentage1Rm !== undefined &&
    (!Number.isFinite(set.targetPercentage1Rm) ||
      set.targetPercentage1Rm <= 0 ||
      set.targetPercentage1Rm > 100)
  ) {
    throw new Error('Percentage of 1RM must be between 0 and 100');
  }
  if (
    set.targetRpe !== null &&
    set.targetRpe !== undefined &&
    (!Number.isFinite(set.targetRpe) || set.targetRpe < 1 || set.targetRpe > 10)
  ) {
    throw new Error('Target RPE must be between 1 and 10');
  }

  return set;
}

export function createWorkoutService(database: LocalDatabase) {
  function assertTemplateExists(templateId: string): void {
    const template = database
      .select({ id: workoutTemplates.id })
      .from(workoutTemplates)
      .where(eq(workoutTemplates.id, templateId))
      .get();

    if (!template) {
      throw new Error('Workout template not found');
    }
  }

  function assertSessionExists(sessionId: string): void {
    const session = database
      .select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .get();

    if (!session) {
      throw new Error('Workout session not found');
    }
  }

  function getWorkoutTemplate(templateId: string): WorkoutTemplate | null {
    const template = database
      .select()
      .from(workoutTemplates)
      .where(eq(workoutTemplates.id, templateId))
      .get();

    if (!template) {
      return null;
    }

    const exerciseRows = database
      .select()
      .from(workoutTemplateExercises)
      .where(eq(workoutTemplateExercises.workoutTemplateId, template.id))
      .orderBy(asc(workoutTemplateExercises.position))
      .all();

    const exercises: WorkoutTemplateExercise[] = exerciseRows.map(exercise => {
      const sets: WorkoutTemplateSet[] = database
        .select()
        .from(workoutTemplateSets)
        .where(eq(workoutTemplateSets.workoutTemplateExerciseId, exercise.id))
        .orderBy(asc(workoutTemplateSets.position))
        .all();

      return {
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        position: exercise.position,
        goal: exercise.goal,
        notes: exercise.notes,
        sets,
      };
    });

    const weekdays = template.scheduleType
      ? database
          .select({ weekday: workoutTemplateScheduleWeekdays.weekday })
          .from(workoutTemplateScheduleWeekdays)
          .where(
            eq(workoutTemplateScheduleWeekdays.workoutTemplateId, template.id),
          )
          .orderBy(asc(workoutTemplateScheduleWeekdays.weekday))
          .all()
          .map(row => row.weekday)
      : [];

    return {
      id: template.id,
      userId: template.userId,
      name: template.name,
      description: template.description,
      status: template.status,
      color: template.color,
      schedule:
        template.scheduleType && template.scheduleInterval
          ? {
              type: template.scheduleType,
              interval: template.scheduleInterval,
              weekdays,
            }
          : null,
      exercises,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  function listWorkoutTemplates(): WorkoutTemplate[] {
    return database
      .select({ id: workoutTemplates.id })
      .from(workoutTemplates)
      .orderBy(asc(workoutTemplates.name))
      .all()
      .map(row => getWorkoutTemplate(row.id))
      .filter((template): template is WorkoutTemplate => template !== null);
  }

  function saveWorkoutTemplate(
    input: SaveWorkoutTemplateInput,
  ): WorkoutTemplate {
    const templateId = input.id ?? randomUUID();
    const now = Date.now();
    const name = requireText(input.name, 'Template name');
    const schedule = validateSchedule(input.schedule);
    const validatedExercises = input.exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(validateTemplateSet),
    }));

    database.transaction(tx => {
      const existing = tx
        .select()
        .from(workoutTemplates)
        .where(eq(workoutTemplates.id, templateId))
        .get();

      if (existing) {
        tx.update(workoutTemplates)
          .set({
            name,
            description: input.description ?? null,
            status: input.status ?? existing.status,
            color: input.color ?? existing.color,
            scheduleType: schedule?.type ?? null,
            scheduleInterval: schedule?.interval ?? null,
            updatedAt: now,
          })
          .where(eq(workoutTemplates.id, templateId))
          .run();
      } else {
        tx.insert(workoutTemplates)
          .values({
            id: templateId,
            userId: LOCAL_USER_ID,
            name,
            description: input.description ?? null,
            status: input.status ?? 'ACTIVE',
            color: input.color ?? 'TERRACOTTA',
            scheduleType: schedule?.type ?? null,
            scheduleInterval: schedule?.interval ?? null,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }

      tx.delete(workoutTemplateScheduleWeekdays)
        .where(
          eq(workoutTemplateScheduleWeekdays.workoutTemplateId, templateId),
        )
        .run();
      tx.delete(workoutTemplateExercises)
        .where(eq(workoutTemplateExercises.workoutTemplateId, templateId))
        .run();

      if (schedule?.type === 'WEEKS') {
        tx.insert(workoutTemplateScheduleWeekdays)
          .values(
            (schedule.weekdays ?? []).map(weekday => ({
              workoutTemplateId: templateId,
              weekday,
            })),
          )
          .run();
      }

      validatedExercises.forEach((exercise, exercisePosition) => {
        const exerciseRowId = randomUUID();
        tx.insert(workoutTemplateExercises)
          .values({
            id: exerciseRowId,
            workoutTemplateId: templateId,
            exerciseId: exercise.exerciseId,
            position: exercisePosition,
            goal: exercise.goal ?? null,
            notes: exercise.notes ?? null,
          })
          .run();

        if (exercise.sets.length > 0) {
          tx.insert(workoutTemplateSets)
            .values(
              exercise.sets.map((set, setPosition) => ({
                id: randomUUID(),
                workoutTemplateExerciseId: exerciseRowId,
                position: setPosition,
                setType: set.setType,
                targetReps: set.targetReps ?? null,
                targetPercentage1Rm: set.targetPercentage1Rm ?? null,
                targetRpe: set.targetRpe ?? null,
              })),
            )
            .run();
        }
      });
    });

    return getWorkoutTemplate(templateId)!;
  }

  function updateWorkoutTemplateStatus(
    templateId: string,
    status: WorkoutTemplateStatus,
  ): WorkoutTemplate {
    assertTemplateExists(templateId);
    database
      .update(workoutTemplates)
      .set({ status, updatedAt: Date.now() })
      .where(eq(workoutTemplates.id, templateId))
      .run();

    return getWorkoutTemplate(templateId)!;
  }

  function deleteWorkoutTemplate(templateId: string): void {
    assertTemplateExists(templateId);
    database
      .delete(workoutTemplates)
      .where(eq(workoutTemplates.id, templateId))
      .run();
  }

  function getWorkoutSession(sessionId: string): WorkoutSessionDetails | null {
    const session = database
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .get();

    if (!session) {
      return null;
    }

    const sets: PerformedSet[] = database
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

  function listWorkoutSessions(): WorkoutSession[] {
    return database
      .select()
      .from(workoutSessions)
      .orderBy(desc(workoutSessions.startedAt))
      .all();
  }

  function saveCompletedWorkout(
    input: SaveCompletedWorkoutInput,
  ): WorkoutSessionDetails {
    const sessionId = input.id ?? randomUUID();
    const name = requireText(input.name, 'Workout name');

    if (input.endedAt < input.startedAt) {
      throw new Error('Workout end time cannot be before its start time');
    }

    if (input.workoutTemplateId) {
      assertTemplateExists(input.workoutTemplateId);
    }

    database.transaction(tx => {
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

    return getWorkoutSession(sessionId)!;
  }

  function deleteWorkoutSession(sessionId: string): void {
    assertSessionExists(sessionId);
    database
      .delete(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .run();
  }

  return {
    listWorkoutTemplates,
    getWorkoutTemplate,
    saveWorkoutTemplate,
    updateWorkoutTemplateStatus,
    deleteWorkoutTemplate,
    listWorkoutSessions,
    getWorkoutSession,
    saveCompletedWorkout,
    deleteWorkoutSession,
  };
}

export const workoutService = createWorkoutService(db);
