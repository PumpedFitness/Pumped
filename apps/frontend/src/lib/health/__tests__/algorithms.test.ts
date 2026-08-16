import {
  addDays,
  civilDateFromEpoch,
  daysBetween,
  type CivilDate,
} from '../civilDate';
import type { Annotation } from '../algorithms/annotations';
import { baselineStats, history, summarise } from '../algorithms/baseline';
import { score } from '../algorithms/estimator';
import {
  cloneParams,
  DEFAULT_PARAMS,
  HANDOFF_PARAMS,
  paramsFingerprint,
  ROBUST_PARAMS,
} from '../algorithms/params';
import { DEFAULT_SETTINGS, setWeight } from '../algorithms/settings';
import type { Metric, MetricSeries } from '../metrics';
import { spanInDays } from '../stats/series';

const START: CivilDate = 20260601;

function valuesFrom(values: readonly number[], from: CivilDate = START) {
  return new Map(values.map((value, index) => [addDays(from, index), value]));
}

/** Eine Reihe konstanter Länge, die überall die Mindestmenge überschreitet. */
function flatSeries(overrides: Partial<Record<Metric, number[]>> = {}) {
  const base: Record<Metric, number[]> = {
    hrv: Array.from({ length: 20 }, (_, i) => 80 + (i % 5)),
    rhr: Array.from({ length: 20 }, (_, i) => 55 + (i % 4)),
    sleepScore: Array.from({ length: 20 }, (_, i) => 70 + (i % 5) * 3),
    sleep: Array.from({ length: 20 }, (_, i) => 7 + (i % 3) * 0.4),
    deep: Array.from({ length: 20 }, (_, i) => 60 + (i % 4) * 6),
    resp: Array.from({ length: 20 }, (_, i) => 15 + (i % 3) * 0.2),
    temp: Array.from({ length: 20 }, (_, i) => 33 + (i % 3) * 0.1),
  };
  const merged = { ...base, ...overrides };
  return new Map(
    (Object.keys(merged) as Metric[]).map(metric => [
      metric,
      valuesFrom(merged[metric]),
    ]),
  ) as MetricSeries;
}

const REFERENCE = { date: addDays(START, 19), daysStale: 0 };

function annotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'annotation-1',
    type: 'sick',
    startTs: Date.parse('2026-06-10T12:00:00Z') / 1000,
    endTs: Date.parse('2026-06-10T20:00:00Z') / 1000,
    tzOffsetSeconds: 0,
    note: null,
    ...overrides,
  };
}

describe('CivilDate', () => {
  it('rechnet über Monatsgrenzen in Kalendertagen', () => {
    expect(daysBetween(20250131, 20250201)).toBe(1);
    expect(addDays(20251231, 1)).toBe(20260101);
    expect(addDays(20260301, -1)).toBe(20260228);
  });

  it('datiert eine Nacht auf den Morgen in der Zone der Messung', () => {
    // 2026-06-15T05:15Z bei +2 h ist lokal der 15. um 07:15.
    const epoch = Date.parse('2026-06-15T05:15:13Z') / 1000;
    expect(civilDateFromEpoch(epoch, 7200)).toBe(20260615);
    // Dieselbe Sekunde bei −8 h ist noch der 14.
    expect(civilDateFromEpoch(epoch, -8 * 3600)).toBe(20260614);
  });

  it('zählt die Spanne über eine Sommerzeitgrenze ohne verlorene Stunde', () => {
    // In Europa wird in der Nacht auf den 29.03.2026 umgestellt.
    expect(spanInDays(valuesFrom([1, 2, 3, 4], 20260327))).toBe(4);
    expect(daysBetween(20260327, 20260331)).toBe(4);
  });
});

