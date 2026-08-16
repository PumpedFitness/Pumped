import type { CivilDate } from '../civilDate';
import type { Annotation } from './annotations';
import { scoreLabel, SCORE_MAX, SCORE_MIN, type ScoreLabel } from './estimator';
import {
  openRange,
  rangeStatus,
  type RangeStatus,
  type TermRange,
} from './range';
import { stageMedian, stageRange } from './sleepAnalysis';
import { SLEEP_NEED_HOURS } from './sleepDebt';
import { stageMinutes, type SleepNight } from './sleep';

/**
 * Die Terme, aus denen sich die Nachtnote zusammensetzt.
 *
 * Bewusst vier und nicht mehr: Wachzeit wäre ein fünfter, ist aber das
 * Gegenstück der Effizienz (`minutesAsleep / minutesInSleepPeriod`) und ginge
 * damit zweimal in dieselbe Zahl ein.
 */
export const SLEEP_SCORE_TERMS = [
  'duration',
  'deep',
  'rem',
  'efficiency',
] as const;

export type SleepScoreTerm = (typeof SLEEP_SCORE_TERMS)[number];

/**
 * Die Dauer trägt doppelt so viel wie jeder andere Term.
 *
 * Eine kurze Nacht mit gutem Phasenverhältnis bleibt eine kurze Nacht. Ohne
 * dieses Übergewicht ergäben vier Stunden mit viel Tiefschlaf eine bessere Note
 * als acht durchschnittliche, was die Empfehlung ins Gegenteil verkehrte.
 */
export const SLEEP_SCORE_WEIGHTS: Record<SleepScoreTerm, number> = {
  duration: 0.4,
  deep: 0.2,
  rem: 0.2,
  efficiency: 0.2,
};

/**
 * Ab hier gilt die Nacht als effizient, darunter fällt der Term auf null.
 *
 * Anders als Dauer und Phasen ist das **keine** persönliche Referenz: Der
 * Anteil Schlaf an der Zeit im Bett ist eine Quote, kein individueller Bedarf,
 * und eine eigene Baseline dafür würde chronisch schlechtes Durchschlafen als
 * „normal für dich" wegdefinieren.
 */
const EFFICIENCY_TARGET = 0.9;
const EFFICIENCY_FLOOR = 0.6;

export type { RangeStatus, TermRange };

export type SleepScoreRow = {
  readonly term: SleepScoreTerm;
  /** 0–100. `null` heißt: keine Referenz, der Term geht nicht ein. */
  readonly score: number | null;
  /** Anteil an der Note **nach** Renormalisierung. 0, wenn ausgeschlossen. */
  readonly weight: number;
  /** Gemessener Wert — Stunden, Minuten oder Anteil, je nach Term. */
  readonly value: number | null;
  /** Woran gemessen wurde: Bedarf, eigener Median oder Zielquote. */
  readonly reference: number | null;
  /** Normalbereich für die Anzeige. `null`, wenn es keine Referenz gibt. */
  readonly range: TermRange | null;
  readonly status: RangeStatus | null;
};

export type SleepScoreResult = {
  readonly score: number | null;
  readonly label: ScoreLabel | null;
  readonly rows: readonly SleepScoreRow[];
};

/**
 * Note für eine einzelne Nacht.
 *
 * Gemischte Bezugsgrößen, und das mit Absicht. Tiefschlaf und REM zählen gegen
 * den **eigenen** Median — wie viel ein Körper davon braucht, ist individuell,
 * und eine Bevölkerungsnorm würde hier nur so tun als ob. Dauer und Effizienz
 * zählen gegen einen **festen** Maßstab: Wer gewohnheitsmäßig fünf Stunden
 * schläft, bekäme gegen die eigene Historie gemessen jede Nacht eine gute Note,
 * und der Score sagte genau dann nichts, wenn er etwas sagen müsste.
 *
 * Terme ohne Referenz fallen heraus und die übrigen Gewichte werden
 * renormalisiert — dieselbe Regel wie beim Readiness-Score. Eine CLASSIC-Nacht
 * ohne Phasendetail wird so aus Dauer und Effizienz benotet, statt mit
 * angenommenen null Minuten Tiefschlaf nach unten gezogen zu werden.
 */
