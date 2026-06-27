import type {
  SetFieldUnit,
  SetTypeId,
  WorkoutTemplateColor,
} from '@/data/local/enums';
import type { IconName } from '@/components/icons/ClayIcon';
import type { ProgressionGoal } from '@/types/setType';

/** Min–max span for a `range` field's target (e.g. reps 8–12). */
export type SetFieldRange = {
  min: number | null;
  max: number | null;
};

/** A per-set value keyed by its set type's field id (`set_type_field.id`). The
 *  owning field's `dataType` selects the slot. For a `range` field, templates
 *  populate `range` (the target) and sessions populate `number` (the actual). */
export type SetFieldValue = {
  fieldId: string;
  number?: number | null;
  bool?: boolean | null;
  text?: string | null;
  range?: SetFieldRange | null;
};

export type HistoricalSetField = {
  fieldId: string;
  name: string;
  unit?: SetFieldUnit | null;
};

export type WorkoutTemplateSet = {
  id: string;
  position: number;
  setType: SetTypeId;
  restSeconds: number | null;
  progressionGoal?: ProgressionGoal | null;
  fieldValues: SetFieldValue[];
};

export type WorkoutTemplateExercise = {
  id: string;
  exerciseId: string;
  position: number;
  typeId: string | null;
  /** Per-placement accent color; null inherits the template color. */
  color: WorkoutTemplateColor | null;
  goal: string | null;
  notes: string | null;
  sets: WorkoutTemplateSet[];
};

export type WorkoutTemplate = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: WorkoutTemplateColor;
  /** Optional logo glyph; null when none chosen. */
  icon: IconName | null;
  /** Optional device image URI; null when none chosen. */
  picture: string | null;
  exercises: WorkoutTemplateExercise[];
  createdAt: number;
  updatedAt: number;
};

export type WorkoutSession = {
  id: string;
  userId: string;
  workoutTemplateId: string | null;
  name: string;
  startedAt: number;
  endedAt: number | null;
  notes: string | null;
  /** Visual identity snapshotted from the template at finish time. */
  color: WorkoutTemplateColor | null;
  icon: IconName | null;
  picture: string | null;
  importId: number | null;
};

export type PerformedSet = {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  exercisePosition: number;
  setPosition: number;
  setType: SetTypeId;
  restSeconds: number | null;
  fieldDefinitions: HistoricalSetField[];
  fieldValues: SetFieldValue[];
  performedAt: number | null;
  importId: number | null;
};

export type WorkoutSessionDetails = WorkoutSession & {
  sets: PerformedSet[];
};
