import type { WidgetPlacement } from '@/types/widget';

export const GRID_COLUMNS = 3;

export type GridCell = {
  widgetId: string;
  anchor: boolean;
} | null;

export type OccupancyGrid = GridCell[][];

type GridTarget = { row: number; column: number };

function clampColumn(column: number, colSpan: number): number {
  return Math.max(0, Math.min(GRID_COLUMNS - colSpan, column));
}

function cellsFor(placement: WidgetPlacement): GridTarget[] {
  return Array.from({ length: placement.colSpan }, (_, offset) => ({
    row: placement.row,
    column: placement.column + offset,
  }));
}

function overlaps(left: WidgetPlacement, right: WidgetPlacement): boolean {
  if (left.row !== right.row) return false;
  return (
    left.column < right.column + right.colSpan &&
    left.column + left.colSpan > right.column
  );
}

function firstAvailablePlacement(
  placement: WidgetPlacement,
  occupied: WidgetPlacement[],
): WidgetPlacement {
  const startIndex = placement.row * GRID_COLUMNS + placement.column;
  for (let index = startIndex; ; index += 1) {
    const row = Math.floor(index / GRID_COLUMNS);
    const column = index % GRID_COLUMNS;
    if (column + placement.colSpan > GRID_COLUMNS) continue;
    const candidate = { ...placement, row, column };
    if (!occupied.some(item => overlaps(candidate, item))) return candidate;
  }
}

export function createOccupancyGrid(
  placements: WidgetPlacement[],
  minimumRows = 0,
): OccupancyGrid {
  const rowCount = Math.max(
    minimumRows,
    placements.reduce((max, placement) => Math.max(max, placement.row + 1), 0),
  );
  const grid = Array.from({ length: rowCount }, () =>
    Array<GridCell>(GRID_COLUMNS).fill(null),
  );
  placements.forEach(placement => {
    cellsFor(placement).forEach(({ row, column }, offset) => {
      if (!grid[row]) return;
      grid[row][column] = { widgetId: placement.id, anchor: offset === 0 };
    });
  });
  return grid;
}

export function packPlacements(
  placements: Array<Omit<WidgetPlacement, 'row' | 'column'>>,
): WidgetPlacement[] {
  let row = 0;
  let column = 0;
  return placements.map(placement => {
    if (column + placement.colSpan > GRID_COLUMNS) {
      row += 1;
      column = 0;
    }
    const positioned = { ...placement, row, column };
    column += placement.colSpan;
    return positioned;
  });
}

export function removeLeadingEmptyRows(
  placements: WidgetPlacement[],
): WidgetPlacement[] {
  const firstOccupiedRow = placements.reduce(
    (minimum, placement) => Math.min(minimum, placement.row),
    Number.POSITIVE_INFINITY,
  );
  if (!Number.isFinite(firstOccupiedRow) || firstOccupiedRow === 0) {
    return placements;
  }
  return placements.map(placement => ({
    ...placement,
    row: placement.row - firstOccupiedRow,
  }));
}

export function moveWidgetToTarget(
  placements: WidgetPlacement[],
  widgetId: string,
  target: GridTarget,
): WidgetPlacement[] {
  const moving = placements.find(item => item.id === widgetId);
  if (!moving) return placements;

  const placedMoving = {
    ...moving,
    row: Math.max(0, target.row),
    column: clampColumn(target.column, moving.colSpan),
  };
  const resolved: WidgetPlacement[] = [placedMoving];

  placements.forEach(placement => {
    if (placement.id === widgetId) return;
    resolved.push(
      resolved.some(item => overlaps(placement, item))
        ? firstAvailablePlacement(placement, resolved)
        : placement,
    );
  });

  const byId = new Map(resolved.map(placement => [placement.id, placement]));
  return removeLeadingEmptyRows(
    placements.map(placement => byId.get(placement.id) ?? placement),
  );
}

export function targetColumnFromCenter(
  centerX: number,
  unitWidth: number,
  gap: number,
  colSpan: number,
): number {
  const centerColumn = centerX / (unitWidth + gap);
  return clampColumn(Math.round(centerColumn - (colSpan - 1) / 2), colSpan);
}

export function targetRowFromCenter(
  centerY: number,
  rowTops: number[],
  rowHeights: number[],
): number {
  for (let row = 0; row < rowTops.length; row += 1) {
    const midpoint = rowTops[row] + rowHeights[row] / 2;
    const nextMidpoint =
      row === rowTops.length - 1
        ? Number.POSITIVE_INFINITY
        : (rowTops[row + 1] + rowTops[row] + rowHeights[row]) / 2;
    if (centerY < nextMidpoint || centerY <= midpoint) return row;
  }
  return Math.max(0, rowTops.length - 1);
}
