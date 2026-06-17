import { randomUUID } from 'expo-crypto';
import { and, asc, desc, eq, isNull, type InferSelectModel } from 'drizzle-orm';
import { i18n } from '@/i18n';
import type { WorkoutSetType } from '@/data/local/enums';
import { db } from '@/data/local/database';
import {
  exercises,
  importBatches,
  performedSets,
  workoutTemplateExercises,
  workoutSessions,
} from '@/data/local/schema';
import { notifyTableChanged } from '@/data/local/tableVersions';
import { LOCAL_USER_ID } from '@/data/local/workouts/validation';
import { getCsvValue, parseCsv, type CsvRow } from './csvParser';

export type CsvImportResult = {
  importId: number;
  workoutsImported: number;
  setsImported: number;
  exercisesCreated: number;
  rowsSkipped: number;
};

export type ImportBatch = InferSelectModel<typeof importBatches>;

export type CsvImportSource = 'hevy';

export type AliasSet = {
  workoutName: string[];
  startedAt: string[];
  endedAt: string[];
  exerciseName: string[];
  setPosition: string[];
  setType: string[];
  reps: string[];
  weight: string[];
  rpe: string[];
  workoutNotes: string[];
};

export type CsvImportAdapter = {
  source: CsvImportSource;
  aliases: AliasSet;
};

type ImportedSetDraft = {
  workoutName: string;
  workoutStartedAt: number;
  workoutEndedAt?: number;
  workoutNotes?: string;
  exerciseName: string;
  setPosition?: number;
  setType: WorkoutSetType;
  reps: number;
  weight?: number | null;
  rpe?: number | null;
  sourceRowIndex: number;
};

type ImportSessionDraft = {
  key: string;
  name: string;
  startedAt: number;
  endedAt: number;
  notes: string | null;
  sets: ImportedSetDraft[];
};

type Tx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0];

export const CSV_IMPORT_ADAPTERS: Record<CsvImportSource, CsvImportAdapter> = {
  hevy: {
    source: 'hevy',
    aliases: {
      workoutName: ['title'],
      startedAt: ['start_time'],
      endedAt: ['end_time'],
      exerciseName: ['exercise_title'],
      setPosition: ['set_index'],
      setType: ['set_type'],
      reps: ['reps'],
      weight: ['weight_kg'],
      rpe: ['rpe'],
      workoutNotes: ['description'],
    },
  },
};

const MONTH_INDEX_BY_NAME: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parseHevyDate(value: string): number | null {
  const match = value
    .trim()
    .match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4}), (\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue, hourValue, minuteValue] = match;
  const month = MONTH_INDEX_BY_NAME[monthValue.toLowerCase()];
  if (month === undefined) {
    return null;
  }

  const timestamp = new Date(
    Number(yearValue),
    month,
    Number(dayValue),
    Number(hourValue),
    Number(minuteValue),
  ).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function parseTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    if (numeric > 100_000_000_000) {
      return numeric;
    }
    if (numeric > 1_000_000_000) {
      return numeric * 1000;
    }
  }

  const hevyDate = parseHevyDate(trimmed);
  if (hevyDate !== null) {
    return hevyDate;
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeSetType(value: string): WorkoutSetType {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('warm')) return 'WARMUP';
  if (normalized.includes('back')) return 'BACKOFF';
  if (normalized.includes('drop')) return 'DROP';
  if (normalized.includes('amrap') || normalized.includes('failure')) {
    return 'AMRAP';
  }
  return 'NORMAL';
}

function parseImportedSet(
  row: CsvRow,
  adapter: CsvImportAdapter,
  sourceRowIndex: number,
): ImportedSetDraft | null {
  const { aliases } = adapter;
  const exerciseName = getCsvValue(row, aliases.exerciseName).trim();
  const workoutStartedAt = parseTimestamp(getCsvValue(row, aliases.startedAt));
  const reps = parseNumber(getCsvValue(row, aliases.reps));

  if (!exerciseName || workoutStartedAt === null || reps === null || reps < 0) {
    return null;
  }

  return {
    workoutName:
      getCsvValue(row, aliases.workoutName).trim() ||
      i18n.t('csvImport.defaults.workoutName'),
    workoutStartedAt,
    workoutEndedAt:
      parseTimestamp(getCsvValue(row, aliases.endedAt)) ?? undefined,
    workoutNotes: getCsvValue(row, aliases.workoutNotes).trim() || undefined,
    exerciseName,
    setPosition:
      parseNumber(getCsvValue(row, aliases.setPosition)) ?? undefined,
    setType: normalizeSetType(getCsvValue(row, aliases.setType)),
    reps: Math.round(reps),
    weight: parseNumber(getCsvValue(row, aliases.weight)),
    rpe: parseNumber(getCsvValue(row, aliases.rpe)),
    sourceRowIndex,
  };
}

