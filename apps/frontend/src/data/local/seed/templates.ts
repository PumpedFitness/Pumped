import type { InferInsertModel } from 'drizzle-orm';
import type { WorkoutSetType } from '@/data/local/enums';
import type { db } from '@/data/local/database';
import {
  workoutTemplateExercises,
  workoutTemplateScheduleWeekdays,
  workoutTemplateSets,
  workoutTemplates,
} from '@/data/local/schema';
import { EXERCISE_IDS, LOCAL_USER_ID, sampleId, TEMPLATE_IDS } from './ids';

type LocalDatabase = typeof db;
type TemplateInsert = InferInsertModel<typeof workoutTemplates>;
type TemplateExerciseInsert = InferInsertModel<typeof workoutTemplateExercises>;
type TemplateSetInsert = InferInsertModel<typeof workoutTemplateSets>;

type SetSpec = {
  type?: WorkoutSetType;
  reps: number;
  rpe?: number;
  percentage?: number;
};

type ExerciseSpec = {
  key: string;
  exerciseId: string;
  goal: string;
  notes?: string;
  sets: SetSpec[];
};

type TemplateSpec = Omit<
  TemplateInsert,
  'createdAt' | 'updatedAt' | 'userId'
> & {
  weekdays?: InferInsertModel<
    typeof workoutTemplateScheduleWeekdays
  >['weekday'][];
  exercises: ExerciseSpec[];
};

const normalSets = (count: number, reps: number, rpe = 8): SetSpec[] =>
  Array.from({ length: count }, () => ({ reps, rpe }));

const TEMPLATES: TemplateSpec[] = [
  {
    id: TEMPLATE_IDS.push,
    name: 'Push Strength',
    description: 'Bench and overhead press strength session.',
    status: 'ACTIVE',
    color: 'TERRACOTTA',
    scheduleType: 'WEEKS',
    scheduleInterval: 1,
    weekdays: ['MONDAY', 'THURSDAY'],
    exercises: [
      templateExercise('bench', EXERCISE_IDS.benchPress, '3 x 6-8 at RPE 8', [
        { type: 'WARMUP', reps: 10, percentage: 50 },
        ...normalSets(3, 8),
      ]),
      templateExercise(
        'overhead',
        EXERCISE_IDS.overheadPress,
        '3 x 8 controlled reps',
        normalSets(3, 8),
      ),
      templateExercise(
        'triceps',
        EXERCISE_IDS.tricepsPushdown,
        'Finish with 2 x 12-15',
        [...normalSets(2, 12), { type: 'DROP', reps: 15, rpe: 9 }],
      ),
    ],
  },
  {
    id: TEMPLATE_IDS.fullBody,
    name: 'Full Body Rotation',
    description: 'Simple squat, row, and trunk session every three days.',
    status: 'ACTIVE',
    color: 'SAGE',
    scheduleType: 'DAYS',
    scheduleInterval: 3,
    exercises: [
      templateExercise(
        'squat',
        EXERCISE_IDS.backSquat,
        '3 x 5 with clean reps',
        [{ type: 'WARMUP', reps: 8, percentage: 50 }, ...normalSets(3, 5)],
      ),
      templateExercise('row', EXERCISE_IDS.barbellRow, '3 x 10 with a pause', [
        ...normalSets(2, 10),
        { type: 'BACKOFF', reps: 12, rpe: 8 },
      ]),
      templateExercise(
        'plank',
        EXERCISE_IDS.plank,
        'Three quality holds',
        normalSets(3, 45, 7),
        'Record hold duration in the reps field.',
      ),
    ],
  },
  {
    id: TEMPLATE_IDS.pull,
    name: 'Pull Hypertrophy',
    description: 'Deadlift technique followed by back and biceps volume.',
    status: 'ACTIVE',
    color: 'MOSS',
    scheduleType: 'WEEKS',
    scheduleInterval: 1,
    weekdays: ['TUESDAY'],
    exercises: [
      templateExercise('deadlift', EXERCISE_IDS.deadlift, '3 x 5 at RPE 7-8', [
        { type: 'WARMUP', reps: 5, percentage: 55 },
        ...normalSets(3, 5, 7.5),
      ]),
      templateExercise(
        'pulldown',
        EXERCISE_IDS.latPulldown,
        '3 x 10-12',
        normalSets(3, 12),
      ),
      templateExercise('curl', EXERCISE_IDS.dumbbellCurl, '2 x 12 plus AMRAP', [
        ...normalSets(2, 12),
        { type: 'AMRAP', reps: 12, rpe: 9 },
      ]),
    ],
  },
  {
    id: TEMPLATE_IDS.lower,
    name: 'Lower Body Builder',
    description: 'Squat, hinge, leg press, and calves.',
    status: 'ACTIVE',
    color: 'HONEY',
    scheduleType: 'WEEKS',
    scheduleInterval: 1,
    weekdays: ['FRIDAY'],
    exercises: [
      templateExercise(
        'lower-squat',
        EXERCISE_IDS.backSquat,
        '3 x 5 at RPE 8',
        normalSets(3, 5),
      ),
      templateExercise(
        'rdl',
        EXERCISE_IDS.romanianDeadlift,
        '3 x 8',
        normalSets(3, 8),
      ),
      templateExercise(
        'leg-press',
        EXERCISE_IDS.legPress,
        '3 x 10',
        normalSets(3, 10),
      ),
      templateExercise(
        'calves',
        EXERCISE_IDS.calfRaise,
        '3 x 15',
        normalSets(3, 15),
      ),
    ],
  },
  {
    id: TEMPLATE_IDS.upperExpress,
    name: 'Upper Express',
    description: 'A short upper-body session for busy days.',
    status: 'INACTIVE',
    color: 'ROSE',
    scheduleType: null,
    scheduleInterval: null,
    exercises: [
      templateExercise(
        'incline',
        EXERCISE_IDS.inclineDumbbellPress,
        '3 x 10',
        normalSets(3, 10),
      ),
      templateExercise(
        'pull-up',
        EXERCISE_IDS.pullUp,
        '3 sets, stop one rep before failure',
        normalSets(3, 8),
      ),
      templateExercise(
        'laterals',
        EXERCISE_IDS.lateralRaise,
        '2 x 15',
        normalSets(2, 15),
      ),
    ],
  },
];

