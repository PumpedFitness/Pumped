import { spacing } from '@pumped/ui/theme/tokens';
import type { WidgetPlacement } from '@/types/widget';
import {
  placementPoint as resolvePlacementPoint,
  type GridGeometry,
  type Point,
} from './widgetGridGeometry';

export const GAP = spacing[3];

/** Height of a row that holds no widget at all — only reachable mid-drag. */
export const EMPTY_ROW_HEIGHT = 112;

/** Spare row below the content, so a widget can be dragged past the last one. */
export const VIRTUAL_ROWS = 1;

export const ACTIVE_LAYER = { zIndex: 100, elevation: 12 };
export const INACTIVE_LAYER = { zIndex: 0, elevation: 0 };

/** `placementPoint` with the grid's own gap already applied. */
export function placementPoint(
  placement: WidgetPlacement,
  geometry: GridGeometry,
): Point {
  return resolvePlacementPoint(placement, geometry, GAP);
}
