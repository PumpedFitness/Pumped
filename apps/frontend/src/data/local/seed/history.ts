import type { InferInsertModel } from 'drizzle-orm';
import type { WorkoutSetType } from '@/data/local/enums';
import type { performedSets, workoutSessions } from '@/data/local/schema';
import { buildBuiltInFieldValues } from '@/data/local/builtins';
import { EXERCISE_IDS, LOCAL_USER_ID, sampleId, TEMPLATE_IDS } from './ids';

type SessionInsert = InferInsertModel<typeof workoutSessions>;
type PerformedSetInsert = InferInsertModel<typeof performedSets>;

type WorkoutKind = 'push' | 'pull' | 'lower' | 'fullBody' | 'upperExpress';

type HistorySpec = {
  daysAgo: number;
  kind: WorkoutKind;
  hour?: number;
  note?: string;
};

type SetGroup = {
  exerciseId: string;
  sets: {
    reps: number;
    weight?: number;
    rpe?: number;
    type?: WorkoutSetType;
  }[];
};

const HISTORY: HistorySpec[] = [
  { daysAgo: 92, kind: 'fullBody', note: 'First session back. Kept it easy.' },
  { daysAgo: 88, kind: 'push' },
  { daysAgo: 84, kind: 'pull' },
  { daysAgo: 79, kind: 'lower' },
  { daysAgo: 74, kind: 'push' },
  { daysAgo: 69, kind: 'pull' },
  { daysAgo: 64, kind: 'fullBody' },
  { daysAgo: 58, kind: 'lower', note: 'Squats felt crisp today.' },
  { daysAgo: 53, kind: 'push' },
  { daysAgo: 48, kind: 'pull' },
  { daysAgo: 43, kind: 'upperExpress', hour: 7 },
  { daysAgo: 38, kind: 'lower' },
  { daysAgo: 33, kind: 'push', note: 'Bench volume PR.' },
  { daysAgo: 28, kind: 'pull' },
  { daysAgo: 24, kind: 'fullBody' },
  { daysAgo: 20, kind: 'lower' },
  { daysAgo: 17, kind: 'push' },
  { daysAgo: 14, kind: 'pull', note: 'Deadlifts moved fast.' },
  { daysAgo: 11, kind: 'upperExpress', hour: 7 },
  { daysAgo: 9, kind: 'lower' },
  { daysAgo: 7, kind: 'push' },
  { daysAgo: 5, kind: 'pull' },
  { daysAgo: 3, kind: 'fullBody' },
  { daysAgo: 1, kind: 'lower', note: 'Add 2.5 kg to squats next time.' },
];

const WORKOUT_DETAILS: Record<
  WorkoutKind,
  { name: string; templateId: string; duration: number }
> = {
  push: { name: 'Push Strength', templateId: TEMPLATE_IDS.push, duration: 64 },
  pull: {
    name: 'Pull Hypertrophy',
    templateId: TEMPLATE_IDS.pull,
    duration: 68,
  },
  lower: {
    name: 'Lower Body Builder',
    templateId: TEMPLATE_IDS.lower,
    duration: 72,
  },
  fullBody: {
    name: 'Full Body Rotation',
    templateId: TEMPLATE_IDS.fullBody,
    duration: 57,
  },
  upperExpress: {
    name: 'Upper Express',
    templateId: TEMPLATE_IDS.upperExpress,
    duration: 38,
  },
};

function progression(index: number, step: number): number {
  return Math.floor(index / 4) * step;
}


