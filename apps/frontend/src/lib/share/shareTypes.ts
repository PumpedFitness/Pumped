// The wire format for sharing between devices through the handover service.
//
// A share is a self-contained JSON envelope: everything the receiver needs to
// recreate the item travels with it (the exercises and custom set types a
// template uses, for example), because the receiver's library may not have
// them. Ids in the payload are the *sender's* ids — the importer matches them
// against the local library and re-mints whatever it has to create.
//
// Device-local data never travels: picture URIs point into the sender's file
// system and are dropped on export.

import type {
  SetFieldDataType,
  SetFieldUnit,
  SetTypeId,
  WorkoutTemplateColor,
} from '@/data/local/enums';
import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { ProgressionGoal, SetTypeFieldConfig } from '@/types/setType';
import type { HistoricalSetField, SetFieldValue } from '@/types/workout';
import type { ExercisePrKind } from '@/hooks/useExerciseAnalytics';

/** Bump when the payload shape changes incompatibly. */
export const SHARE_FORMAT_VERSION = 1;

export const SHARE_APP_ID = 'pumped';

export type SharedExercise = {
  id: string;
  name: string;
  description: string | null;
  howTo: string | null;
  /** Exercise type (machine, band, …) — id plus name so the importer can match
   *  by name when the id is unknown locally. */
  typeId: string | null;
  typeName: string | null;
  muscleGroupIds: string[];
};

export type SharedSetTypeField = {
  id: string;
  name: string;
  dataType: SetFieldDataType;
  unit: SetFieldUnit | null;
  position: number;
  config: SetTypeFieldConfig;
};

export type SharedSetType = {
  id: string;
  name: string;
  icon: string | null;
  /** Built-ins exist on every device under the same id; only their id matters. */
  isBuiltIn: boolean;
  progressionGoal: ProgressionGoal;
  fields: SharedSetTypeField[];
};

export type SharedTemplateSet = {
  setType: SetTypeId;
  restSeconds: number | null;
  progressionGoal: ProgressionGoal | null;
  fieldValues: SetFieldValue[];
};

export type SharedTemplateExercise = {
  exerciseId: string;
  typeId: string | null;
  color: WorkoutTemplateColor | null;
  /** Key into `SharedTemplate.supersets`. */
  supersetId: string | null;
  goal: string | null;
  notes: string | null;
  sets: SharedTemplateSet[];
};

export type SharedSuperset = {
  id: string;
  restSeconds: number | null;
  transitionRestSeconds: number | null;
};

export type SharedTemplate = {
  name: string;
  description: string | null;
  color: WorkoutTemplateColor;
  icon: IconName | null;
  exercises: SharedTemplateExercise[];
  supersets: SharedSuperset[];
};

export type SharedPerformedSet = {
  exerciseId: string;
  exercisePosition: number;
  setPosition: number;
  supersetId: string | null;
  setType: SetTypeId;
  restSeconds: number | null;
  fieldValues: SetFieldValue[];
  fieldDefinitions: HistoricalSetField[];
  performedAt: number | null;
};

/** A finished session. Received as a read-only summary; it can be saved as a
 *  template, never into the receiver's own history. */
export type SharedWorkout = {
  name: string;
  startedAt: number;
  endedAt: number | null;
  color: WorkoutTemplateColor | null;
  icon: IconName | null;
  notes: string | null;
  sets: SharedPerformedSet[];
};

/** A personal record. View-only on the receiving side. */
export type SharedAchievement = {
  kind: ExercisePrKind;
  exerciseName: string;
  value: number;
  weightKg: number | null;
  reps: number;
  achievedAt: number;
  workoutName: string;
};

export type SharePayload =
  | {
      kind: 'template';
      template: SharedTemplate;
      exercises: SharedExercise[];
      setTypes: SharedSetType[];
    }
  | {
      kind: 'workout';
      workout: SharedWorkout;
      exercises: SharedExercise[];
      setTypes: SharedSetType[];
    }
  | { kind: 'setType'; setType: SharedSetType }
  | { kind: 'exercise'; exercise: SharedExercise }
  | { kind: 'achievement'; achievement: SharedAchievement };

export type ShareKind = SharePayload['kind'];

export type ShareEnvelope = {
  app: typeof SHARE_APP_ID;
  v: typeof SHARE_FORMAT_VERSION;
  /** Epoch ms. */
  sharedAt: number;
  payload: SharePayload;
};

export function createShareEnvelope(payload: SharePayload): ShareEnvelope {
  return {
    app: SHARE_APP_ID,
    v: SHARE_FORMAT_VERSION,
    sharedAt: Date.now(),
    payload,
  };
}

export type ShareParseError = 'notPumped' | 'unsupportedVersion' | 'malformed';

export type ShareParseResult =
  | { ok: true; envelope: ShareEnvelope }
  | { ok: false; error: ShareParseError };

const KINDS: readonly ShareKind[] = [
  'template',
  'workout',
  'setType',
  'exercise',
  'achievement',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasArrays(
  record: Record<string, unknown>,
  ...keys: string[]
): boolean {
  return keys.every(key => Array.isArray(record[key]));
}

function hasNamed(
  value: unknown,
  key: string,
): value is Record<string, unknown> {
  return isRecord(value) && typeof value[key] === 'string';
}

/** Outer-shape check per kind. */
const PAYLOAD_CHECKS: Record<
  ShareKind,
  (value: Record<string, unknown>) => boolean
> = {
  template: value =>
    hasNamed(value.template, 'name') &&
    hasArrays(value.template, 'exercises', 'supersets') &&
    hasArrays(value, 'exercises', 'setTypes'),
  workout: value =>
    hasNamed(value.workout, 'name') &&
    hasArrays(value.workout, 'sets') &&
    hasArrays(value, 'exercises', 'setTypes'),
  setType: value =>
    hasNamed(value.setType, 'name') && hasArrays(value.setType, 'fields'),
  exercise: value => hasNamed(value.exercise, 'name'),
  achievement: value => hasNamed(value.achievement, 'exerciseName'),
};

/** Structural check of the payload's outer shape. Field-level validation
 *  happens in the importer, which fails loudly on anything it cannot map. */
function isPayload(value: unknown): value is SharePayload {
  return (
    isRecord(value) &&
    KINDS.includes(value.kind as ShareKind) &&
    PAYLOAD_CHECKS[value.kind as ShareKind](value)
  );
}

/** Parses the raw handover value (a JSON string) into an envelope. */
export function parseShareEnvelope(raw: string): ShareParseResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'malformed' };
  }
  if (!isRecord(value) || value.app !== SHARE_APP_ID) {
    return { ok: false, error: 'notPumped' };
  }
  if (value.v !== SHARE_FORMAT_VERSION) {
    return { ok: false, error: 'unsupportedVersion' };
  }
  if (typeof value.sharedAt !== 'number' || !isPayload(value.payload)) {
    return { ok: false, error: 'malformed' };
  }
  return { ok: true, envelope: value as ShareEnvelope };
}
