import {
  DEFAULT_SCALE,
  DEFAULT_THRESHOLDS,
  normalizeScale,
  normalizeThresholds,
  SCALE_MAX,
  SCALE_MIN,
  scoreLabel,
  setThreshold,
  thresholdBounds,
} from '../algorithms/scoreScale';

describe('scoreLabel', () => {
  it('uses the shipped cuts when none are given', () => {
    expect(scoreLabel(80)).toBe('PRIMED');
    expect(scoreLabel(79)).toBe('READY');
    expect(scoreLabel(45)).toBe('MODERATE');
    expect(scoreLabel(29)).toBe('DEPLETED');
  });

  it('follows custom cuts', () => {
    const lenient = { PRIMED: 72, READY: 60, MODERATE: 40, STRAINED: 25 };
    expect(scoreLabel(61, lenient)).toBe('READY');
    expect(scoreLabel(61)).toBe('MODERATE');
  });
});

describe('thresholdBounds', () => {
  it('pens each cut between its neighbours', () => {
    expect(thresholdBounds(DEFAULT_THRESHOLDS, 'READY')).toEqual({
      min: 46,
      max: 79,
    });
  });

  it('opens the outer edges to the score range', () => {
    expect(thresholdBounds(DEFAULT_THRESHOLDS, 'PRIMED').max).toBe(99);
    expect(thresholdBounds(DEFAULT_THRESHOLDS, 'STRAINED').min).toBe(1);
  });
});

describe('setThreshold', () => {
  it('clamps rather than pushing a neighbour out of the way', () => {
    const next = setThreshold(DEFAULT_THRESHOLDS, 'READY', 95);
    expect(next.READY).toBe(79);
    expect(next.PRIMED).toBe(80);
  });

  it('keeps the other cuts untouched', () => {
    const next = setThreshold(DEFAULT_THRESHOLDS, 'MODERATE', 50);
    expect(next).toEqual({ ...DEFAULT_THRESHOLDS, MODERATE: 50 });
  });
});

describe('normalizeThresholds', () => {
  it('repairs a stored set that no longer descends', () => {
    const repaired = normalizeThresholds({
      PRIMED: 40,
      READY: 60,
      MODERATE: 70,
      STRAINED: 80,
    });
    expect(repaired.PRIMED).toBeGreaterThan(repaired.READY);
    expect(repaired.READY).toBeGreaterThan(repaired.MODERATE);
    expect(repaired.MODERATE).toBeGreaterThan(repaired.STRAINED);
  });

  it('falls back to the defaults for junk', () => {
    expect(normalizeThresholds(null)).toEqual(DEFAULT_THRESHOLDS);
    expect(normalizeThresholds('80')).toEqual(DEFAULT_THRESHOLDS);
  });

  it('fills a missing cut from the defaults', () => {
    expect(normalizeThresholds({ PRIMED: 90 }).READY).toBe(
      DEFAULT_THRESHOLDS.READY,
    );
  });
});

describe('normalizeScale', () => {
  it('holds the slider inside a readable range', () => {
    expect(normalizeScale(1)).toBe(SCALE_MIN);
    expect(normalizeScale(999)).toBe(SCALE_MAX);
    expect(normalizeScale(16.4)).toBe(16);
  });

  it('falls back for a missing value', () => {
    expect(normalizeScale(undefined)).toBe(DEFAULT_SCALE);
    expect(normalizeScale(Number.NaN)).toBe(DEFAULT_SCALE);
  });
});