function buildGroups(kind: WorkoutKind, index: number): SetGroup[] {
  const gain = progression(index, 2.5);
  const builders: Record<WorkoutKind, () => SetGroup[]> = {
    push: () => [
      group(EXERCISE_IDS.benchPress, [
        set(10, 40, 4, 'WARMUP'),
        set(8, 70 + gain, 7.5),
        set(8, 70 + gain, 8),
        set(7, 70 + gain, 8.5),
      ]),
      group(EXERCISE_IDS.overheadPress, repeatedSets(3, 8, 35 + gain / 2)),
      group(EXERCISE_IDS.tricepsPushdown, [
        ...repeatedSets(2, 12, 25 + gain / 2),
        set(15, 17.5 + gain / 2, 9, 'MAX_EFFORT'),
      ]),
    ],
    pull: () => [
      group(EXERCISE_IDS.deadlift, [
        set(5, 60, 4, 'WARMUP'),
        ...repeatedSets(3, 5, 100 + progression(index, 5), 7.5),
      ]),
      group(EXERCISE_IDS.latPulldown, repeatedSets(3, 12, 45 + gain)),
      group(EXERCISE_IDS.dumbbellCurl, [
        ...repeatedSets(2, 12, 12 + progression(index, 1)),
        set(14, 10 + progression(index, 1), 9, 'MAX_EFFORT'),
      ]),
    ],
    lower: () => [
      group(EXERCISE_IDS.backSquat, [
        set(8, 40, 4, 'WARMUP'),
        ...repeatedSets(3, 5, 75 + gain, 8),
      ]),
      group(EXERCISE_IDS.romanianDeadlift, repeatedSets(3, 8, 65 + gain, 8)),
      group(EXERCISE_IDS.legPress, repeatedSets(3, 10, 120 + gain * 2)),
      group(EXERCISE_IDS.calfRaise, repeatedSets(3, 15, 50 + gain)),
    ],
    fullBody: () => [
      group(EXERCISE_IDS.backSquat, repeatedSets(3, 6, 65 + gain, 7.5)),
      group(EXERCISE_IDS.barbellRow, [
        ...repeatedSets(2, 10, 50 + gain),
        set(12, 42.5 + gain, 8, 'NORMAL'),
      ]),
      group(EXERCISE_IDS.plank, [
        set(40, undefined, 7),
        set(45, undefined, 7.5),
        set(45, undefined, 8),
      ]),
    ],
    upperExpress: () => [
      group(
        EXERCISE_IDS.inclineDumbbellPress,
        repeatedSets(3, 10, 24 + progression(index, 1)),
      ),
      group(EXERCISE_IDS.pullUp, [
        set(8, undefined, 7.5),
        set(8, undefined, 8),
        set(7, undefined, 8.5),
      ]),
      group(
        EXERCISE_IDS.lateralRaise,
        repeatedSets(2, 15, 8 + progression(index, 1)),
      ),
    ],
  };

  return builders[kind]();
}

function group(exerciseId: string, sets: SetGroup['sets']): SetGroup {
  return { exerciseId, sets };
}

function set(
  reps: number,
  weight?: number,
  rpe?: number,
  type: WorkoutSetType = 'NORMAL',
): SetGroup['sets'][number] {
  return { reps, weight, rpe, type };
}

function repeatedSets(
  count: number,
  reps: number,
  weight: number,
  rpe = 8,
): SetGroup['sets'] {
  return Array.from({ length: count }, () => set(reps, weight, rpe));
}

function workoutStart(now: number, daysAgo: number, hour = 18): number {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

function buildSession(spec: HistorySpec, index: number, now: number) {
  const details = WORKOUT_DETAILS[spec.kind];
  const id = sampleId(`session-${spec.daysAgo}-${spec.kind}`);
  const startedAt = workoutStart(now, spec.daysAgo, spec.hour);
  const session: SessionInsert = {
    id,
    userId: LOCAL_USER_ID,
    workoutTemplateId: details.templateId,
    name: details.name,
    startedAt,
    endedAt: startedAt + details.duration * 60_000,
    notes: spec.note ?? null,
  };
  let setIndex = 0;
  const sets = buildGroups(spec.kind, index).flatMap(
    (setGroup, exercisePosition) =>
      setGroup.sets.map((performedSet, setPosition) => {
        setIndex += 1;
        const setType = performedSet.type ?? 'NORMAL';
        return {
          id: sampleId(`performed-${spec.daysAgo}-${spec.kind}-${setIndex}`),
          workoutSessionId: id,
          exerciseId: setGroup.exerciseId,
          exercisePosition,
          setPosition,
          setType,
          restSeconds: null,
          fieldValues: buildBuiltInFieldValues(setType, performedSet),
          performedAt: startedAt + (5 + setIndex * 4) * 60_000,
        } satisfies PerformedSetInsert;
      }),
  );

  return { session, sets };
}

export function buildWorkoutHistory(now: number): {
  sessions: SessionInsert[];
  sets: PerformedSetInsert[];
} {
  const history = HISTORY.map((spec, index) => buildSession(spec, index, now));
  return {
    sessions: history.map(item => item.session),
    sets: history.flatMap(item => item.sets),
  };
}
