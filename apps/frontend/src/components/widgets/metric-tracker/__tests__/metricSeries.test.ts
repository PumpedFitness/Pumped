import { bucketStart, buildMetricSeries } from '../metricSeries';
import { parseMetricTrackerConfig } from '../metricTrackerConfig';

// Wednesday 2026-10-07, 15:00 local time.
const NOW = new Date(2026, 9, 7, 15).getTime();

function at(month: number, day: number, hour = 12): number {
  return new Date(2026, month, day, hour).getTime();
}

describe('bucketStart', () => {
  it('starts weeks on Monday at local midnight', () => {
    expect(bucketStart(NOW, 'week')).toBe(new Date(2026, 9, 5).getTime());
  });

  it('starts months on the first', () => {
    expect(bucketStart(NOW, 'month')).toBe(new Date(2026, 9, 1).getTime());
  });
});

describe('buildMetricSeries', () => {
  it('sums event samples per week and keeps empty weeks at zero', () => {
    const series = buildMetricSeries(
      [
        { t: at(9, 6), value: 2 },
        { t: at(9, 7, 9), value: 3 },
        { t: at(8, 22), value: 4 },
      ],
      { range: '1m', bucket: 'week', aggregation: 'sum', now: NOW },
    );
    const values = series.points.map(point => point.value);
    expect(values[values.length - 1]).toBe(5);
    expect(values[values.length - 2]).toBe(0);
    expect(values[values.length - 3]).toBe(4);
    expect(series.current).toBe(5);
    expect(series.previous).toBe(0);
  });

  it('leaves measurement buckets without samples empty', () => {
    const series = buildMetricSeries(
      [
        { t: at(8, 1), value: 80 },
        { t: at(9, 1), value: 79 },
        { t: at(9, 3), value: 78 },
      ],
      { range: '3m', bucket: 'month', aggregation: 'avg', now: NOW },
    );
    expect(series.points.map(point => point.value)).toEqual([null, 80, 78.5]);
    expect(series.current).toBe(78.5);
    expect(series.previous).toBe(80);
  });

  it('ignores samples outside the range and after now', () => {
    const series = buildMetricSeries(
      [
        { t: at(0, 1), value: 100 },
        { t: at(9, 8), value: 100 },
        { t: at(9, 7, 8), value: 60 },
      ],
      { range: '1m', bucket: 'day', aggregation: 'max', now: NOW },
    );
    expect(series.current).toBe(60);
    expect(series.previous).toBeNull();
    expect(series.points[series.points.length - 1].start).toBe(
      new Date(2026, 9, 7).getTime(),
    );
  });
});

describe('parseMetricTrackerConfig', () => {
  it('falls back for unknown values and repairs the bucket to the range', () => {
    expect(
      parseMetricTrackerConfig({
        metric: 'nope',
        chart: 'pie',
        range: '1y',
        bucket: 'day',
        exerciseId: 7,
      }),
    ).toEqual({
      metric: 'tonnage',
      exerciseId: null,
      chart: 'bar',
      range: '1y',
      bucket: 'month',
    });
  });
});
