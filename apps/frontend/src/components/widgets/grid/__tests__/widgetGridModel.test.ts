import {
  createOccupancyGrid,
  moveWidgetToTarget,
  packPlacements,
  removeLeadingEmptyRows,
  targetColumnFromCenter,
  targetRowFromCenter,
} from '../widgetGridModel';
import type { WidgetPlacement } from '@/types/widget';

const placements: WidgetPlacement[] = [
  { id: 'wide', type: 'streakWide', colSpan: 2, row: 0, column: 0 },
  { id: 'small', type: 'timeCompact', colSpan: 1, row: 0, column: 2 },
  { id: 'chart', type: 'trendWide', colSpan: 2, row: 1, column: 0 },
];

describe('widgetGridModel', () => {
  it('packs legacy ordered widgets across three columns', () => {
    expect(
      packPlacements(
        placements.map(({ row: _row, column: _column, ...item }) => item),
      ),
    ).toEqual(placements);
  });

  it('derives occupied and empty cells', () => {
    const grid = createOccupancyGrid(placements, 3);
    expect(grid[0].map(cell => cell?.widgetId ?? null)).toEqual([
      'wide',
      'wide',
      'small',
    ]);
    expect(grid[1][2]).toBeNull();
    expect(grid[2]).toEqual([null, null, null]);
  });

  it('places into an empty row without compacting the gap', () => {
    const result = moveWidgetToTarget(placements, 'small', {
      row: 3,
      column: 1,
    });
    expect(result.find(item => item.id === 'small')).toMatchObject({
      row: 3,
      column: 1,
    });
    expect(result.find(item => item.id === 'chart')).toMatchObject({ row: 1 });
  });

  it('pushes collisions forward while preserving widget identity order', () => {
    const result = moveWidgetToTarget(placements, 'chart', {
      row: 0,
      column: 0,
    });
    expect(result).toEqual([
      { ...placements[0], row: 1, column: 0 },
      placements[1],
      { ...placements[2], row: 0, column: 0 },
    ]);
  });

  it('removes an empty leading row while preserving relative spacing', () => {
    const shifted = removeLeadingEmptyRows([
      { ...placements[0], row: 2 },
      { ...placements[1], row: 2 },
      { ...placements[2], row: 4 },
    ]);
    expect(shifted.map(item => item.row)).toEqual([0, 0, 2]);
  });

  it('cannot create an empty top row by moving its only widget down', () => {
    const fullWidth: WidgetPlacement[] = [
      { id: 'full', type: 'trendFull', colSpan: 3, row: 0, column: 0 },
      { id: 'small', type: 'timeCompact', colSpan: 1, row: 1, column: 0 },
    ];
    const result = moveWidgetToTarget(fullWidth, 'full', {
      row: 3,
      column: 0,
    });
    expect(result.find(item => item.id === 'small')?.row).toBe(0);
    expect(result.find(item => item.id === 'full')?.row).toBe(2);
  });

  it('maps a widget center to valid anchors and virtual rows', () => {
    expect(targetColumnFromCenter(250, 100, 12, 2)).toBe(1);
    expect(targetColumnFromCenter(0, 100, 12, 2)).toBe(0);
    expect(targetRowFromCenter(350, [0, 120, 240], [108, 108, 108])).toBe(2);
  });
});
