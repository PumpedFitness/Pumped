import { addDays, type CivilDate } from '../civilDate';
import type { MetricValues } from '../metrics';

export const SLEEP_NEED_HOURS = 7.6;

/** Tage im Defizitfenster, einschließlich Stichtag. */
const DEBT_WINDOW_DAYS = 7;

export type DebtNight = {
  readonly id: number;
  readonly date: CivilDate;
  /** `null` bedeutet: keine Aufzeichnung für diesen Tag. */
  readonly hoursAsleep: number | null;
  readonly shortfallHours: number;
  readonly isRecorded: boolean;
};

/**
 * Die letzten sieben **Kalendertage** bis einschließlich Stichtag.
 *
 * Nicht die letzten sieben aufgezeichneten Nächte: Der Tracker wird nicht jede
 * Nacht getragen — im Testkonto liegen 20 Nächte auf 58 Tagen. Über „die
 * letzten sieben Einträge" zu rechnen dehnt das Fenster stillschweigend auf
 * Wochen und weist ein Defizit aus, das längst aufgeholt ist.
 *
 * Tage ohne Aufzeichnung erscheinen als Lücke, nicht als Nacht ohne Schlaf —
 * eine nicht getragene Uhr ist keine schlaflose Nacht. Sie zählen deshalb weder
 * zur Schuld noch zur Entlastung.
 */
export function debtNights(
  sleepValues: MetricValues,
  referenceDate: CivilDate,
): DebtNight[] {
  const earliest = addDays(referenceDate, -(DEBT_WINDOW_DAYS - 1));

  return Array.from({ length: DEBT_WINDOW_DAYS }, (_, id) => {
    const date = addDays(earliest, id);
    const hoursAsleep = sleepValues.get(date) ?? null;
    return {
      id,
      date,
      hoursAsleep,
      shortfallHours:
        hoursAsleep === null ? 0 : Math.max(0, SLEEP_NEED_HOURS - hoursAsleep),
      isRecorded: hoursAsleep !== null,
    };
  }).filter(night => night.date <= referenceDate);
}

/**
 * Aufgelaufenes Schlafdefizit in Stunden.
 *
 * Bewusst aus `debtNights` abgeleitet: Score und Schlaf-Screen sollen dieselbe
 * Zahl nennen, sonst zeigt der eine ein Defizit, mit dem der andere nicht
 * rechnet.
 */
export function sleepDebtHours(
  sleepValues: MetricValues,
  referenceDate: CivilDate,
): number {
  return debtNights(sleepValues, referenceDate).reduce(
    (sum, night) => sum + night.shortfallHours,
    0,
  );
}