describe('Baseline', () => {
  it('schließt den Stichtag aus und fenstert vor dem Annotationsfilter', () => {
    const values = valuesFrom(Array.from({ length: 80 }, (_, i) => i + 1));
    const reference = addDays(START, 79);
    const windowed = history(values, 'hrv', reference, HANDOFF_PARAMS, []);

    expect(windowed).toHaveLength(60);
    expect(windowed).not.toContain(80);
    expect(windowed[0]).toBe(79);
  });

  it('lässt annotierte Tage wegfallen, ohne ältere nachrücken zu lassen', () => {
    const values = valuesFrom(Array.from({ length: 80 }, (_, i) => i + 1));
    const reference = addDays(START, 79);
    const params = { ...HANDOFF_PARAMS, excludeAnnotated: true };
    const sick = annotation({
      startTs: Date.parse('2026-08-01T00:00:00Z') / 1000,
      endTs: Date.parse('2026-08-01T23:00:00Z') / 1000,
    });

    const withAnnotation = history(values, 'hrv', reference, params, [sick]);
    expect(withAnnotation).toHaveLength(59);
  });

  it('nimmt Verletzungen nicht aus der Baseline, Krankheit schon', () => {
    const values = valuesFrom(Array.from({ length: 30 }, (_, i) => i + 1));
    const reference = addDays(START, 29);
    const params = { ...HANDOFF_PARAMS, excludeAnnotated: true };

    const injury = annotation({ type: 'injury' });
    const sick = annotation({ type: 'sick' });

    expect(history(values, 'hrv', reference, params, [injury])).toHaveLength(
      29,
    );
    expect(history(values, 'hrv', reference, params, [sick])).toHaveLength(28);
  });

  it('deckelt eine offene Annotation auf 14 Tage', () => {
    const values = valuesFrom(Array.from({ length: 60 }, (_, i) => i + 1));
    const reference = addDays(START, 59);
    const params = { ...HANDOFF_PARAMS, excludeAnnotated: true };
    const open = annotation({
      startTs: Date.parse('2026-06-02T00:00:00Z') / 1000,
      endTs: null,
    });

    // 15 Tage abgedeckt (Start + 14), nicht die ganze Historie.
    expect(history(values, 'hrv', reference, params, [open])).toHaveLength(
      59 - 15,
    );
  });

  it('prüft die Mindestmenge vor dem Ausreißerverwurf', () => {
    const thirteen = valuesFrom(Array.from({ length: 13 }, (_, i) => 50 + i));
    const fourteen = valuesFrom(Array.from({ length: 14 }, (_, i) => 50 + i));
    const reference = addDays(START, 40);

    expect(
      baselineStats(thirteen, 'hrv', reference, HANDOFF_PARAMS, []),
    ).toBeNull();
    expect(
      history(thirteen, 'hrv', reference, HANDOFF_PARAMS, []),
    ).toHaveLength(13);
    expect(
      baselineStats(fourteen, 'hrv', reference, HANDOFF_PARAMS, []),
    ).not.toBeNull();
  });

  it('zählt nach dem Ausreißerverwurf und darf dabei unter 15 fallen', () => {
    const values = valuesFrom([
      ...Array.from({ length: 14 }, (_, i) => 50 + i),
      5000,
    ]);
    const stats = baselineStats(
      values,
      'hrv',
      addDays(START, 40),
      { ...HANDOFF_PARAMS, outlierReject: true },
      [],
    );
    // 15 Werte gingen in die Prüfung, 14 in den Fit.
    expect(stats?.count).toBe(14);
    expect(stats?.center).toBeCloseTo(56.5, 10);
  });

  it('gibt null zurück, wenn die Historie nicht streut', () => {
    const values = valuesFrom(Array.from({ length: 20 }, () => 50));
    expect(
      baselineStats(values, 'hrv', addDays(START, 40), HANDOFF_PARAMS, []),
    ).toBeNull();
  });

  it('fällt von MAD auf SD zurück, wenn der MAD null ist', () => {
    // Über die Hälfte identisch: der MAD wird 0, obwohl die Werte streuen.
    const values = [54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 50, 58, 62];
    expect(summarise(values, 'median', 'mad').spread).toBeGreaterThan(0);

    const stats = baselineStats(
      valuesFrom(values),
      'rhr',
      addDays(START, 40),
      ROBUST_PARAMS,
      [],
    );
    expect(stats).not.toBeNull();
  });

  it('bildet die Stichproben-SD um die gewählte Mitte', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    // n − 1 im Nenner, nicht n.
    expect(summarise(values, 'mean', 'sd').spread).toBeCloseTo(2.13809, 4);
  });
});