function templateExercise(
  key: string,
  exerciseId: string,
  goal: string,
  sets: SetSpec[],
  notes?: string,
): ExerciseSpec {
  return { key, exerciseId, goal, notes, sets };
}

function buildTemplateRows(now: number): TemplateInsert[] {
  return TEMPLATES.map(
    ({ weekdays: _weekdays, exercises: _exercises, ...row }) => ({
      ...row,
      userId: LOCAL_USER_ID,
      createdAt: now,
      updatedAt: now,
    }),
  );
}

function buildExerciseRows(): TemplateExerciseInsert[] {
  return TEMPLATES.flatMap(template =>
    template.exercises.map((exercise, position) => ({
      id: sampleId(`template-exercise-${exercise.key}`),
      workoutTemplateId: template.id,
      exerciseId: exercise.exerciseId,
      position,
      goal: exercise.goal,
      notes: exercise.notes ?? null,
    })),
  );
}

function buildSetRows(): TemplateSetInsert[] {
  return TEMPLATES.flatMap(template =>
    template.exercises.flatMap(exercise =>
      exercise.sets.map((set, position) => ({
        id: templateSetId(exercise.key, position, set.type ?? 'NORMAL'),
        workoutTemplateExerciseId: sampleId(
          `template-exercise-${exercise.key}`,
        ),
        position,
        setType: set.type ?? 'NORMAL',
        targetReps: set.reps,
        targetPercentage1Rm: set.percentage ?? null,
        targetRpe: set.rpe ?? null,
      })),
    ),
  );
}

function templateSetId(
  exerciseKey: string,
  position: number,
  setType: WorkoutSetType,
): string {
  if (exerciseKey === 'bench') {
    return sampleId(
      position === 0
        ? 'template-set-bench-warmup'
        : `template-set-bench-normal-${position - 1}`,
    );
  }
  if (exerciseKey === 'squat') {
    return sampleId(
      position === 0
        ? 'template-set-squat-warmup'
        : `template-set-squat-normal-${position - 1}`,
    );
  }
  if (exerciseKey === 'row') {
    return sampleId(
      setType === 'BACKOFF'
        ? 'template-set-row-backoff'
        : `template-set-row-normal-${position}`,
    );
  }
  return sampleId(`template-set-${exerciseKey}-${position}`);
}

export function seedWorkoutTemplates(
  database: LocalDatabase,
  now: number,
): void {
  database
    .insert(workoutTemplates)
    .values(buildTemplateRows(now))
    .onConflictDoNothing()
    .run();
  database
    .insert(workoutTemplateScheduleWeekdays)
    .values(
      TEMPLATES.flatMap(template =>
        (template.weekdays ?? []).map(weekday => ({
          workoutTemplateId: template.id,
          weekday,
        })),
      ),
    )
    .onConflictDoNothing()
    .run();
  database
    .insert(workoutTemplateExercises)
    .values(buildExerciseRows())
    .onConflictDoNothing()
    .run();
  database
    .insert(workoutTemplateSets)
    .values(buildSetRows())
    .onConflictDoNothing()
    .run();
}
