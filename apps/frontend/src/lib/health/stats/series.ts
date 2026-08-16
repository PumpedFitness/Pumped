import {
  addDays,
  civilDateFromLocal,
  daysBetween,
  type CivilDate,
  type ReferenceDate,
} from '../civilDate';
import type { Annotation } from '../algorithms/annotations';
import { correlation, MINIMUM_SAMPLES } from '../algorithms/baseline';
import {
  mainNightsByDate,
  stageMinutes,
  toSleepNight,
  type SleepNight,
  type SleepSessionInput,
} from '../algorithms/sleep';
import { sleepScore } from '../algorithms/sleepScore';
import {
  METRIC_ORDER,
  type Metric,
  type MetricSeries,
  type MetricValues,
} from '../metrics';

export type DailyRow = {
  readonly date: CivilDate;
  readonly value: number;
};

/**
 * Alle geführten Größen sind streng positiv — RMSSD, Ruhepuls, Atemfrequenz,
 * Schlafdauer, Hauttemperatur in Grad Celsius. Eine 0 ist bei keiner davon eine
 * Messung, sondern die Art, wie eine Quelle „nicht berechnet" ausdrückt.
 *
 * Konkret: Google trägt den Tiefschlaf-RMSSD für ältere Nächte als `0` ein,
 * statt das Feld wegzulassen — im Testkonto 40 von 43 Tagen. Wer die 0
 * übernimmt, bekommt eine HRV-Baseline von rund 5 statt 79 ms.
 *
 * Käme je eine Größe dazu, die echt null werden kann (eine *Abweichung* statt
 * eines Absolutwerts), gehört sie hier ausgenommen.
 */
export function admissible(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function toMetricValues(rows: readonly DailyRow[]): Map<CivilDate, number> {
  const values = new Map<CivilDate, number>();
  for (const row of rows) {
    if (admissible(row.value)) values.set(row.date, row.value);
  }
  return values;
}

export type MetricSeriesInput = {
  readonly hrvAverage: readonly DailyRow[];
  readonly hrvDeepSleep: readonly DailyRow[];
  readonly restingHeartRate: readonly DailyRow[];
  readonly respiratoryRate: readonly DailyRow[];
  readonly skinTemperature: readonly DailyRow[];
  readonly sleepSessions: readonly SleepSessionInput[];
};

export type LoadedSeries = {
  readonly series: MetricSeries;
  readonly nights: ReadonlyMap<CivilDate, SleepNight>;
};

/**
 * Baut die Tagesreihen aus den Rohzeilen.
 *
 * Der Tiefschlaf-RMSSD ist der störungsärmste HRV-Wert — keine Bewegung, keine
 * Traumaktivität, stabile Atmung. Er **gewinnt**, wo er vorliegt; der
 * Nachtmittel ist der Rückfall. Ohne diesen Rückfall bliebe im Testkonto von 43
 * Tagen einer übrig, und HRV fiele als schwerstgewichtete Metrik ganz aus dem
 * Score.
 *
 * Die Annotationen gehen nur in die **Nachtnote** ein, deren Phasenreferenz sie
 * bereinigen. Die übrigen Reihen bleiben vollständig: Hier entsteht, was
 * gemessen wurde, und ein markierter Tag ist gemessen. Herausgenommen wird er
 * eine Schicht höher, wo aus Messungen eine Referenz wird.
 */
export function buildMetricSeries(
  input: MetricSeriesInput,
  annotations: readonly Annotation[],
): LoadedSeries {
  const hrv = toMetricValues(input.hrvAverage);
  for (const [date, value] of toMetricValues(input.hrvDeepSleep)) {
    hrv.set(date, value);
  }

  const nights = mainNightsByDate(input.sleepSessions.map(toSleepNight));
  const sleep = new Map<CivilDate, number>();
  // Die Nachtnote je Nacht, damit der Estimator sie wie jede andere Größe gegen
  // ihre eigene Baseline stellen kann. Abgeleitet, nicht gespeichert: Ändert
  // sich die Formel, ändern sich rückwirkend alle Werte — was richtig ist,
  // sonst mischte eine Baseline zwei Rechnungen.
  const sleepScoreValues = new Map<CivilDate, number>();
  const deep = new Map<CivilDate, number>();
  for (const [date, night] of nights) {
    if (admissible(night.hoursAsleep)) sleep.set(date, night.hoursAsleep);
    // Nur Nächte mit Phasendetail: Eine CLASSIC-Nacht hat nicht null Minuten
    // Tiefschlaf, sie hat keine Messung. Als 0 zu führen zöge die Baseline nach
    // unten und behauptete eine Nacht ohne Tiefschlaf.
    if (night.hasStageDetail) {
      const minutes = stageMinutes(night, 'deep');
      if (admissible(minutes)) deep.set(date, minutes);
    }
  }

  const series = new Map<Metric, MetricValues>([
    ['hrv', hrv],
    ['rhr', toMetricValues(input.restingHeartRate)],
    ['sleepScore', sleepScoreValues],
    ['sleep', sleep],
    ['deep', deep],
    ['resp', toMetricValues(input.respiratoryRate)],
    ['temp', toMetricValues(input.skinTemperature)],
  ]);

  // Erst nach `nights`, weil jede Note die Phasenmediane der **vorherigen**
  // Nächte braucht — die Karte muss vollständig sein, bevor die erste fällt.
  for (const date of nights.keys()) {
    const result = sleepScore(nights, date, annotations);
    if (result.score !== null) sleepScoreValues.set(date, result.score);
  }

  return { series, nights };
}

/** Zugriff auf eine unbekannte Metrik liefert die leere Reihe, nicht `null`. */
export function valuesFor(series: MetricSeries, metric: Metric): MetricValues {
  return series.get(metric) ?? new Map();
}

// MARK: - Stichtag

/**
 * Die Größen, die jeden Morgen zuverlässig ankommen und deshalb den Stichtag
 * bestimmen.
 *
 * Bewusst nicht alle fünf: Ein Tag, an dem nur die Hauttemperatur vorliegt,
 * würde sonst zum Stichtag, obwohl sie in keinem Modell ein Term ist — das
 * Ergebnis wäre „nicht genug Daten" an einem Datum, das Daten hat.
 */
const REFERENCE_ANCHORS: readonly Metric[] = ['hrv', 'sleep', 'rhr'];

/**
 * Der Stichtag ist der jüngste Tag, für den überhaupt etwas vorliegt — nicht
 * „heute".
 *
 * HRV und Schlaf entstehen morgens; vor dem ersten Sync des Tages wäre „heute"
 * schlicht leer und der Score jeden Tag stundenlang „nicht genug Daten". Wie
 * alt der Stand ist, verschweigt die Rechenschicht trotzdem nicht — ab wann
 * daraus ein Hinweis wird, entscheidet die Darstellung.
 */
export function resolveReferenceDate(
  series: MetricSeries,
  now: Date,
): ReferenceDate {
  const today = civilDateFromLocal(now);

  let latest: CivilDate | null = null;
  for (const metric of REFERENCE_ANCHORS) {
    for (const date of valuesFor(series, metric).keys()) {
      if (latest === null || date > latest) latest = date;
    }
  }

  // Ein Gerät mit falsch gestellter Uhr darf den Stichtag nicht in die Zukunft
  // schieben — `history` nähme sonst die ganze Historie ins Fenster.
  const date = latest === null ? today : Math.min(latest, today);
  return { date, daysStale: daysBetween(date, today) };
}

// MARK: - Gezeichnete Reihen

export type SeriesPoint = {
  /** Position in der gezeichneten Reihe, nicht das Datum. */
  readonly id: number;
  readonly date: CivilDate;
  readonly value: number;
};

/**
 * Die letzten `days` **Kalendertage** bis zum Stichtag.
 *
 * Kalendertage, nicht Einträge: Der Tracker wird nicht jeden Tag getragen. Über
 * „die letzten 30 Messungen" zu fenstern würde eine Lücke als Verlauf zeichnen.
 */
export function points(
  values: MetricValues,
  days: number,
  referenceDate: CivilDate,
): SeriesPoint[] {
  const earliest = addDays(referenceDate, -(days - 1));
  return [...values.entries()]
    .filter(([date]) => date >= earliest && date <= referenceDate)
    .sort(([a], [b]) => a - b)
    .map(([date, value], id) => ({ id, date, value }));
}

/**
 * Spanne der vorhandenen Historie in Kalendertagen.
 *
 * Grundlage jeder Fensterauswahl: Ein Fenster anzubieten, das die Historie
 * nicht deckt, wäre eine stille Lüge über die Datenlage.
 */
export function spanInDays(values: MetricValues): number {
  if (values.size === 0) return 0;
  const dates = [...values.keys()];
  return daysBetween(Math.min(...dates), Math.max(...dates)) + 1;
}

export type SeriesSummary = {
  readonly mean: number;
  readonly sd: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly count: number;
};

/**
 * Mitte und Streuung **der gezeichneten Reihe**.
 *
 * Bewusst etwas anderes als die Baseline: Dort ist der Stichtag ausgeschlossen,
 * weil der aktuelle Wert seine eigene Referenz nicht mitbestimmen soll. Hier
 * ist er enthalten — es geht um die Verteilung, in der der Wert liegt, nicht um
 * die Referenz, gegen die er bewertet wird.
 */
export function seriesSummary(values: readonly number[]): SeriesSummary | null {
  if (values.length < 2) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) /
    (values.length - 1);
  return {
    mean,
    sd: Math.sqrt(variance),
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    count: values.length,
  };
}

