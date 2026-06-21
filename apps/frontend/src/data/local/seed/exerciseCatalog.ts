import type { InferInsertModel } from 'drizzle-orm';
import {
  BODY_HIGHLIGHTER_MUSCLE_GROUPS,
  type MuscleGroupBodyPartKey,
} from '@/components/body';
import type { db } from '@/data/local/database';
import { exercises, exerciseTypes, muscleGroups } from '@/data/local/schema';
import { EXERCISE_IDS, EXERCISE_TYPE_IDS, MUSCLE_GROUP_IDS } from './ids';

type LocalDatabase = typeof db;
type ExerciseInsert = InferInsertModel<typeof exercises>;

const EXERCISE_TYPES = [
  { id: EXERCISE_TYPE_IDS.machine, name: 'Machine' },
  { id: EXERCISE_TYPE_IDS.band, name: 'Band' },
  { id: EXERCISE_TYPE_IDS.bodyweight, name: 'Bodyweight' },
];

const MUSCLE_GROUPS = BODY_HIGHLIGHTER_MUSCLE_GROUPS.map(group => ({
  id: group.id,
  name: group.name,
}));

const EXERCISES: Omit<ExerciseInsert, 'createdAt'>[] = [
  exercise('benchPress', 'Barbell Bench Press', 'Flat barbell press.', [
    'chest',
    'shoulders',
    'triceps',
  ]),
  exercise('overheadPress', 'Overhead Press', 'Standing barbell press.', [
    'shoulders',
    'triceps',
  ]),
  exercise(
    'inclineDumbbellPress',
    'Incline Dumbbell Press',
    'Dumbbell press on an incline bench.',
    ['chest', 'shoulders', 'triceps'],
  ),
  exercise(
    'lateralRaise',
    'Dumbbell Lateral Raise',
    'Shoulder isolation raise.',
    ['shoulders'],
  ),
  exercise(
    'tricepsPushdown',
    'Cable Triceps Pushdown',
    'Cable elbow extension.',
    ['triceps'],
    EXERCISE_TYPE_IDS.machine,
  ),
  exercise('barbellRow', 'Barbell Row', 'Bent-over barbell pull.', [
    'back',
    'biceps',
  ]),
  exercise(
    'deadlift',
    'Conventional Deadlift',
    'Barbell pull from the floor.',
    ['back', 'glutes', 'hamstrings', 'forearms', 'traps'],
  ),
  exercise(
    'latPulldown',
    'Lat Pulldown',
    'Vertical cable pull to the upper chest.',
    ['back', 'biceps'],
    EXERCISE_TYPE_IDS.machine,
  ),
  exercise(
    'pullUp',
    'Pull-Up',
    'Bodyweight vertical pull.',
    ['back', 'biceps'],
    EXERCISE_TYPE_IDS.bodyweight,
  ),
  exercise('dumbbellCurl', 'Dumbbell Curl', 'Alternating elbow flexion.', [
    'biceps',
    'forearms',
  ]),
  exercise('backSquat', 'Barbell Back Squat', 'Barbell squat.', [
    'quads',
    'glutes',
    'hamstrings',
  ]),
  exercise(
    'romanianDeadlift',
    'Romanian Deadlift',
    'Hip hinge with a controlled eccentric.',
    ['hamstrings', 'glutes', 'back'],
  ),
  exercise(
    'legPress',
    'Leg Press',
    'Machine-based compound leg press.',
    ['quads', 'glutes'],
    EXERCISE_TYPE_IDS.machine,
  ),
  exercise(
    'calfRaise',
    'Standing Calf Raise',
    'Standing plantar flexion.',
    ['calves'],
    EXERCISE_TYPE_IDS.machine,
  ),
  exercise(
    'plank',
    'Plank',
    'Isometric trunk hold.',
    ['abs'],
    EXERCISE_TYPE_IDS.bodyweight,
  ),
];

function exercise(
  id: keyof typeof EXERCISE_IDS,
  name: string,
  description: string,
  groups: MuscleGroupBodyPartKey[],
  typeId: string | null = null,
): Omit<ExerciseInsert, 'createdAt'> {
  return {
    id: EXERCISE_IDS[id],
    name,
    description,
    typeId,
    muscleGroups: groups.map(group => MUSCLE_GROUP_IDS[group]),
  };
}

export function seedExerciseCatalog(
  database: LocalDatabase,
  now: number,
): void {
  database
    .insert(exerciseTypes)
    .values(EXERCISE_TYPES.map(type => ({ ...type, createdAt: now })))
    .onConflictDoNothing()
    .run();
  database
    .insert(muscleGroups)
    .values(MUSCLE_GROUPS.map(group => ({ ...group, createdAt: now })))
    .onConflictDoNothing()
    .run();
  database
    .insert(exercises)
    .values(EXERCISES.map(item => ({ ...item, createdAt: now })))
    .onConflictDoNothing()
    .run();
}
