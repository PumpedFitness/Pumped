import {
  previewShareImport,
  type ShareImportPreview,
} from '@/data/local/share/importShare';
import type {
  SharedExercise,
  SharedPerformedSet,
  SharePayload,
} from '@/lib/share/shareTypes';
import type { ShareErrorKind } from '@/lib/share/handoverClient';

export type PreviewExerciseRow = {
  key: string;
  name: string | null;
  setCount: number;
};

export function exerciseNameMap(
  exercises: readonly SharedExercise[],
): Map<string, string> {
  return new Map(exercises.map(exercise => [exercise.id, exercise.name]));
}

/** Groups performed sets into exercise placements, in performed order. */
export function workoutExerciseRows(
  sets: readonly SharedPerformedSet[],
  names: Map<string, string>,
): PreviewExerciseRow[] {
  const rows = new Map<string, PreviewExerciseRow & { position: number }>();
  for (const set of sets) {
    const key = `${set.exercisePosition}:${set.exerciseId}`;
    const row = rows.get(key) ?? {
      key,
      name: names.get(set.exerciseId) ?? null,
      setCount: 0,
      position: set.exercisePosition,
    };
    row.setCount += 1;
    rows.set(key, row);
  }
  return [...rows.values()]
    .sort((a, b) => a.position - b.position)
    .map(({ key, name, setCount }) => ({ key, name, setCount }));
}

/**
 * The import preview, or `null` when the payload can't be previewed (an
 * achievement, or the importer rejected it). The screen then just omits the
 * summary instead of failing — the import itself reports real errors.
 */
export function safePreview(payload: SharePayload): ShareImportPreview | null {
  if (payload.kind === 'achievement') return null;
  try {
    return previewShareImport(payload);
  } catch {
    return null;
  }
}

type ErrorCopyKey =
  | 'expired'
  | 'offline'
  | 'unsupportedVersion'
  | 'invalid'
  | 'server';

export function errorCopyKey(kind: ShareErrorKind): ErrorCopyKey {
  switch (kind) {
    case 'expired':
    case 'offline':
    case 'unsupportedVersion':
    case 'server':
      return kind;
    case 'tooLarge':
      return 'server';
    case 'notPumped':
    case 'malformed':
      return 'invalid';
  }
}
