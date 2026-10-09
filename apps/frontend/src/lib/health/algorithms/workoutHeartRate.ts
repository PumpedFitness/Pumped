import type { TimedValue } from './downsample';

/** Auflösung, in der ein Workout gespeichert wird — fein genug für Einzelsätze. */
export const WORKOUT_BUCKET_SECONDS = 5;

/** Vor dem Start und nach dem Ende mitgeholt: Anstieg und letzte Erholung. */
export const WORKOUT_LEAD_SECONDS = 60;
export const WORKOUT_TAIL_SECONDS = 180;

/**
 * Geschätzte Dauer eines Arbeitssatzes.
 *
 * Gespeichert wird nur, wann ein Satz abgehakt wurde — also sein Ende. Der
 * Beginn ist eine Schätzung; ein Satz mit acht bis zwölf Wiederholungen liegt
 * um die vierzig Sekunden.
 */
export const SET_WORK_SECONDS = 40;

/**
 * Wie lange nach dem Abhaken der Puls noch steigen darf.
 *
 * Die Herzfrequenz läuft der Last hinterher; der Spitzenwert eines Satzes liegt
 * oft erst zehn bis zwanzig Sekunden nach der letzten Wiederholung.
 */
export const PEAK_LAG_SECONDS = 20;

/** Erholung = Abfall vom Satzende bis eine Minute später. */
export const RECOVERY_SECONDS = 60;
const RECOVERY_TOLERANCE_SECONDS = 10;

/**
 * Ab welchem typischen Abstand die Reihe nur noch für das Ganze taugt.
 *
 * Ohne aufgezeichnetes Training messen viele Uhren nur alle paar Minuten. Ein
 * Satz von vierzig Sekunden fällt dann zwischen zwei Messungen; Werte je Satz
 * wären geraten.
 */
export const DETAILED_MAX_GAP_SECONDS = 20;

export type WorkoutHeartRateSet = {
  readonly id: string;
  /** Gruppiert Sätze zu einer Übung, wie die Detailansicht es tut. */
  readonly exerciseKey: string;
  /** Epoch-Millisekunden, `null` bei importierten Sätzen. */
  readonly performedAt: number | null;
};

export type WorkoutHeartRateInput = {
  /** Epoch-Millisekunden. */
  readonly startedAt: number;
  readonly endedAt: number;
  readonly sets: readonly WorkoutHeartRateSet[];
  /** Unix-Sekunden, aufsteigend. */
  readonly curve: readonly TimedValue[];
};

export type SetHeartRate = {
  readonly setId: string;
  readonly exerciseKey: string;
  /** Unix-Sekunden; der Beginn ist geschätzt. */
  readonly startTs: number;
  readonly endTs: number;
  readonly peak: number | null;
  /** bpm Abfall in der Minute nach dem Satz; `null` bei zu kurzer Pause. */
  readonly recovery: number | null;
};

export type ExerciseHeartRate = {
  readonly exerciseKey: string;
  readonly average: number | null;
  readonly peak: number | null;
  readonly recovery: number | null;
};

export type WorkoutHeartRateResolution = 'none' | 'sparse' | 'detailed';

export type WorkoutHeartRate = {
  readonly resolution: WorkoutHeartRateResolution;
  /** Unix-Sekunden — das Fenster, das das Diagramm zeigt. */
  readonly startTs: number;
  readonly endTs: number;
  readonly curve: readonly TimedValue[];
  readonly average: number | null;
  readonly peak: TimedValue | null;
  readonly low: TimedValue | null;
  /** Leer, solange `resolution` nicht `detailed` ist. */
  readonly sets: readonly SetHeartRate[];
  readonly exercises: readonly ExerciseHeartRate[];
};

export function workoutHeartRateWindow(
  startedAt: number,
  endedAt: number,
): { from: number; to: number } {
  return {
    from: Math.floor(startedAt / 1000) - WORKOUT_LEAD_SECONDS,
    to: Math.ceil(endedAt / 1000) + WORKOUT_TAIL_SECONDS,
  };
}

function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function within(
  curve: readonly TimedValue[],
  from: number,
  to: number,
): TimedValue[] {
  return curve.filter(point => point.ts >= from && point.ts <= to);
}

function extreme(
  curve: readonly TimedValue[],
  pick: (a: number, b: number) => boolean,
): TimedValue | null {
  let best: TimedValue | null = null;
  for (const point of curve) {
    if (best === null || pick(point.value, best.value)) best = point;
  }
  return best;
}

