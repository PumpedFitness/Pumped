import type { TFunction } from 'i18next';
import type { IconName } from '@pumped/ui/icons/ClayIcon';
import {
  annotationSpan,
  openAnnotation,
  type Annotation,
} from '@/lib/health/algorithms/annotations';
import {
  detectIllness,
  type IllnessCandidate,
} from '@/lib/health/algorithms/illness';
import type { CivilDate } from '@/lib/health/civilDate';
import type { MetricSeries } from '@/lib/health/metrics';

/**
 * Was ein Hinweis auslöst, als Beschreibung statt als Funktion.
 *
 * Das Modell bleibt damit rein und prüfbar: Es sagt, was angeboten wird, und
 * die Komponente weiß, wie man es ausführt. Closures hier hineinzuschreiben
 * hieße, den Datenbankzugriff in eine Funktion zu ziehen, deren einzige
 * Aufgabe das Formulieren von Text ist.
 */
export type NoticeAction =
  | {
      readonly kind: 'markSick';
      readonly from: CivilDate;
      readonly to: CivilDate | null;
    }
  | { readonly kind: 'endSick'; readonly id: string; readonly to: CivilDate }
  | { readonly kind: 'dismiss'; readonly noticeId: string }
  | { readonly kind: 'openRecovery' };

export type NoticeButton = {
  readonly key: string;
  readonly label: string;
  readonly tone: 'primary' | 'ghost';
  readonly action: NoticeAction;
};

export type Notice = {
  /**
   * Stabil über Neustarts — der Schlüssel, unter dem ein Wegwischen gemerkt
   * wird.
   *
   * Für einen Verdacht ist das der **Starttag**, nicht die ganze Spanne: Zieht
   * sich die Krankheit einen Tag länger hin, ist es derselbe Infekt und nicht
   * eine zweite Frage. Andernfalls fragte die Karte jeden Morgen neu nach
   * etwas, das der Nutzer gestern schon weggewischt hat.
   */
  readonly id: string;
  readonly icon: IconName;
  readonly title: string;
  readonly body: string;
  /** Begründung in einer Zeile, oder `null`. */
  readonly detail: string | null;
  readonly buttons: readonly NoticeButton[];
};

export type NoticeInput = {
  readonly t: TFunction;
  readonly series: MetricSeries;
  readonly annotations: readonly Annotation[];
  readonly referenceDate: CivilDate;
  /** Heute nach Gerätezeit — kann jünger sein als der Stichtag der Messung. */
  readonly today: CivilDate;
  readonly hasData: boolean;
  readonly dismissed: ReadonlySet<string>;
  readonly formatDate: (date: CivilDate) => string;
};

/**
 * Die Hinweise, die das Widget zeigt — dringlichster zuerst.
 *
 * Eine laufende Markierung steht über einem neuen Verdacht: Sie ist bereits
 * bestätigt und wartet nur noch auf ihr Ende, während der Verdacht eine Frage
 * ist. Beides gleichzeitig zu zeigen wäre ohnehin selten — was markiert ist,
 * meldet die Erkennung nicht mehr.
 */
export function buildNotices(input: NoticeInput): Notice[] {
  if (!input.hasData) return [];

  const notices: Notice[] = [];

  const open = openAnnotation(input.annotations, 'sick', input.today);
  if (open !== null) notices.push(openSickNotice(input, open));

  for (const candidate of detectIllness({
    series: input.series,
    referenceDate: input.referenceDate,
    annotations: input.annotations,
  })) {
    notices.push(illnessNotice(input, candidate));
  }

  return notices.filter(notice => !input.dismissed.has(notice.id));
}

// MARK: - Intern

function openSickNotice(input: NoticeInput, open: Annotation): Notice {
  const span = annotationSpan(open);
  return {
    // Ohne Datum im Schlüssel: Eine laufende Markierung soll sich nicht
    // wegwischen lassen und morgen unter neuem Namen wiederkommen.
    id: `sick-open:${open.id}`,
    icon: 'pulse',
    title: input.t('widgets.notifications.sickOpen.title'),
    body: input.t('widgets.notifications.sickOpen.body', {
      date: input.formatDate(span.from),
    }),
    detail: input.t('widgets.notifications.sickOpen.detail'),
    buttons: [
      {
        key: 'recovered',
        label: input.t('widgets.notifications.sickOpen.recovered'),
        tone: 'primary',
        action: { kind: 'endSick', id: open.id, to: input.today },
      },
      {
        key: 'details',
        label: input.t('widgets.notifications.openRecovery'),
        tone: 'ghost',
        action: { kind: 'openRecovery' },
      },
    ],
  };
}

function illnessNotice(
  input: NoticeInput,
  candidate: IllnessCandidate,
): Notice {
  const id = `illness:${candidate.from}`;
  const single = candidate.from === candidate.to;

  // Reicht der Verdacht bis an den Stichtag, ist er vermutlich noch nicht
  // vorbei — dann wird offen markiert, und der Hinweis oben fragt später nach
  // dem Ende. Ein fest zugemachter Zeitraum verlangte stattdessen morgen eine
  // zweite Bestätigung für dieselbe Krankheit.
  const ongoing = candidate.to >= input.referenceDate;

  return {
    id,
    icon: 'warning',
    title: single
      ? input.t('widgets.notifications.illness.titleDay', {
          date: input.formatDate(candidate.from),
        })
      : input.t('widgets.notifications.illness.titleRange', {
          from: input.formatDate(candidate.from),
          to: input.formatDate(candidate.to),
        }),
    body: input.t('widgets.notifications.illness.body', {
      count: candidate.dayCount,
    }),
    detail: candidate.markers
      .map(marker =>
        input.t('widgets.notifications.illness.marker', {
          metric: input.t(`health.short.${marker.metric}`),
          sigma: formatDeviation(marker.z),
        }),
      )
      .join(' · '),
    buttons: [
      {
        key: 'mark',
        label: input.t('widgets.notifications.illness.mark'),
        tone: 'primary',
        action: {
          kind: 'markSick',
          from: candidate.from,
          to: ongoing ? null : candidate.to,
        },
      },
      {
        key: 'dismiss',
        label: input.t('widgets.notifications.dismiss'),
        tone: 'ghost',
        action: { kind: 'dismiss', noticeId: id },
      },
    ],
  };
}

/**
 * Der Ausschlag als Betrag, ohne Vorzeichen.
 *
 * Die gerichtete Abweichung ist hier immer negativ — das ist die Bedingung,
 * unter der eine Größe überhaupt in der Begründung landet. „−2.1σ" neben dem
 * Ruhepuls läse sich, als wäre er gefallen; gestiegen ist er.
 */
function formatDeviation(z: number): string {
  return `${Math.abs(z).toFixed(1)}σ`;
}
