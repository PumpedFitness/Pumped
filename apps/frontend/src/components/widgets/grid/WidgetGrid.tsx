import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { WidgetPlacement } from '@/types/widget';
import { GridContent } from './GridContent';
import {
  EMPTY_ROW_HEIGHT,
  GAP,
  placementPoint,
  VIRTUAL_ROWS,
} from './gridConstants';
import {
  moveWidgetToTarget,
  targetColumnFromCenter,
  targetRowFromCenter,
} from './widgetGridModel';
import {
  buildGridGeometry,
  type GridGeometry,
  type Point,
} from './widgetGridGeometry';
import { useMeasuredWidgetHeights } from './useMeasuredWidgetHeights';
import {
  estimateWidgetHeight,
  GridMeasureShell,
  GridSkeletonOverlay,
  useDeferredMount,
  useGridSettled,
} from './WidgetGridSkeleton';

function lastDragTargetRow(layout: WidgetPlacement[]) {
  const contentRows = layout.reduce(
    (max, placement) => Math.max(max, placement.row + 1),
    1,
  );
  return contentRows + VIRTUAL_ROWS - 1;
}

/**
 * The slot a dragged widget is currently over.
 *
 * Module level because it is pure grid maths over its arguments and touches no
 * state — inside the component it was the longest thing between two `useRef`s.
 */
function dragTarget(
  moving: WidgetPlacement,
  center: Point,
  translationX: number,
  translationY: number,
  geometry: GridGeometry,
  maxRow: number,
) {
  return {
    row: Math.min(
      maxRow,
      targetRowFromCenter(
        center.y + translationY,
        geometry.rowTops,
        geometry.rowHeights,
      ),
    ),
    column: targetColumnFromCenter(
      center.x + translationX,
      geometry.unitWidth,
      GAP,
      moving.colSpan,
    ),
  };
}

/** Row tops, row heights and column width for the current layout. */
function useGridGeometry(
  previewLayout: WidgetPlacement[],
  measuredHeights: ReadonlyMap<string, number>,
  containerWidth: number,
  dragging: boolean,
): GridGeometry {
  return useMemo(
    () =>
      buildGridGeometry(
        previewLayout,
        measuredHeights,
        containerWidth,
        dragging,
        GAP,
        EMPTY_ROW_HEIGHT,
        VIRTUAL_ROWS,
        estimateWidgetHeight,
      ),
    [containerWidth, dragging, measuredHeights, previewLayout],
  );
}

type WidgetGridProps = {
  layout: WidgetPlacement[];
  editing: boolean;
  onEditStart: () => void;
  scrollOffset: SharedValue<number>;
  onDragPosition: (absoluteY: number) => void;
  onDragEnd: () => void;
  onLayoutChange: (layout: WidgetPlacement[]) => void;
  onRemove: (id: string) => void;
};

export function WidgetGrid({
  layout,
  editing,
  scrollOffset,
  onEditStart,
  onDragPosition,
  onDragEnd,
  onLayoutChange,
  onRemove,
}: WidgetGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [previewLayout, setPreviewLayout] = useState(layout);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const { heights: measuredHeights, recordHeight } = useMeasuredWidgetHeights();
  const previewRef = useRef(layout);
  const dragBaseRef = useRef(layout);
  const dragCenterRef = useRef<Point | null>(null);
  const dragOriginRef = useRef<Point | null>(null);
  const targetRef = useRef<string | null>(null);
  const maxTargetRowRef = useRef(0);

  useEffect(() => {
    if (!activeIdRef.current) {
      previewRef.current = layout;
      setPreviewLayout(layout);
    }
  }, [layout]);

  const geometry = useGridGeometry(
    previewLayout,
    measuredHeights,
    containerWidth,
    activeId !== null,
  );

  const contentMounted = useDeferredMount();
  const settled =
    useGridSettled(containerWidth, previewLayout, measuredHeights) &&
    contentMounted;

  const placementById = useMemo(
    () => new Map(previewLayout.map(placement => [placement.id, placement])),
    [previewLayout],
  );
  const baseById = new Map(
    dragBaseRef.current.map(placement => [placement.id, placement]),
  );

  const startDrag = useCallback(
    (id: string) => {
      const placement = placementById.get(id);
      if (!placement) return;
      const point = placementPoint(placement, geometry);
      const width =
        placement.colSpan * geometry.unitWidth + (placement.colSpan - 1) * GAP;
      dragBaseRef.current = layout;
      previewRef.current = layout;
      dragCenterRef.current = {
        x: point.x + width / 2,
        y: point.y + (measuredHeights.get(id) ?? EMPTY_ROW_HEIGHT) / 2,
      };
      dragOriginRef.current = point;
      targetRef.current = `${placement.row}:${placement.column}`;
      maxTargetRowRef.current = lastDragTargetRow(layout);
      activeIdRef.current = id;
      setActiveId(id);
      onEditStart();
    },
    [geometry, layout, measuredHeights, onEditStart, placementById],
  );

  const moveDrag = useCallback(
    (id: string, translationX: number, translationY: number) => {
      const center = dragCenterRef.current;
      const moving = dragBaseRef.current.find(placement => placement.id === id);
      if (!center || !moving) return;
      const target = dragTarget(
        moving,
        center,
        translationX,
        translationY,
        geometry,
        maxTargetRowRef.current,
      );
      const targetKey = `${target.row}:${target.column}`;
      if (targetRef.current === targetKey) return;
      targetRef.current = targetKey;
      const next = moveWidgetToTarget(dragBaseRef.current, id, target);
      previewRef.current = next;
      setPreviewLayout(next);
    },
    [geometry],
  );

  const finalizeDrag = useCallback(() => {
    onDragEnd();
    const droppedId = activeIdRef.current;
    activeIdRef.current = null;
    onLayoutChange(previewRef.current);
    setSettlingId(droppedId);
    dragCenterRef.current = null;
    targetRef.current = null;
  }, [onDragEnd, onLayoutChange]);

  const completeSettle = useCallback(() => {
    dragOriginRef.current = null;
    setActiveId(null);
    setSettlingId(null);
  }, []);

  if (containerWidth === 0) {
    return (
      <GridMeasureShell layout={previewLayout} onWidth={setContainerWidth} />
    );
  }

  return (
    <View
      onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
      style={{ height: geometry.height }}
    >
      {/* Held back for one frame so the skeleton paints alone, then mounted
          hidden: a widget that never renders never lays out, so gating it on
          measurement would wait for something that cannot happen. */}
      <View
        style={[StyleSheet.absoluteFill, settled ? null : { opacity: 0 }]}
        pointerEvents={settled ? 'auto' : 'none'}
      >
        {contentMounted ? (
          <GridContent
            activeId={activeId}
            activeOrigin={dragOriginRef.current}
            settlingId={settlingId}
            baseById={baseById}
            editing={editing}
            geometry={geometry}
            measuredHeights={measuredHeights}
            previewLayout={previewLayout}
            onHeight={recordHeight}
            onDragStart={startDrag}
            onDragMove={moveDrag}
            onDragPosition={onDragPosition}
            onDragFinalize={finalizeDrag}
            onSettleComplete={completeSettle}
            onRemove={onRemove}
            scrollOffset={scrollOffset}
          />
        ) : null}
      </View>

      {settled ? null : (
        <GridSkeletonOverlay
          layout={previewLayout}
          containerWidth={containerWidth}
        />
      )}
    </View>
  );
}