function nearest(
  curve: readonly TimedValue[],
  ts: number,
  tolerance: number,
): TimedValue | null {
  let best: TimedValue | null = null;
  for (const point of curve) {
    const distance = Math.abs(point.ts - ts);
    if (distance > tolerance) continue;
    if (best === null || distance < Math.abs(best.ts - ts)) best = point;
  }
  return best;
}

/** Median der Abstände — einzelne Lücken (Uhr kurz verrutscht) zählen nicht. */
export function typicalGapSeconds(curve: readonly TimedValue[]): number | null {
  if (curve.length < 2) return null;
  const gaps = curve
    .slice(1)
    .map((point, index) => point.ts - curve[index].ts)
    .sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

/**
 * Ordnet die Herzfrequenz eines Workouts den Sätzen und Übungen zu.
 *
 * Ein Satz endet beim Abhaken und beginnt geschätzt `SET_WORK_SECONDS` davor,
 * nie aber vor dem Ende des vorigen Satzes. Sein Spitzenwert wird bis
 * `PEAK_LAG_SECONDS` nach dem Ende gesucht, weil der Puls nachläuft. Die
 * Erholung zählt nur, wenn die Pause bis zum nächsten Satz die volle Minute
 * dauert — sonst misst sie den nächsten Satz mit.
 */
export function analyseWorkoutHeartRate(
  input: WorkoutHeartRateInput,
): WorkoutHeartRate {
  const { from, to } = workoutHeartRateWindow(input.startedAt, input.endedAt);
  const curve = within(input.curve, from, to);
  const sessionStart = Math.floor(input.startedAt / 1000);
  const sessionEnd = Math.ceil(input.endedAt / 1000);
  const session = within(curve, sessionStart, sessionEnd);

  const gap = typicalGapSeconds(curve);
  const resolution: WorkoutHeartRateResolution =
    session.length === 0
      ? 'none'
      : gap !== null && gap <= DETAILED_MAX_GAP_SECONDS
      ? 'detailed'
      : 'sparse';

  const base = {
    resolution,
    startTs: from,
    endTs: to,
    curve,
    average: mean(session.map(point => point.value)),
    peak: extreme(session, (a, b) => a > b),
    low: extreme(session, (a, b) => a < b),
  };

  if (resolution !== 'detailed') {
    return { ...base, sets: [], exercises: [] };
  }

  const timed = input.sets
    .filter(
      (set): set is WorkoutHeartRateSet & { performedAt: number } =>
        set.performedAt !== null,
    )
    .map(set => ({ ...set, endTs: Math.round(set.performedAt / 1000) }))
    .sort((a, b) => a.endTs - b.endTs);

  const windows = timed.map((set, index) => {
    const previousEnd = index === 0 ? sessionStart : timed[index - 1].endTs;
    return {
      ...set,
      startTs: Math.max(previousEnd, set.endTs - SET_WORK_SECONDS),
    };
  });

  const sets: SetHeartRate[] = windows.map((set, index) => {
    const next = windows[index + 1];
    const peakUntil = Math.min(
      set.endTs + PEAK_LAG_SECONDS,
      next === undefined ? to : next.startTs,
    );
    const peak = extreme(
      within(curve, set.startTs, peakUntil),
      (a, b) => a > b,
    );

    const restUntil = next === undefined ? to : next.startTs;
    const recoveryAt = set.endTs + RECOVERY_SECONDS;
    const after =
      peak !== null && restUntil >= recoveryAt
        ? nearest(curve, recoveryAt, RECOVERY_TOLERANCE_SECONDS)
        : null;

    return {
      setId: set.id,
      exerciseKey: set.exerciseKey,
      startTs: set.startTs,
      endTs: set.endTs,
      peak: peak?.value ?? null,
      recovery:
        peak === null || after === null || after.ts <= peak.ts
          ? null
          : peak.value - after.value,
    };
  });

  const keys = [...new Set(sets.map(set => set.exerciseKey))];
  const exercises: ExerciseHeartRate[] = keys.map(exerciseKey => {
    const own = sets.filter(set => set.exerciseKey === exerciseKey);
    const work = own.flatMap(set =>
      within(curve, set.startTs, set.endTs + PEAK_LAG_SECONDS).map(
        point => point.value,
      ),
    );
    const peaks = own.flatMap(set => (set.peak === null ? [] : [set.peak]));
    const recoveries = own.flatMap(set =>
      set.recovery === null ? [] : [set.recovery],
    );
    return {
      exerciseKey,
      average: mean(work),
      peak: peaks.length === 0 ? null : Math.max(...peaks),
      recovery: mean(recoveries),
    };
  });

  return { ...base, sets, exercises };
}
