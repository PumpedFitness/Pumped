import {
  loadAnnotations,
  loadHeartRateCurve,
  loadMetricSeriesInput,
  loadNightBreathing,
} from '@/data/local/health/rawStore';
import * as schema from '@/data/local/schema';
import { useTableQuery } from '@/data/local/tableVersions';
import type { Annotation } from '@/lib/health/algorithms/annotations';
import {
  analyseSleep,
  type SleepAnalysis,
} from '@/lib/health/algorithms/sleepAnalysis';
import {
  observation,
  score,
  type Contribution,
  type ScoreResult,
} from '@/lib/health/algorithms/estimator';
import { DEFAULT_SETTINGS } from '@/lib/health/algorithms/settings';
import type { ReferenceDate } from '@/lib/health/civilDate';
import type { SleepStage } from '@/lib/health/algorithms/sleep';
import {
  sleepScore,
  type SleepScoreResult,
} from '@/lib/health/algorithms/sleepScore';
import {
  METRIC_ORDER,
  type Metric,
  type MetricSeries,
} from '@/lib/health/metrics';
import {
  buildMetricSeries,
  points,
  relationships,
  resolveReferenceDate,
  spanInDays,
  valuesFor,
  type Relationship,
  type SeriesPoint,
} from '@/lib/health/stats/series';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';

export type HealthSnapshot = {
  /** Ob überhaupt etwas synchronisiert wurde. */
  readonly hasData: boolean;
  readonly referenceDate: ReferenceDate;
  readonly result: ScoreResult;
  /** Größen außerhalb des Modells — heute nur die Hauttemperatur. */
  readonly observations: readonly Contribution[];
  readonly sleep: SleepAnalysis;
  /** Note für die letzte Nacht, mit den Termen, aus denen sie entsteht. */
  readonly sleepScore: SleepScoreResult;
  /**
   * Die Markierungen des Nutzers — dieselbe Liste, mit der gerechnet wurde.
   *
   * Die Anzeige braucht sie, um zu zeigen, **warum** ein Tag fehlt: Ein
   * Verlauf, aus dem eine Woche stillschweigend verschwindet, sieht aus wie ein
   * Datenfehler.
   */
  readonly annotations: readonly Annotation[];
  /**
   * Verdichtete Herzfrequenz der letzten Nacht, leer für ältere Nächte.
   * Der Sync holt sie nur für die jüngsten Nächte.
   */
  readonly heartRateCurve: readonly { ts: number; value: number }[];
  /** Atemfrequenz je Phase derselben Nacht. Fehlende Phasen fehlen. */
  readonly nightBreathing: Partial<Record<SleepStage, number>>;
  readonly series: MetricSeries;
  /** Verlauf einer Metrik im gewählten Fenster, ab dem Stichtag zurück. */
  readonly pointsFor: (metric: Metric, days: number) => SeriesPoint[];
  /** Wie viele Kalendertage die Historie einer Metrik überhaupt deckt. */
  readonly spanFor: (metric: Metric) => number;
  readonly relationshipsFor: (metric: Metric, days: number) => Relationship[];
};

/**
 * Der ausgewertete Stand der Gesundheitsdaten.
 *
 * Liest die Rohschicht und rechnet daraus Reihen, Stichtag und Score. Hängt an
 * `useTableQuery`, rechnet also nur neu, wenn wirklich geschrieben wurde — ein
 * Sync oder eine neue Annotation lösen das aus, ein Re-Render nicht.
 *
 * `now` ist injizierbar, damit sich der Stichtag testen lässt, ohne die Uhr zu
 * stellen.
 */
export function useHealthSnapshot(now: Date = new Date()): HealthSnapshot {
  const modelId = useHealthSettingsStore(state => state.modelId);
  const scale = useHealthSettingsStore(state => state.scale);
  const thresholds = useHealthSettingsStore(state => state.thresholds);
  // Nur der Tag zählt: Der Stichtag wechselt um Mitternacht, nicht laufend.
  const today = now.toDateString();
  // Die Schwellen sind ein Objekt und bekämen bei jedem Render eine neue
  // Identität als Abhängigkeit; ihr Inhalt ist, was den Score verändert.
  const thresholdKey = JSON.stringify(thresholds);

  return useTableQuery(
    [
      schema.healthRawDaily,
      schema.healthRawSession,
      schema.healthRawSample,
      schema.healthAnnotations,
    ],
    () => {
      const annotations = loadAnnotations();
      const { series, nights } = buildMetricSeries(
        loadMetricSeriesInput(),
        annotations,
      );
      const referenceDate = resolveReferenceDate(series, new Date(today));
      const settings = { ...DEFAULT_SETTINGS, modelId, scale, thresholds };

      const result = score({ settings, series, annotations, referenceDate });
      const sleepAnalysis = analyseSleep(
        nights,
        referenceDate.date,
        annotations,
      );
      // Metriken, die in keinem Term des Modells vorkommen, bekommen eine
      // Beobachtung ohne Gewicht — sonst bliebe die Hauttemperatur als einzige
      // geführte Größe ganz ohne Auswertung.
      const weighted = new Set(result.contributions.map(entry => entry.metric));
      const observations = METRIC_ORDER.filter(
        metric => !weighted.has(metric),
      ).map(metric =>
        observation({ settings, series, annotations, referenceDate, metric }),
      );

      return {
        hasData: [...series.values()].some(values => values.size > 0),
        referenceDate,
        result,
        observations,
        sleep: sleepAnalysis,
        // Hier und nicht im Screen: Die Note braucht die ganze Nachtkarte als
        // Phasenreferenz, und die soll nicht durch den Renderbaum wandern.
        sleepScore: sleepScore(nights, referenceDate.date, annotations),
        annotations,
        heartRateCurve:
          sleepAnalysis.lastNight === null
            ? []
            : loadHeartRateCurve(
                sleepAnalysis.lastNight.startTs,
                sleepAnalysis.lastNight.endTs,
              ),
        nightBreathing:
          sleepAnalysis.lastNight === null
            ? {}
            : loadNightBreathing(
                sleepAnalysis.lastNight.startTs,
                sleepAnalysis.lastNight.endTs,
              ),
        series,
        pointsFor: (metric: Metric, days: number) =>
          points(valuesFor(series, metric), days, referenceDate.date),
        spanFor: (metric: Metric) => spanInDays(valuesFor(series, metric)),
        relationshipsFor: (metric: Metric, days: number) =>
          relationships(series, metric, days, referenceDate.date),
      };
    },
    [modelId, today, scale, thresholdKey],
  );
}
