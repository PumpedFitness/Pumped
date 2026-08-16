import { addDays, civilDateFromEpoch, type CivilDate } from '../civilDate';

export const ANNOTATION_TYPES = [
  'sick',
  'alcohol',
  'travel',
  'injury',
] as const;

export type AnnotationType = (typeof ANNOTATION_TYPES)[number];

/**
 * Ob ein Zeitraum dieses Typs die autonomen Marker verschiebt und deshalb aus
 * der Baseline genommen wird.
 *
 * `injury` tut das **nicht**: Eine Verletzung verschiebt das Training, nicht
 * HRV oder Ruhepuls. Acht Wochen davon auszuschließen drückte die Historie
 * unter die Mindestmenge, ohne ein Störsignal zu entfernen.
 */
export const ANNOTATION_DISTORTS_BASELINE: Record<AnnotationType, boolean> = {
  sick: true,
  alcohol: true,
  travel: true,
  injury: false,
};

export type Annotation = {
  /**
   * Der Primärschlüssel der Zeile.
   *
   * Vorher der Index in der geladenen Liste — das reichte, solange niemand
   * schreiben konnte. Eine Markierung zu beenden oder zu löschen braucht die
   * Zeile selbst, und ein Index verschiebt sich, sobald eine ältere dazukommt.
   */
  readonly id: string;
  readonly type: AnnotationType;
  /** Unix-Sekunden. */
  readonly startTs: number;
  /** `null` heißt offen — gedeckelt auf `OPEN_ANNOTATION_MAX_DAYS`. */
  readonly endTs: number | null;
  /**
   * UTC-Offset in Sekunden zum Zeitpunkt des Anlegens.
   *
   * Nicht die aktuelle Zone: Sonst verschöbe sich die Abdeckung einer
   * Markierung rückwirkend, sobald der Nutzer reist — ausgerechnet beim Typ
   * `travel`, für den das gedacht ist.
   */
  readonly tzOffsetSeconds: number;
  readonly note: string | null;
};

/**
 * Eine offene Annotation deckt höchstens so viele Tage ab.
 *
 * Ohne Deckel löscht eine vergessene Markierung mit `excludeAnnotated` lautlos
 * den Score: Sie überzieht das ganze Fenster, die Historie wird leer, jede
 * Metrik fällt unter die Mindestmenge. Die UI soll offene Annotationen sichtbar
 * halten und zum Abschließen auffordern; das hier ist die Absicherung.
 */
export const OPEN_ANNOTATION_MAX_DAYS = 14;

/** Erster und letzter abgedeckter Tag, gerechnet in der Entstehungszone. */
export type AnnotationSpan = {
  readonly from: CivilDate;
  readonly to: CivilDate;
  /** Ob `to` der Deckel ist und nicht ein gesetztes Ende. */
  readonly isOpen: boolean;
};

/**
 * Die Tage, die eine Annotation abdeckt.
 *
 * Eigene Funktion, weil inzwischen drei Stellen dieselbe Spanne brauchen: der
 * Baseline-Filter, die schattierten Bereiche im Verlauf und die Textzeile
 * „seit Freitag". Jede für sich zu rechnen hieße, den 14-Tage-Deckel dreimal
 * zu treffen.
 */
export function annotationSpan(annotation: Annotation): AnnotationSpan {
  const from = civilDateFromEpoch(
    annotation.startTs,
    annotation.tzOffsetSeconds,
  );
  return annotation.endTs === null
    ? { from, to: addDays(from, OPEN_ANNOTATION_MAX_DAYS), isOpen: true }
    : {
        from,
        to: civilDateFromEpoch(annotation.endTs, annotation.tzOffsetSeconds),
        isOpen: false,
      };
}

/** Ob die Annotation diesen Tag abdeckt, gerechnet in ihrer Entstehungszone. */
export function annotationCovers(
  annotation: Annotation,
  date: CivilDate,
): boolean {
  const span = annotationSpan(annotation);
  return date >= span.from && date <= span.to;
}

/** Ob dieser Tag aus der Baseline genommen wird. */
export function isAnnotatedAway(
  annotations: readonly Annotation[],
  date: CivilDate,
): boolean {
  return annotations.some(
    annotation =>
      ANNOTATION_DISTORTS_BASELINE[annotation.type] &&
      annotationCovers(annotation, date),
  );
}

/** Ein zusammenhängender Abschnitt einer gezeichneten Reihe. */
export type IndexSpan = {
  readonly from: number;
  readonly to: number;
};

/**
 * Welche Abschnitte einer gezeichneten Reihe markiert sind.
 *
 * Rechnet in **Positionen**, nicht in Tagen: Ein Verlauf zeichnet nur die Tage,
 * an denen gemessen wurde, und zwischen dem 14. und dem 16. kann eine Lücke
 * liegen. Wer die Schattierung über Datumsdifferenzen legte, träfe den falschen
 * Bereich, sobald die Uhr eine Nacht ausgelassen hat.
 *
 * Benachbarte Positionen wachsen zu einem Abschnitt zusammen — zwei getrennte
 * Rechtecke mit einer Fuge dazwischen sähen aus wie zwei Krankheiten.
 */
export function annotatedIndexSpans(
  dates: readonly CivilDate[],
  annotations: readonly Annotation[],
): IndexSpan[] {
  const spans: IndexSpan[] = [];

  dates.forEach((date, index) => {
    if (!isAnnotatedAway(annotations, date)) return;
    const last = spans[spans.length - 1];
    if (last !== undefined && last.to === index - 1) {
      spans[spans.length - 1] = { from: last.from, to: index };
    } else {
      spans.push({ from: index, to: index });
    }
  });

  return spans;
}

/** Die Annotationen eines Typs, jüngste zuerst. */
export function annotationsOfType(
  annotations: readonly Annotation[],
  type: AnnotationType,
): Annotation[] {
  return annotations
    .filter(annotation => annotation.type === type)
    .sort((a, b) => b.startTs - a.startTs);
}

/**
 * Die laufende Markierung dieses Typs, oder `null`.
 *
 * Offen **und** noch im Deckel: Eine vergessene Markierung von vor drei Wochen
 * ist keine laufende Krankheit mehr, und sie als solche zu zeigen hieße, den
 * Nutzer zum Beenden von etwas aufzufordern, das die Auswertung längst nicht
 * mehr berücksichtigt.
 */
export function openAnnotation(
  annotations: readonly Annotation[],
  type: AnnotationType,
  today: CivilDate,
): Annotation | null {
  return (
    annotationsOfType(annotations, type).find(annotation => {
      const span = annotationSpan(annotation);
      return span.isOpen && today >= span.from && today <= span.to;
    }) ?? null
  );
}
