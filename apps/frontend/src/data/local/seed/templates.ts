import { eq, type InferInsertModel } from 'drizzle-orm';
import type { WorkoutSetType } from '@/data/local/enums';
import type { ProgressionGoal } from '@/types/setType';
import type { db } from '@/data/local/database';
import {
  buildBuiltInFieldValues,
  builtInSetFieldId,
} from '@/data/local/builtins';
import {
  schedules,
  scheduleSlots,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplateSupersets,
  workoutTemplates,
} from '@/data/local/schema';
import {
  localDayIndex,
  startOfWeek,
  weekdayMon0,
} from '@/data/local/schedules/scheduleResolution';
import { EXERCISE_IDS, LOCAL_USER_ID, sampleId, TEMPLATE_IDS } from './ids';

type LocalDatabase = typeof db;
type TemplateInsert = InferInsertModel<typeof workoutTemplates>;
type TemplateExerciseInsert = InferInsertModel<typeof workoutTemplateExercises>;
type TemplateSetInsert = InferInsertModel<typeof workoutTemplateSets>;
type TemplateSupersetInsert = InferInsertModel<typeof workoutTemplateSupersets>;
type ScheduleInsert = InferInsertModel<typeof schedules>;
type ScheduleSlotInsert = InferInsertModel<typeof scheduleSlots>;

type SetSpec = {
  type?: WorkoutSetType;
  reps: number;
  rpe?: number;
  progressionGoal?: ProgressionGoal | null;
};

type ExerciseSpec = {
  key: string;
  exerciseId: string;
  goal: string;
  notes?: string;
  /** Members sharing a key are supersetted; they must be listed together and
   *  carry the same number of sets — one per round. */
  supersetKey?: string;
  sets: SetSpec[];
};

type SupersetSpec = {
  key: string;
  restSeconds: number | null;
  transitionRestSeconds: number | null;
};

type TemplateSpec = Omit<
  TemplateInsert,
  'createdAt' | 'updatedAt' | 'userId'
> & {
  exercises: ExerciseSpec[];
  supersets?: SupersetSpec[];
};

const normalSets = (count: number, reps: number, rpe = 8): SetSpec[] =>
  Array.from({ length: count }, () => ({ reps, rpe }));

const linearReps = (increment = 1): ProgressionGoal => ({
  kind: 'linear',
  fieldId: builtInSetFieldId('NORMAL', 'reps'),
  increment,
});

