import { buildUsageMap, usageNamePreview, type UsageRow } from '../usageModel';

const row = (
  itemId: string,
  refName: string,
  activeScheduleName: string | null = null,
): UsageRow => ({ itemId, refName, activeScheduleName });

describe('buildUsageMap', () => {
  it('leaves unreferenced items out of the map', () => {
    expect(buildUsageMap([]).get('template-1')).toBeUndefined();
  });

  it('collects distinct reference names alphabetically', () => {
    const usage = buildUsageMap([
      row('template-1', 'Cut'),
      row('template-1', 'Push Pull Legs'),
      // Same schedule planning the template on two days counts once.
      row('template-1', 'Cut'),
    ]);

    expect(usage.get('template-1')).toEqual({
      names: ['Cut', 'Push Pull Legs'],
      activeScheduleName: null,
    });
  });

  it('keeps the active schedule regardless of the row order', () => {
    const usage = buildUsageMap([
      row('exercise-1', 'Leg Day'),
      row('exercise-1', 'Push Day', 'Push Pull Legs'),
    ]);

    expect(usage.get('exercise-1')?.activeScheduleName).toBe('Push Pull Legs');
  });

  it('keys every referenced item separately', () => {
    const usage = buildUsageMap([
      row('exercise-1', 'Push Day'),
      row('exercise-2', 'Leg Day'),
    ]);

    expect([...usage.keys()].sort()).toEqual(['exercise-1', 'exercise-2']);
  });
});

describe('usageNamePreview', () => {
  it('spells out short lists in full', () => {
    expect(usageNamePreview(['A', 'B'])).toEqual({ list: 'A, B', overflow: 0 });
  });

  it('caps long lists and reports the leftover count', () => {
    expect(usageNamePreview(['A', 'B', 'C', 'D', 'E'])).toEqual({
      list: 'A, B, C',
      overflow: 2,
    });
  });
});
