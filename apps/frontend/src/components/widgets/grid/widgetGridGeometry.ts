import type { WidgetPlacement } from '@/types/widget';
import { GRID_COLUMNS } from './widgetGridModel';

export type Point = { x: number; y: number };
export type GridGeometry = {
  height: number;
  rowHeights: number[];
  rowTops: number[];
  unitWidth: number;
};

export function buildGridGeometry(
  placements: WidgetPlacement[],
  measuredHeights: ReadonlyMap<string, number>,
  containerWidth: number,
  dragging: boolean,
  gap: number,
  emptyRowHeight: number,
  virtualRows: number,
): GridGeometry {
  const contentRows = placements.reduce(
    (max, placement) => Math.max(max, placement.row + 1),
    1,
  );
  const rowCount = contentRows + (dragging ? virtualRows : 0);
  const rowHeights = Array<number>(rowCount).fill(emptyRowHeight);
  placements.forEach(placement => {
    rowHeights[placement.row] = Math.max(
      rowHeights[placement.row],
      measuredHeights.get(placement.id) ?? emptyRowHeight,
    );
  });
  const rowTops: number[] = [];
  rowHeights.forEach((height, row) => {
    rowTops[row] = row === 0 ? 0 : rowTops[row - 1] + rowHeights[row - 1] + gap;
  });
  return {
    height: rowTops[rowCount - 1] + rowHeights[rowCount - 1],
    rowHeights,
    rowTops,
    unitWidth: (containerWidth - (GRID_COLUMNS - 1) * gap) / GRID_COLUMNS,
  };
}

export function placementPoint(
  placement: WidgetPlacement,
  geometry: GridGeometry,
  gap: number,
): Point {
  return {
    x: placement.column * (geometry.unitWidth + gap),
    y: geometry.rowTops[placement.row] ?? 0,
  };
}
