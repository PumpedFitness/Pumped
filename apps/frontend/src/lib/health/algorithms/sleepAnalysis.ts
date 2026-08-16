import type { CivilDate } from '../civilDate';
import { isAnnotatedAway, type Annotation } from './annotations';
import { median } from './baseline';
import {
  rangeStatus,
  spreadRange,
  type RangeStatus,
  type TermRange,
} from './range';
import {
  SLEEP_STAGES,
  stageMinutes,
  type SleepNight,
  type SleepStage,
} from './sleep';

/** Nächte, über die der Phasenmedian gebildet wird. */
const STAGE_MEDIAN_WINDOW = 30;

/** Unter dieser Zahl von Nächten gibt es keine Referenz. */
const STAGE_MEDIAN_MIN_NIGHTS = 3;

export type StageRow = {
  readonly stage: SleepStage;
  readonly minutes: number;
  /** `null`, solange zu wenige Nächte mit Phasendetail vorliegen. */
  readonly medianMinutes: number | null;
  readonly deltaMinutes: number | null;
  /**
   * Anteil an der Referenz, links verankert. `null` heißt: keine Referenz —
   * eine leere Leiste zu zeichnen behauptete „null Minuten", was etwas anderes
   * ist.
   *
   * Der Median liegt bei der Hälfte der Spur, damit „so wie sonst" in der Mitte
   * landet und Ausschläge in beide Richtungen lesbar sind. Das ist ein Anteil,
   * keine Abweichung — hier gilt **keine** Nullregel.
   */
  readonly proportion: number | null;
  /**
   * Die übliche Spanne dieser Phase. `null`, solange die Historie zu dünn ist
   * oder gar nicht streut.
   *
   * Jede Phase bekommt sie, nicht nur die benoteten: Kernschlaf und Wachzeit
   * gehen in keinen Term der Nachtnote ein, sind aber gemessen, und ohne
   * Referenz daneben ist „344 m" eine Zahl ohne Aussage.
   */
  readonly range: TermRange | null;
  readonly status: RangeStatus | null;
};

export type SleepAnalysis = {
  readonly lastNight: SleepNight | null;
  readonly stageRows: readonly StageRow[];
};

/**
 * Median der Phasendauer über die letzten Nächte vor dem Stichtag.
 *
 * Median statt Mittelwert, damit eine einzelne kurze Nacht die Referenz nicht
 * verschiebt. Nächte **ohne Phasendetail** bleiben außen vor: Sie hätten für
 * Tief-, REM- und Kernschlaf jeweils 0 Minuten und zögen den Median nach unten,
 * obwohl niemand gemessen hat, dass dort nichts war.
 */
export function stageMedian(
  nights: ReadonlyMap<CivilDate, SleepNight>,
  stage: SleepStage,
  referenceDate: CivilDate,
  annotations: readonly Annotation[],
  window: number = STAGE_MEDIAN_WINDOW,
): number | null {
  const values = stageHistory(
    nights,
    stage,
    referenceDate,
    annotations,
    window,
  );
  return values.length < STAGE_MEDIAN_MIN_NIGHTS ? null : median(values);
}

/**
 * Die Phasendauern der Vornächte, jüngste zuerst.
 *
 * Getrennt vom Median, weil eine Spanne mehr braucht als die Mitte: Wer ein
 * Normalband zeichnen will, braucht die Streuung derselben Grundmenge. Zwei
 * Stellen, die sich die Nächte je selbst zusammensuchen, driften auseinander,
 * sobald eine von beiden ihr Fenster ändert.
 *
 * Der Stichtag ist **nicht** enthalten — die Nacht soll ihre eigene Referenz
 * nicht mitbestimmen. Nächte ohne Phasendetail bleiben außen vor: Sie hätten
 * überall 0 Minuten und zögen die Referenz nach unten, obwohl niemand gemessen
 * hat, dass dort nichts war.
 *
 * Markierte Nächte fallen ebenfalls heraus, aus demselben Grund wie in der
 * Baseline des Estimators: Eine Woche Grippe verschiebt Tief- und REM-Schlaf
 * deutlich, und sie in der Referenz zu lassen erklärte die kranke Nacht zum
 * neuen Normal. Anders als dort ist das **kein** Parameter — das Fenster hier
 * ist ebenso fest verdrahtet, und ein Schalter, den niemand setzt, wäre nur
 * eine zweite Rechnung zum Auseinanderlaufen.
 *
 * Gefenstert wird wie dort **vor** dem Filter: Es rücken keine älteren Nächte
 * nach, die Referenz wird schmaler statt länger.
 */
export function stageHistory(
  nights: ReadonlyMap<CivilDate, SleepNight>,
  stage: SleepStage,
  referenceDate: CivilDate,
  annotations: readonly Annotation[],
  window: number = STAGE_MEDIAN_WINDOW,
): number[] {
  return [...nights.entries()]
    .filter(([date, night]) => date < referenceDate && night.hasStageDetail)
    .sort(([a], [b]) => b - a)
    .slice(0, window)
    .filter(([date]) => !isAnnotatedAway(annotations, date))
    .map(([, night]) => stageMinutes(night, stage));
}

export { STAGE_MEDIAN_MIN_NIGHTS };

/**
 * Die übliche Spanne einer Phase, gebildet über dieselbe Grundmenge wie der
 * Median.
 *
 * Eine Stelle für beide Nutzer — die Nachtnote braucht die Spanne für Tief- und
 * REM-Schlaf, die Phasenzeilen für alle vier. Zwei Rechnungen desselben
 * Bereichs drifteten auseinander, sobald eine das Fenster ändert.
 */
export function stageRange(
  nights: ReadonlyMap<CivilDate, SleepNight>,
  stage: SleepStage,
  referenceDate: CivilDate,
  measured: number,
  annotations: readonly Annotation[],
): TermRange | null {
  const history = stageHistory(nights, stage, referenceDate, annotations);
  return history.length < STAGE_MEDIAN_MIN_NIGHTS
    ? null
    : spreadRange(history, measured);
}

export function analyseSleep(
  nights: ReadonlyMap<CivilDate, SleepNight>,
  referenceDate: CivilDate,
  annotations: readonly Annotation[],
): SleepAnalysis {
  const lastNight = nights.get(referenceDate) ?? null;
  if (lastNight === null) return { lastNight: null, stageRows: [] };

  const stageRows = SLEEP_STAGES.map<StageRow>(stage => {
    const minutes = stageMinutes(lastNight, stage);
    const medianMinutes = stageMedian(
      nights,
      stage,
      referenceDate,
      annotations,
    );
    const range = stageRange(
      nights,
      stage,
      referenceDate,
      minutes,
      annotations,
    );
    return {
      stage,
      minutes,
      medianMinutes,
      deltaMinutes: medianMinutes === null ? null : minutes - medianMinutes,
      proportion:
        medianMinutes === null || medianMinutes <= 0
          ? null
          : Math.min(1, minutes / (medianMinutes * 2)),
      range,
      status: rangeStatus(minutes, range),
    };
  });

  return { lastNight, stageRows };
}

export {
  debtNights,
  SLEEP_NEED_HOURS,
  sleepDebtHours,
  type DebtNight,
} from './sleepDebt';
