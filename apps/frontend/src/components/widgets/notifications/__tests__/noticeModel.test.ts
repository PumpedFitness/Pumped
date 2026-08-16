import type { TFunction } from 'i18next';
import { buildNotices, type NoticeInput } from '../noticeModel';
import type { Annotation } from '@/lib/health/algorithms/annotations';
import { addDays, type CivilDate } from '@/lib/health/civilDate';
import type { Metric, MetricSeries } from '@/lib/health/metrics';

const START: CivilDate = 20260601;
const LAST = 39;
const REFERENCE = addDays(START, LAST);

const CALM: Record<Metric, number[]> = {
  hrv: Array.from({ length: 40 }, (_, i) => 78 + (i % 5)),
  rhr: Array.from({ length: 40 }, (_, i) => 54 + (i % 4)),
  sleepScore: Array.from({ length: 40 }, (_, i) => 70 + (i % 5) * 3),
  sleep: Array.from({ length: 40 }, (_, i) => 7 + (i % 3) * 0.4),
  deep: Array.from({ length: 40 }, (_, i) => 60 + (i % 4) * 6),
  resp: Array.from({ length: 40 }, (_, i) => 15 + (i % 3) * 0.2),
  temp: Array.from({ length: 40 }, (_, i) => 33 + (i % 3) * 0.1),
};

const SICK_PATCH: Partial<Record<Metric, Record<number, number>>> = {
  hrv: { 37: 48, 38: 45, 39: 47 },
  rhr: { 37: 66, 38: 68, 39: 67 },
  resp: { 37: 17.4, 38: 17.8, 39: 17.5 },
  temp: { 37: 34.2, 38: 34.4, 39: 34.3 },
};

function seriesWith(
  patches: Partial<Record<Metric, Record<number, number>>>,
): MetricSeries {
  return new Map(
    (Object.keys(CALM) as Metric[]).map(metric => {
      const patch = patches[metric] ?? {};
      return [
        metric,
        new Map(
          CALM[metric].map((value, index) => [
            addDays(START, index),
            patch[index] ?? value,
          ]),
        ),
      ];
    }),
  ) as MetricSeries;
}

/** Gibt den Schlüssel samt Argumenten zurück — geprüft wird die Verdrahtung. */
const t = ((key: string, options?: Record<string, unknown>) =>
  options === undefined
    ? key
    : `${key}(${JSON.stringify(options)})`) as unknown as TFunction;

function input(overrides: Partial<NoticeInput> = {}): NoticeInput {
  return {
    t,
    series: seriesWith({}),
    annotations: [],
    referenceDate: REFERENCE,
    today: REFERENCE,
    hasData: true,
    dismissed: new Set<string>(),
    formatDate: date => String(date),
    ...overrides,
  };
}

function annotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'a1',
    type: 'sick',
    startTs: Date.parse('2026-07-08T12:00:00Z') / 1000,
    endTs: null,
    tzOffsetSeconds: 0,
    note: null,
    ...overrides,
  };
}

describe('Hinweise', () => {
  it('schweigt ohne Daten', () => {
    expect(
      buildNotices(input({ series: seriesWith(SICK_PATCH), hasData: false })),
    ).toEqual([]);
  });

  it('schweigt, solange die Werte im Rahmen liegen', () => {
    expect(buildNotices(input())).toEqual([]);
  });

  it('meldet einen Verdacht mit Begründung und zwei Handlungen', () => {
    const [notice] = buildNotices(input({ series: seriesWith(SICK_PATCH) }));

    expect(notice.id).toBe(`illness:${addDays(START, 37)}`);
    expect(notice.buttons.map(button => button.key)).toEqual([
      'mark',
      'dismiss',
    ]);
    // Die Begründung nennt die Größen, nicht nur ein Urteil.
    expect(notice.detail).toContain('health.short.hrv');
  });

  it('markiert offen, solange der Verdacht bis an den Stichtag reicht', () => {
    const [notice] = buildNotices(input({ series: seriesWith(SICK_PATCH) }));
    const mark = notice.buttons.find(button => button.key === 'mark');

    expect(mark?.action).toEqual({
      kind: 'markSick',
      from: addDays(START, 37),
      to: null,
    });
  });

  it('markiert geschlossen, wenn der Verdacht vorbei ist', () => {
    const [notice] = buildNotices(
      input({
        series: seriesWith({
          hrv: { 34: 48, 35: 45 },
          rhr: { 34: 66, 35: 68 },
          temp: { 34: 34.2, 35: 34.4 },
        }),
      }),
    );
    const mark = notice.buttons.find(button => button.key === 'mark');

    expect(mark?.action).toEqual({
      kind: 'markSick',
      from: addDays(START, 34),
      to: addDays(START, 35),
    });
  });

  it('zeigt einen weggewischten Verdacht nicht erneut', () => {
    const dismissed = new Set([`illness:${addDays(START, 37)}`]);
    expect(
      buildNotices(input({ series: seriesWith(SICK_PATCH), dismissed })),
    ).toEqual([]);
  });

  it('erinnert an eine laufende Markierung und bietet ihr Ende an', () => {
    const open = annotation();
    const [notice] = buildNotices(
      input({ series: seriesWith(SICK_PATCH), annotations: [open] }),
    );

    expect(notice.id).toBe('sick-open:a1');
    expect(notice.buttons[0].action).toEqual({
      kind: 'endSick',
      id: 'a1',
      to: REFERENCE,
    });
  });

  it('meldet keinen Verdacht für Tage, die schon markiert sind', () => {
    const notices = buildNotices(
      input({ series: seriesWith(SICK_PATCH), annotations: [annotation()] }),
    );

    // Nur die Erinnerung an die offene Markierung, kein zweiter Verdacht.
    expect(notices).toHaveLength(1);
    expect(notices[0].id).toBe('sick-open:a1');
  });
});
