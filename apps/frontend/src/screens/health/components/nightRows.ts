import type { StageRow } from '@/lib/health/algorithms/sleepAnalysis';
import type { SleepStage } from '@/lib/health/algorithms/sleep';
import type {
  RangeStatus,
  SleepScoreResult,
  SleepScoreRow,
  TermRange,
} from '@/lib/health/algorithms/sleepScore';

/**
 * Die Phasen in der Abfolge des Diagramms darüber, damit die Farbpunkte von
 * oben nach unten gelesen werden können.
 */
const STAGE_ORDER: readonly SleepStage[] = ['awake', 'rem', 'core', 'deep'];

/** Aussagen über die ganze Nacht. Sie klammern die Phasen ein. */
type WholeNightKey = 'duration' | 'efficiency';

export type NightRowKey = WholeNightKey | SleepStage;

export type NightRow = {
  readonly key: NightRowKey;
  /**
   * Farbpunkt **und** Unterscheidungsmerkmal: `null` heißt, die Zeile ist keine
   * Phase und trägt ihren Namen aus dem Term-Namensraum. Der Schlüssel allein
   * verrät das nicht — `deep` ist beides.
   */
  readonly stage: SleepStage | null;
  readonly value: number | null;
  readonly unit: 'hours' | 'minutes' | 'percent';
  /** Normalbereich. `null` heißt: gemessen, aber nicht benotet. */
  readonly range: TermRange | null;
  readonly status: RangeStatus | null;
  /** Anteil an der Note. 0 heißt: geht nicht ein. */
  readonly weight: number;
  /** Abstand zum eigenen Median — die Referenz für Zeilen ohne Bereich. */
  readonly deltaMinutes: number | null;
  readonly breathing: number | undefined;
};

type Input = {
  readonly score: SleepScoreResult;
  readonly stageRows: readonly StageRow[];
  readonly breathingByStage: Partial<Record<SleepStage, number>>;
};

/**
 * Alles, was über die letzte Nacht bekannt ist, in **einer** Liste.
 *
 * Vorher standen die Phasen unter dem Diagramm und die benoteten Terme in einer
 * eigenen Karte darunter — Tief- und REM-Schlaf tauchten damit zweimal auf, mit
 * derselben Minutenzahl und zwei verschiedenen Referenzen daneben. Hier fällt
 * beides in eine Zeile: die Minuten der Nacht, und daneben entweder der
 * Normalbereich mit Gewicht (wenn die Größe in die Note eingeht) oder nur der
 * Abstand zum eigenen Median (wenn nicht).
 *
 * Kernschlaf und Wachzeit bleiben ohne Bereich, weil sie in keinem Term stehen.
 * Sie deshalb wegzulassen wäre falsch — sie sind gemessen, nur eben nicht
 * benotet, und das unterscheidet die Zeilen sichtbar voneinander.
 */
export function nightRows({
  score,
  stageRows,
  breathingByStage,
}: Input): NightRow[] {
  const scored = new Map(score.rows.map(row => [row.term, row]));
  const stages = new Map(stageRows.map(row => [row.stage, row]));

  // Explizit statt über eine Liste gemischter Schlüssel: `deep` ist zugleich
  // Phase und Term, und nur hier steht ohne Umweg fest, welcher von beiden
  // Namensräumen die Beschriftung trägt.
  return [
    wholeNightRow('duration', scored.get('duration')),
    ...STAGE_ORDER.flatMap(stage => {
      const row = stages.get(stage);
      return row === undefined
        ? []
        : [
            stageRowFor(
              row,
              stage === 'deep' || stage === 'rem'
                ? scored.get(stage)
                : undefined,
              breathingByStage[stage],
            ),
          ];
    }),
    wholeNightRow('efficiency', scored.get('efficiency')),
  ];
}

/** Dauer und Effizienz — Aussagen über die ganze Nacht, ohne Phasenfarbe. */
function wholeNightRow(
  key: WholeNightKey,
  term: SleepScoreRow | undefined,
): NightRow {
  return {
    key,
    stage: null,
    value: term?.value ?? null,
    unit: key === 'duration' ? 'hours' : 'percent',
    range: term?.range ?? null,
    status: term?.status ?? null,
    weight: term?.weight ?? 0,
    deltaMinutes: null,
    breathing: undefined,
  };
}

/**
 * Eine Phase. Tief- und REM-Schlaf tragen zusätzlich ihren Term.
 *
 * Der Bereich kommt aus der Phase selbst und nicht aus dem Term: Kernschlaf und
 * Wachzeit haben keinen Term, aber sehr wohl eine übliche Spanne. Für Tief- und
 * REM-Schlaf ist es ohnehin dieselbe Zahl — `analyseSleep` und die Nachtnote
 * rufen dieselbe Funktion.
 *
 * Der Abstand zum Median steht nur, wo **kein** Bereich gezeichnet wird — sonst
 * sagten Balken und Zahl dasselbe zweimal.
 */
function stageRowFor(
  stage: StageRow,
  term: SleepScoreRow | undefined,
  breathing: number | undefined,
): NightRow {
  return {
    key: stage.stage,
    stage: stage.stage,
    value: stage.minutes,
    unit: 'minutes',
    range: stage.range,
    status: stage.status,
    weight: term?.weight ?? 0,
    deltaMinutes: stage.range === null ? stage.deltaMinutes : null,
    breathing,
  };
}