describe('Estimator', () => {
  it('renormalisiert die Restgewichte, statt Lücken als Verschlechterung zu werten', () => {
    const full = score({
      settings: DEFAULT_SETTINGS,
      series: flatSeries(),
      annotations: [],
      referenceDate: REFERENCE,
    });

    // Atemfrequenz zu dünn: fällt raus, die übrigen tragen 1.0.
    const thin = score({
      settings: DEFAULT_SETTINGS,
      series: flatSeries({ resp: [15, 15.2, 15.4] }),
      annotations: [],
      referenceDate: REFERENCE,
    });

    expect(full.droppedWeight).toBe(0);
    expect(thin.droppedWeight).toBeCloseTo(0.05, 6);
    expect(thin.droppedWeightFraction).toBeCloseTo(0.05, 6);
    const used = thin.contributions
      .filter(entry => entry.contributes)
      .reduce((sum, entry) => sum + entry.weight, 0);
    expect(used).toBeCloseTo(1, 10);
  });

  it('unterscheidet fehlende Gewichte von fehlenden Daten', () => {
    const zeroed = score({
      settings: {
        ...DEFAULT_SETTINGS,
        modelId: 'custom',
        customWeights: { hrv: 0, rhr: 0, sleep: 0, resp: 0 },
      },
      series: flatSeries(),
      annotations: [],
      referenceDate: REFERENCE,
    });
    expect(zeroed.score).toBeNull();
    expect(zeroed.unavailableReason).toBe('no_weights');

    const starved = score({
      settings: DEFAULT_SETTINGS,
      series: flatSeries({
        hrv: [80],
        rhr: [55],
        sleepScore: [70],
        resp: [15],
      }),
      annotations: [],
      referenceDate: REFERENCE,
    });
    expect(starved.score).toBeNull();
    expect(starved.unavailableReason).toBe('insufficient_data');
    expect(starved.droppedWeight).toBeCloseTo(1, 10);
  });

  it('gewichtet die Nachtnote statt der bloßen Schlafdauer', () => {
    // Der Punkt des Umbaus: Eine Nacht, die gleich lang ist wie sonst, aber
    // schlechter aufgebaut (wenig REM, unruhig), muss die Readiness senken.
    // Über die Dauer allein wäre sie nicht von einer guten zu unterscheiden.
    const usual = score({
      settings: DEFAULT_SETTINGS,
      series: flatSeries(),
      annotations: [],
      referenceDate: REFERENCE,
    });

    const poorNight = flatSeries();
    const scores = new Map(poorNight.get('sleepScore'));
    scores.set(REFERENCE.date, 40);
    const worse = score({
      settings: DEFAULT_SETTINGS,
      series: new Map(poorNight).set('sleepScore', scores),
      annotations: [],
      referenceDate: REFERENCE,
    });

    expect(worse.score).toBeLessThan(usual.score as number);

    // Die Dauer selbst trägt kein Gewicht mehr, bleibt aber als Beobachtung
    // sichtbar — sonst zählte sie zweimal, roh und in der Note.
    const weighted = worse.contributions.map(entry => entry.metric);
    expect(weighted).toContain('sleepScore');
    expect(weighted).not.toContain('sleep');
  });

  it('lässt die übergebenen Parameter unangetastet', () => {
    const params = cloneParams(HANDOFF_PARAMS);
    score({
      settings: { ...DEFAULT_SETTINGS, modelId: 'rec', params },
      series: flatSeries(),
      annotations: [],
      referenceDate: REFERENCE,
    });
    // `rec` logarithmiert HRV — aber nur in seiner eigenen Kopie.
    expect(params.logTransform.size).toBe(0);
    expect(HANDOFF_PARAMS.logTransform.size).toBe(0);
  });

  it('rechnet das Normalband log-transformierter Metriken zurück', () => {
    const result = score({
      settings: { ...DEFAULT_SETTINGS, modelId: 'rec' },
      series: flatSeries(),
      annotations: [],
      referenceDate: REFERENCE,
    });
    const hrv = result.contributions.find(entry => entry.metric === 'hrv');

    expect(hrv?.isLogTransformed).toBe(true);
    // Zurückgerechnet liegt das Band wieder in Millisekunden, nicht bei ln(80).
    expect(hrv?.usualRange?.center).toBeGreaterThan(70);
    expect(hrv?.usualRange?.center).toBeLessThan(90);
  });

  it('führt Stichtag, Version und Parameter-Fingerabdruck mit', () => {
    const result = score({
      settings: DEFAULT_SETTINGS,
      series: flatSeries(),
      annotations: [],
      referenceDate: REFERENCE,
    });
    expect(result.referenceDate).toEqual(REFERENCE);
    expect(result.logicVersion).toBe(1);
    // `ann=1`: Der Auslieferungszustand nimmt markierte Tage aus der Referenz,
    // anders als das Handoff-Preset daneben.
    expect(result.paramsFingerprint).toBe(
      'c=mean;s=sd;log=hrv;ann=1;w=60;out=0',
    );
    // Ein verändertes Handoff-Preset ist unterscheidbar.
    expect(paramsFingerprint(HANDOFF_PARAMS)).not.toBe(
      paramsFingerprint({ ...HANDOFF_PARAMS, excludeAnnotated: true }),
    );
    expect(paramsFingerprint(DEFAULT_PARAMS)).not.toBe(
      paramsFingerprint(HANDOFF_PARAMS),
    );
  });
});

describe('Einstellungen', () => {
  it('friert beim Wechsel auf Custom Gewichte und beide Schalter ein', () => {
    const fromSleepLed = setWeight(
      { ...DEFAULT_SETTINGS, modelId: 'slp' },
      'hrv',
      0.3,
    );
    expect(fromSleepLed.modelId).toBe('custom');
    expect(fromSleepLed.customAppliesSleepDebt).toBe(true);
    expect(fromSleepLed.customWeights.sleepScore).toBe(0.5);
    expect(fromSleepLed.customWeights.hrv).toBe(0.3);

    const fromRecovery = setWeight(
      { ...DEFAULT_SETTINGS, modelId: 'rec' },
      'rhr',
      0.1,
    );
    expect(fromRecovery.customUsesLogHRV).toBe(true);
  });

  it('lässt das verlassene Preset unverändert', () => {
    setWeight({ ...DEFAULT_SETTINGS, modelId: 'slp' }, 'hrv', 0.9);
    const untouched = score({
      settings: { ...DEFAULT_SETTINGS, modelId: 'slp' },
      series: flatSeries(),
      annotations: [],
      referenceDate: REFERENCE,
    });
    const hrv = untouched.contributions.find(entry => entry.metric === 'hrv');
    expect(hrv?.weight).toBeCloseTo(0.25, 10);
  });
});
