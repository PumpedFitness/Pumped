import {
  annotationSpan,
  annotationsOfType,
  type Annotation,
} from '@/lib/health/algorithms/annotations';
import { addDays, daysBetween, type CivilDate } from '@/lib/health/civilDate';

/** Ein eingetragener Krankheitszeitraum, wie ihn der Rückblick zeigt. */
export type IllnessPeriod = {
  readonly annotation: Annotation;
  readonly from: CivilDate;
  /**
   * Letzter gezeigter Tag.
   *
   * Bei einer offenen Markierung **heute** oder der 14-Tage-Deckel, je nachdem
   * was früher kommt. Bis zum Deckel zu zählen behauptete Tage, die noch nicht
   * stattgefunden haben; über ihn hinaus zu zählen behauptete eine Wirkung auf
   * die Baseline, die die Auswertung gar nicht hat.
   */
  readonly to: CivilDate;
  readonly dayCount: number;
  readonly isOpen: boolean;
};

export type IllnessMonth = {
  /** 0 = Januar. */
  readonly month: number;
  readonly days: number;
};

export type IllnessYear = {
  readonly year: number;
  readonly count: number;
  readonly totalDays: number;
  /** Zwölf Einträge, Januar zuerst. */
  readonly months: readonly IllnessMonth[];
};

function yearOf(date: CivilDate): number {
  return Math.trunc(date / 10000);
}

function monthOf(date: CivilDate): number {
  return (Math.trunc(date / 100) % 100) - 1;
}

/**
 * Die eingetragenen Zeiträume, jüngster zuerst.
 *
 * Offene Zeiträume werden auf heute beschnitten — siehe `to`.
 */
export function illnessPeriods(
  annotations: readonly Annotation[],
  today: CivilDate,
): IllnessPeriod[] {
  return annotationsOfType(annotations, 'sick').map(annotation => {
    const span = annotationSpan(annotation);
    const to = span.isOpen ? Math.min(today, span.to) : span.to;
    return {
      annotation,
      from: span.from,
      to,
      dayCount: Math.max(1, daysBetween(span.from, to) + 1),
      isOpen: span.isOpen,
    };
  });
}

/**
 * Zusammenfassung eines Kalenderjahres.
 *
 * Ein Zeitraum über den Jahreswechsel zählt in **beiden** Jahren mit seinen
 * jeweiligen Tagen: Die Grippe zwischen den Jahren gehört nicht willkürlich in
 * eines von beiden. `count` zählt deshalb Zeiträume, die das Jahr berühren,
 * `totalDays` nur die Tage darin — die beiden Zahlen beantworten verschiedene
 * Fragen.
 */
export function illnessYear(
  periods: readonly IllnessPeriod[],
  year: number,
): IllnessYear {
  const days = Array.from({ length: 12 }, () => 0);
  let count = 0;
  let totalDays = 0;

  for (const period of periods) {
    if (yearOf(period.from) > year || yearOf(period.to) < year) continue;
    count += 1;

    for (let date = period.from; date <= period.to; date = addDays(date, 1)) {
      if (yearOf(date) !== year) continue;
      days[monthOf(date)] += 1;
      totalDays += 1;
    }
  }

  return {
    year,
    count,
    totalDays,
    months: days.map((value, month) => ({ month, days: value })),
  };
}

/** Die Jahre, in denen überhaupt etwas eingetragen ist — jüngstes zuerst. */
export function illnessYears(
  periods: readonly IllnessPeriod[],
  today: CivilDate,
): number[] {
  const years = new Set<number>([yearOf(today)]);
  for (const period of periods) {
    years.add(yearOf(period.from));
    years.add(yearOf(period.to));
  }
  return [...years].sort((a, b) => b - a);
}