function groupImportedSets(sets: ImportedSetDraft[]): ImportSessionDraft[] {
  const sessions = new Map<string, ImportSessionDraft>();

  for (const set of sets) {
    const key = `${set.workoutName}:${set.workoutStartedAt}:${
      set.workoutEndedAt ?? ''
    }`;
    const existing = sessions.get(key);
    const endedAt = set.workoutEndedAt ?? set.workoutStartedAt;

    if (existing) {
      existing.endedAt = Math.max(existing.endedAt, endedAt);
      existing.sets.push(set);
      continue;
    }

    sessions.set(key, {
      key,
      name: set.workoutName,
      startedAt: set.workoutStartedAt,
      endedAt,
      notes: set.workoutNotes ?? null,
      sets: [set],
    });
  }

  return [...sessions.values()].map(session => ({
    ...session,
    sets: [...session.sets].sort((a, b) => a.sourceRowIndex - b.sourceRowIndex),
  }));
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getExerciseIdsByName(): Map<string, string> {
  const rows = db.select().from(exercises).orderBy(asc(exercises.name)).all();
  return new Map(rows.map(row => [normalizeName(row.name), row.id]));
}

function buildExerciseImportPlan(names: string[], now: number) {
  const idsByName = getExerciseIdsByName();
  const inserts = [...new Set(names.map(normalizeName))]
    .filter(name => name && !idsByName.has(name))
    .map(name => {
      const displayName =
        names.find(candidate => normalizeName(candidate) === name) ?? name;
      const id = randomUUID();
      idsByName.set(name, id);
      return {
        id,
        name: displayName,
        description: null,
        typeId: null,
        picture: null,
        muscleGroups: [],
        createdAt: now,
      };
    });

  return { idsByName, inserts };
}

function writeImportedSessions(
  tx: Tx,
  sessions: ImportSessionDraft[],
  idsByName: Map<string, string>,
  importId: number,
): number {
  let setCount = 0;

  for (const session of sessions) {
    const sessionId = randomUUID();
    tx.insert(workoutSessions)
      .values({
        id: sessionId,
        userId: LOCAL_USER_ID,
        workoutTemplateId: null,
        name: session.name,
        startedAt: session.startedAt,
        endedAt: Math.max(session.endedAt, session.startedAt),
        notes: session.notes,
        importId,
      })
      .run();

    const exercisePositions = new Map<string, number>();
    const setPositions = new Map<string, number>();
    const rows = session.sets.flatMap(set => {
      const exerciseKey = normalizeName(set.exerciseName);
      const exerciseId = idsByName.get(exerciseKey);
      if (!exerciseId) {
        return [];
      }

      if (!exercisePositions.has(exerciseKey)) {
        exercisePositions.set(exerciseKey, exercisePositions.size);
      }

      const positionKey = `${session.key}:${exerciseKey}`;
      const fallbackPosition = setPositions.get(positionKey) ?? 0;
      setPositions.set(positionKey, fallbackPosition + 1);
      setCount += 1;

      return {
        id: randomUUID(),
        workoutSessionId: sessionId,
        exerciseId,
        exercisePosition: exercisePositions.get(exerciseKey)!,
        setPosition:
          set.setPosition !== undefined
            ? Math.max(0, Math.round(set.setPosition))
            : fallbackPosition,
        setType: set.setType,
        reps: set.reps,
        weight: set.weight ?? null,
        rpe: set.rpe ?? null,
        performedAt: null,
        importId,
      };
    });

    if (rows.length > 0) {
      tx.insert(performedSets).values(rows).run();
    }
  }

  return setCount;
}

export function importCSV(
  csv: string,
  adapter: CsvImportAdapter,
): CsvImportResult {
  const parsed = parseCsv(csv);
  const importedSets = parsed.rows
    .map((row, index) => parseImportedSet(row, adapter, index))
    .filter((set): set is ImportedSetDraft => set !== null);

  if (parsed.rows.length === 0 || importedSets.length === 0) {
    throw new Error(i18n.t('csvImport.errors.noImportableRows'));
  }

  const sessions = groupImportedSets(importedSets);
  const now = Date.now();
  const rowsSkipped = parsed.rows.length - importedSets.length;
  const { idsByName, inserts } = buildExerciseImportPlan(
    importedSets.map(set => set.exerciseName),
    now,
  );
  const transactionResult = db.transaction(tx => {
    const batch = tx
      .insert(importBatches)
      .values({
        source: adapter.source,
        importedAt: now,
        workoutsImported: sessions.length,
        setsImported: importedSets.length,
        exercisesCreated: inserts.length,
        rowsSkipped,
      })
      .returning({ id: importBatches.id })
      .get();

    if (inserts.length > 0) {
      tx.insert(exercises)
        .values(inserts.map(exercise => ({ ...exercise, importId: batch.id })))
        .run();
    }
    const setsImported = writeImportedSessions(
      tx,
      sessions,
      idsByName,
      batch.id,
    );

    return { importId: batch.id, setsImported };
  });

  notifyTableChanged(exercises, importBatches, workoutSessions, performedSets);

  return {
    importId: transactionResult.importId,
    workoutsImported: sessions.length,
    setsImported: transactionResult.setsImported,
    exercisesCreated: inserts.length,
    rowsSkipped,
  };
}

export function listImportBatches(): ImportBatch[] {
  return db
    .select()
    .from(importBatches)
    .orderBy(desc(importBatches.importedAt))
    .all();
}

export function revertImport(importId: number): void {
  db.transaction(tx => {
    const untouchedImportedExerciseIds = tx
      .select({ id: exercises.id })
      .from(exercises)
      .where(
        and(eq(exercises.importId, importId), isNull(exercises.importEditedAt)),
      )
      .all();

    tx.delete(performedSets).where(eq(performedSets.importId, importId)).run();
    tx.delete(workoutSessions)
      .where(eq(workoutSessions.importId, importId))
      .run();

    for (const exercise of untouchedImportedExerciseIds) {
      const usedBySets = tx
        .select({ id: performedSets.id })
        .from(performedSets)
        .where(eq(performedSets.exerciseId, exercise.id))
        .limit(1)
        .get();
      const usedByTemplates = tx
        .select({ id: workoutTemplateExercises.id })
        .from(workoutTemplateExercises)
        .where(eq(workoutTemplateExercises.exerciseId, exercise.id))
        .limit(1)
        .get();

      if (!usedBySets && !usedByTemplates) {
        tx.delete(exercises).where(eq(exercises.id, exercise.id)).run();
      }
    }

    tx.delete(importBatches).where(eq(importBatches.id, importId)).run();
  });

  notifyTableChanged(exercises, importBatches, workoutSessions, performedSets);
}