// MARK: - Zusammenhänge

export type Relationship = {
  readonly metric: Metric;
  /** `null` unterhalb von `MINIMUM_SAMPLES` gemeinsamen Tagen. */
  readonly r: number | null;
  readonly count: number;
};

/**
 * Wie eine Metrik im gewählten Fenster mit den übrigen zusammenhängt.
 *
 * Gepaart wird nur über Tage, an denen **beide** gemessen haben — ein fehlender
 * Wert bekommt keinen Partner untergeschoben. Die Paare stehen nach Datum, damit
 * die Summation reproduzierbar bleibt.
 */
export function relationships(
  series: MetricSeries,
  metric: Metric,
  days: number,
  referenceDate: CivilDate,
): Relationship[] {
  const earliest = addDays(referenceDate, -(days - 1));
  const own = [...valuesFor(series, metric).entries()]
    .filter(([date]) => date >= earliest && date <= referenceDate)
    .sort(([a], [b]) => a - b);

  return METRIC_ORDER.filter(other => other !== metric)
    .map(other => {
      const theirs = valuesFor(series, other);
      const pairs = own
        .filter(([date]) => theirs.has(date))
        .map(([date, value]) => ({ x: value, y: theirs.get(date) as number }));
      return {
        metric: other,
        r: pairs.length >= MINIMUM_SAMPLES ? correlation(pairs) : null,
        count: pairs.length,
      };
    })
    .sort((a, b) => absOrLast(b.r) - absOrLast(a.r));
}

// „Unbekannt" ans Ende — `Math.abs(r ?? -1)` machte daraus eine 1 und stellte
// die Zeile ohne Zahl an die Spitze.
function absOrLast(r: number | null): number {
  return r === null ? -1 : Math.abs(r);
}