const TEMPLATES: TemplateSpec[] = [
  {
    id: TEMPLATE_IDS.push,
    name: 'Push Strength',
    description: 'Bench and overhead press strength session.',
    color: 'TERRACOTTA',
    exercises: [
      templateExercise('bench', EXERCISE_IDS.benchPress, '3 x 6-8 at RPE 8', [
        { type: 'WARMUP', reps: 10 },
        ...normalSets(3, 8).map(set => ({
          ...set,
          progressionGoal: linearReps(),
        })),
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
        [...normalSets(2, 12), { type: 'MAX_EFFORT', reps: 15, rpe: 9 }],
      ),
    ],
  },
  {
    id: TEMPLATE_IDS.fullBody,
    name: 'Full Body Rotation',
    description: 'Simple squat, row, and trunk session every three days.',
    color: 'SAGE',
    exercises: [
      templateExercise(
        'squat',
        EXERCISE_IDS.backSquat,
        '3 x 5 with clean reps',
        [
          { type: 'WARMUP', reps: 8 },
          ...normalSets(3, 5).map((set, index) => ({
            ...set,
            progressionGoal: index === 0 ? linearReps(2) : null,
          })),
        ],
      ),
      templateExercise('row', EXERCISE_IDS.barbellRow, '3 x 10 with a pause', [
        ...normalSets(2, 10),
        { type: 'NORMAL', reps: 12, rpe: 8 },
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
    color: 'MOSS',
    exercises: [
      templateExercise('deadlift', EXERCISE_IDS.deadlift, '3 x 5 at RPE 7-8', [
        { type: 'WARMUP', reps: 5 },
        ...normalSets(3, 5, 7.5),
      ]),
      // Supersetted: three rounds of pulldown straight into curls.
      {
        ...templateExercise(
          'pulldown',
          EXERCISE_IDS.latPulldown,
          '3 x 10-12',
          normalSets(3, 12),
        ),
        supersetKey: 'pull-arms',
      },
      {
        ...templateExercise(
          'curl',
          EXERCISE_IDS.dumbbellCurl,
          '3 x 12 straight after the pulldown',
          normalSets(3, 12),
        ),
        supersetKey: 'pull-arms',
      },
    ],
    supersets: [
      { key: 'pull-arms', restSeconds: 90, transitionRestSeconds: null },
    ],
  },
  {
    id: TEMPLATE_IDS.lower,
    name: 'Lower Body Builder',
    description: 'Squat, hinge, leg press, and calves.',
    color: 'HONEY',
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
    color: 'ROSE',
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

function buildTemplateRows(
  now: number,
  templates: TemplateSpec[],
): TemplateInsert[] {
  return templates.map(({ exercises: _exercises, ...row }) => ({
    ...row,
    userId: LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  }));
}

// A demo two-week rotation, active by default and anchored to the current week
// (week A = this calendar week) so the home widget and Schedule tab show a real
// program — including today's workout — on a fresh install.
const DEMO_SCHEDULE_ID = sampleId('schedule-upper-lower');

function buildScheduleRows(now: number): ScheduleInsert[] {
  return [
    {
      id: DEMO_SCHEDULE_ID,
      userId: LOCAL_USER_ID,
      name: 'Upper / Lower (2-week)',
      recurrenceType: 'WEEKLY',
      periodLength: 2,
      // Week 0 of the rotation = the current local week.
      anchorDay: startOfWeek(localDayIndex(now)),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildScheduleSlotRows(now: number): ScheduleSlotInsert[] {
  const t = TEMPLATE_IDS;
  // dayOffset = weekIndex * 7 + weekday (Mon=0 … Sun=6). Wed/Sat/Sun are rest.
  const slots: { dayOffset: number; workoutTemplateId: string }[] = [
    { dayOffset: 0, workoutTemplateId: t.push }, // Week A · Mon
    { dayOffset: 1, workoutTemplateId: t.pull }, // Week A · Tue
    { dayOffset: 3, workoutTemplateId: t.lower }, // Week A · Thu
    { dayOffset: 4, workoutTemplateId: t.fullBody }, // Week A · Fri
    { dayOffset: 7, workoutTemplateId: t.lower }, // Week B · Mon
    { dayOffset: 8, workoutTemplateId: t.push }, // Week B · Tue
    { dayOffset: 10, workoutTemplateId: t.pull }, // Week B · Thu
    { dayOffset: 11, workoutTemplateId: t.fullBody }, // Week B · Fri
  ];

  // Guarantee a fresh install surfaces a workout today, whatever the weekday.
  const todayOffset = weekdayMon0(localDayIndex(now));
  if (!slots.some(slot => slot.dayOffset === todayOffset)) {
    slots.push({ dayOffset: todayOffset, workoutTemplateId: t.push });
  }

  return slots.map((slot, index) => ({
    id: `${DEMO_SCHEDULE_ID}:slot-${index}`,
    scheduleId: DEMO_SCHEDULE_ID,
    dayOffset: slot.dayOffset,
    position: 0,
    workoutTemplateId: slot.workoutTemplateId,
  }));
}

function supersetId(key: string): string {
  return sampleId(`template-superset-${key}`);
}

function buildSupersetRows(
  templates: TemplateSpec[],
): TemplateSupersetInsert[] {
  return templates.flatMap(template =>
    (template.supersets ?? []).map(superset => ({
      id: supersetId(superset.key),
      workoutTemplateId: template.id,
      restSeconds: superset.restSeconds,
      transitionRestSeconds: superset.transitionRestSeconds,
    })),
  );
}

function buildExerciseRows(
  templates: TemplateSpec[],
): TemplateExerciseInsert[] {
  return templates.flatMap(template =>
    template.exercises.map((exercise, position) => ({
      id: sampleId(`template-exercise-${exercise.key}`),
      workoutTemplateId: template.id,
      exerciseId: exercise.exerciseId,
      position,
      supersetId: exercise.supersetKey
        ? supersetId(exercise.supersetKey)
        : null,
      goal: exercise.goal,
      notes: exercise.notes ?? null,
    })),
  );
}

function buildSetRows(templates: TemplateSpec[]): TemplateSetInsert[] {
  return templates.flatMap(template =>
    template.exercises.flatMap(exercise =>
      exercise.sets.map((set, position) => {
        const setType = set.type ?? 'NORMAL';
        return {
          id: templateSetId(exercise.key, position),
          workoutTemplateExerciseId: sampleId(
            `template-exercise-${exercise.key}`,
          ),
          position,
          setType,
          restSeconds: null,
          progressionGoal: set.progressionGoal ?? null,
          fieldValues: buildBuiltInFieldValues(setType, set),
        };
      }),
    ),
  );
}

function templateSetId(exerciseKey: string, position: number): string {
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
  return sampleId(`template-set-${exerciseKey}-${position}`);
}

export function seedWorkoutTemplates(
  database: LocalDatabase,
  now: number,
): void {
  // Only templates that don't exist yet get their children seeded. Saving a
  // template re-mints every child row id, so `onConflictDoNothing` would no
  // longer match the seeded ids and would insert a second copy of every
  // exercise, set, and superset the next time the app launched.
  const existingIds = new Set(
    database
      .select({ id: workoutTemplates.id })
      .from(workoutTemplates)
      .all()
      .map(row => row.id),
  );
  const freshTemplates = TEMPLATES.filter(
    template => !existingIds.has(template.id),
  );

  if (freshTemplates.length > 0) {
    database
      .insert(workoutTemplates)
      .values(buildTemplateRows(now, freshTemplates))
      .onConflictDoNothing()
      .run();
    // Each child insert is guarded: re-seeding a single deleted template can
    // legitimately produce no supersets (or no exercises), and drizzle rejects
    // an empty `values()`.
    const supersetRows = buildSupersetRows(freshTemplates);
    if (supersetRows.length > 0) {
      database
        .insert(workoutTemplateSupersets)
        .values(supersetRows)
        .onConflictDoNothing()
        .run();
    }
    const exerciseRows = buildExerciseRows(freshTemplates);
    if (exerciseRows.length > 0) {
      database
        .insert(workoutTemplateExercises)
        .values(exerciseRows)
        .onConflictDoNothing()
        .run();
    }
    const setRows = buildSetRows(freshTemplates);
    if (setRows.length > 0) {
      database
        .insert(workoutTemplateSets)
        .values(setRows)
        .onConflictDoNothing()
        .run();
    }
  }

  // Same reasoning as the templates above: saving a schedule re-mints its slot
  // ids, so once the demo schedule exists its slots are the user's to manage —
  // re-seeding them would plant a second copy of every planned day.
  const scheduleExists = database
    .select({ id: schedules.id })
    .from(schedules)
    .where(eq(schedules.id, DEMO_SCHEDULE_ID))
    .get();
  if (!scheduleExists) {
    database.insert(schedules).values(buildScheduleRows(now)).run();
    database.insert(scheduleSlots).values(buildScheduleSlotRows(now)).run();
  }
}
