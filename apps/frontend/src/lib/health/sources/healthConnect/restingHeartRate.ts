import type { TimedValue } from '../../algorithms/downsample';
import {
  mainNightsByDate,
  toSleepNight,
  type SleepSessionInput,
} from '../../algorithms/sleep';
import { civilDateFromEpoch, type CivilDate } from '../../civilDate';

/**
 * Welcher Rang der nächtlichen Herzfrequenz als Ruhepuls gilt.
 *
 * Nicht das Minimum: Ein einzelner Aussetzer nach unten — eine verrutschte Uhr,
 * eine kurze Störung der Messung — wäre sonst der Ruhepuls des Tages. Bei einer
 * Nacht mit rund 48 Messpunkten trifft das fünfte Perzentil den
 * dritt-niedrigsten Wert und meint damit „die niedrigste **gehaltene**
 * Herzfrequenz", was ein Ruhepuls sein soll.
 */
export const RESTING_HR_PERCENTILE = 0.05;

/**
 * Weniger Punkte heißt: Die Uhr lag die halbe Nacht auf dem Nachttisch.
 *
 * Dann ist der niedrigste Wert eine Momentaufnahme und kein Ruhepuls, und ein
 * fehlender Tag ist der Auswertung lieber als ein erfundener — er fällt aus der
 * Normalisierung, statt sie zu verzerren.
 */
export const RESTING_HR_MIN_SAMPLES = 10;

export type RestingHeartRateDay = {
  readonly date: CivilDate;
  readonly value: number;
};

/**
 * Der gemessene Ruhepuls, je Zivildatum.
 *
 * Der bevorzugte Weg: Health Connect führt `RestingHeartRateRecord` als eigenen
 * Satztyp, und Fitbit, Oura, Garmin und Whoop schreiben ihn. Dann ist nichts
 * abzuleiten — die Zahl ist gemessen, und wir übernehmen sie.
 *
 * Mehrere Werte an einem Tag werden gemittelt. Das kommt vor, wenn zwei Apps in
 * dieselbe Ablage schreiben; den Primärschlüssel der Rohschicht teilen sie sich
 * ohnehin, und der Mittelwert ist ehrlicher als „wer zuletzt kam".
 */
export function restingHeartRateFromRecords(
  records: readonly {
    readonly time: string;
    readonly beatsPerMinute: number;
    readonly zoneOffsetSeconds: number;
  }[],
): RestingHeartRateDay[] {
  const byDate = new Map<CivilDate, { sum: number; count: number }>();

  for (const record of records) {
    const millis = Date.parse(record.time);
    if (!Number.isFinite(millis)) continue;
    if (!Number.isFinite(record.beatsPerMinute) || record.beatsPerMinute <= 0) {
      continue;
    }

    const date = civilDateFromEpoch(
      Math.floor(millis / 1000),
      record.zoneOffsetSeconds,
    );
    const entry = byDate.get(date) ?? { sum: 0, count: 0 };
    byDate.set(date, {
      sum: entry.sum + record.beatsPerMinute,
      count: entry.count + 1,
    });
  }

  return [...byDate.entries()]
    .map(([date, entry]) => ({ date, value: entry.sum / entry.count }))
    .sort((left, right) => left.date - right.date);
}

/**
 * Ruhepuls je Zivildatum, abgeleitet aus der Herzfrequenz im Schlaffenster.
 *
 * Die Rückfallebene für Quellen ohne eigenen Ruhepuls — **Samsung Health ist
 * genau so eine**: Es schreibt Herzfrequenz und Schlaf nach Health Connect, aber
 * keinen `RestingHeartRateRecord`. Die Zahl ist dann gerechnet und nicht
 * gelesen, und die Herkunftsanzeige sagt das ausdrücklich (siehe
 * `healthConnectFacts`), damit niemand sie mit der in seiner Wearable-App
 * vergleicht und einen Fehler vermutet.
 *
 * Gerechnet wird **im Fenster der Nacht**, nicht über den Kalendertag: Der
 * Tagesmindestwert einer Uhr, die auch tagsüber misst, fällt sonst in eine
 * Ruhephase am Nachmittag, und die Reihe vergleicht Nächte mit Mittagsschlaf.
 *
 * Die Nächte laufen durch `mainNightsByDate` — dieselbe Auswahl, die auch der
 * Schlafterm verwendet. Das hält zweierlei zusammen: Ein Nickerchen unter drei
 * Stunden erzeugt keinen Ruhepuls, und Ruhepuls und Schlaf eines Tages stammen
 * garantiert aus derselben Nacht.
 */
export function deriveRestingHeartRate(
  sessions: readonly SleepSessionInput[],
  samples: readonly TimedValue[],
): RestingHeartRateDay[] {
  const nights = mainNightsByDate(sessions.map(toSleepNight));
  if (nights.size === 0) return [];

  // Einmal sortieren statt je Nacht — bei sechzig Nächten sind das ein paar
  // tausend Punkte, die sonst sechzig Mal durchlaufen würden.
  const points = samples
    .filter(point => Number.isFinite(point.value) && point.value > 0)
    .sort((left, right) => left.ts - right.ts);

  const days: RestingHeartRateDay[] = [];

  for (const [date, night] of nights) {
    const inWindow = points
      .filter(point => point.ts >= night.startTs && point.ts <= night.endTs)
      .map(point => point.value)
      .sort((left, right) => left - right);

    if (inWindow.length < RESTING_HR_MIN_SAMPLES) continue;
    days.push({ date, value: percentile(inWindow, RESTING_HR_PERCENTILE) });
  }

  return days.sort((left, right) => left.date - right.date);
}

/** Nächster Rang auf einer **aufsteigend sortierten** Reihe. */
function percentile(sorted: readonly number[], fraction: number): number {
  const rank = Math.ceil(fraction * sorted.length) - 1;
  return sorted[Math.min(Math.max(rank, 0), sorted.length - 1)];
}