export function sleepScore(
  nights: ReadonlyMap<CivilDate, SleepNight>,
  referenceDate: CivilDate,
  annotations: readonly Annotation[],
): SleepScoreResult {
  const night = nights.get(referenceDate) ?? null;
  if (night === null) return { score: null, label: null, rows: [] };

  const raw = SLEEP_SCORE_TERMS.map(term =>
    evaluate(term, night, nights, referenceDate, annotations),
  );

  const usableWeight = raw
    .filter(row => row.score !== null)
    .reduce((sum, row) => sum + SLEEP_SCORE_WEIGHTS[row.term], 0);

  const rows = raw.map<SleepScoreRow>(row => ({
    ...row,
    weight:
      row.score === null || usableWeight <= 0
        ? 0
        : SLEEP_SCORE_WEIGHTS[row.term] / usableWeight,
  }));

  if (usableWeight <= 0) return { score: null, label: null, rows };

  const value = rows.reduce(
    (sum, row) => sum + row.weight * (row.score ?? 0),
    0,
  );
  // Runden, dann klemmen — dieselbe Reihenfolge wie im Readiness-Score, damit
  // beide Zahlen auf derselben 1–99-Skala liegen und dieselben Bänder tragen.
  const clamped = Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(value)));

  return { score: clamped, label: scoreLabel(clamped), rows };
}

// MARK: - Intern

type RawRow = Omit<SleepScoreRow, 'weight'>;

function evaluate(
  term: SleepScoreTerm,
  night: SleepNight,
  nights: ReadonlyMap<CivilDate, SleepNight>,
  referenceDate: CivilDate,
  annotations: readonly Annotation[],
): RawRow {
  switch (term) {
    case 'duration':
      return withStatus({
        term,
        value: night.hoursAsleep,
        reference: SLEEP_NEED_HOURS,
        score: ratioScore(night.hoursAsleep, SLEEP_NEED_HOURS),
        range: openRange(
          SLEEP_NEED_HOURS,
          0,
          Math.max(SLEEP_NEED_HOURS, night.hoursAsleep) * 1.25,
        ),
      });

    case 'deep':
    case 'rem': {
      // Ohne Phasendetail gibt es nichts zu benoten. `stageMinutes` lieferte
      // hier 0, und 0 hieße „nichts davon gehabt" statt „nicht gemessen".
      if (!night.hasStageDetail) {
        return {
          term,
          value: null,
          reference: null,
          score: null,
          range: null,
          status: null,
        };
      }
      const minutes = stageMinutes(night, term);
      const reference = stageMedian(nights, term, referenceDate, annotations);

      return withStatus({
        term,
        value: minutes,
        reference,
        score: reference === null ? null : ratioScore(minutes, reference),
        range: stageRange(nights, term, referenceDate, minutes, annotations),
      });
    }

    case 'efficiency':
      return withStatus({
        term,
        value: night.efficiency,
        reference: EFFICIENCY_TARGET,
        // Die Skala beginnt bei 60 %: Darunter liegt der Term ohnehin auf null,
        // und eine Achse ab 0 drängte jede reale Nacht ans rechte Ende.
        range: openRange(EFFICIENCY_TARGET, EFFICIENCY_FLOOR, 1),
        score:
          night.efficiency === null
            ? null
            : 100 *
              clamp01(
                (night.efficiency - EFFICIENCY_FLOOR) /
                  (EFFICIENCY_TARGET - EFFICIENCY_FLOOR),
              ),
      });
  }
}

function withStatus(row: Omit<RawRow, 'status'>): RawRow {
  return { ...row, status: rangeStatus(row.value, row.range) };
}

/**
 * Anteil am Soll, bei 100 gedeckelt.
 *
 * Kein Abzug fürs Überschreiten: Dass mehr Schlaf als der Bedarf oder mehr
 * Tiefschlaf als sonst schlechter wäre, geben die Daten nicht her, und eine
 * Strafe dafür wäre eine Behauptung, keine Messung.
 */
function ratioScore(value: number, reference: number): number | null {
  if (reference <= 0) return null;
  return 100 * clamp01(value / reference);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
