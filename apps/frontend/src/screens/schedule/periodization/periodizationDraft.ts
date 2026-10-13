import { randomUUID } from 'expo-crypto';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type {
  PeriodizationDraft,
  PeriodizationPhase,
  PeriodizationWorkout,
} from '@/types/periodization';
import type { WorkoutTemplate } from '@/types/workout';

export type { PeriodizationDraft, PeriodizationPhase, PeriodizationWorkout };

export function newPhase(position: number): PeriodizationPhase {
  return {
    id: randomUUID(),
    name: `Phase ${position + 1}`,
    workouts: [],
  };
}

export function newPeriodization(): PeriodizationDraft {
  return {
    id: randomUUID(),
    name: '',
    phases: [newPhase(0)],
  };
}

export function nextWorkoutDate(
  phase: PeriodizationPhase,
): Pick<PeriodizationWorkout, 'week' | 'weekday'> {
  const previous = phase.workouts.at(-1);
  if (!previous) {
    return { week: 1, weekday: 1 };
  }
  return previous.weekday === 7
    ? { week: previous.week + 1, weekday: 1 }
    : { week: previous.week, weekday: previous.weekday + 1 };
}

export function newPeriodizationWorkout(
  phase: PeriodizationPhase,
  source?: WorkoutTemplate,
): PeriodizationWorkout {
  const now = Date.now();
  return {
    id: randomUUID(),
    sourceTemplateId: source?.id ?? null,
    template: source
      ? { ...source, id: randomUUID(), createdAt: now, updatedAt: now }
      : {
          id: randomUUID(),
          userId: 'local',
          name: '',
          description: null,
          color: 'TERRACOTTA',
          icon: null,
          picture: null,
          exercises: [],
          supersets: [],
          createdAt: now,
          updatedAt: now,
        },
    ...nextWorkoutDate(phase),
  };
}

export function templateFromInput(
  current: WorkoutTemplate,
  input: SaveWorkoutTemplateInput,
): WorkoutTemplate {
  return {
    ...current,
    name: input.name.trim(),
    description: input.description ?? null,
    color: input.color ?? 'TERRACOTTA',
    icon: input.icon ?? null,
    picture: input.picture ?? null,
    updatedAt: Date.now(),
    supersets: input.supersets ?? [],
    exercises: input.exercises.map((exercise, position) => ({
      id: randomUUID(),
      exerciseId: exercise.exerciseId,
      position,
      typeId: exercise.typeId ?? null,
      color: exercise.color ?? null,
      supersetId: exercise.supersetId ?? null,
      goal: exercise.goal ?? null,
      notes: exercise.notes ?? null,
      sets: exercise.sets.map((set, setPosition) => ({
        id: randomUUID(),
        position: setPosition,
        setType: set.setType,
        // Rest duration comes from the set type when this workout is started;
        // it is not part of a planned workout prescription.
        restSeconds: null,
        progressionGoal: set.progressionGoal,
        fieldValues: set.fieldValues ?? [],
      })),
    })),
  };
}

export function plannedWeeks(phase: PeriodizationPhase): number {
  return phase.workouts.reduce(
    (latest, workout) => Math.max(latest, workout.week),
    0,
  );
}
