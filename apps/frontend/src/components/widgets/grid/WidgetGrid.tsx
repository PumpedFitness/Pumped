import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { WidgetPlacement } from '@/types/widget';
import { spacing } from '@/theme/tokens';
import { DraggableWidget } from './DraggableWidget';
import { widgetRegistry } from '@/components/widgets/registry';
import {
  createOccupancyGrid,
  moveWidgetToTarget,
  targetColumnFromCenter,
  targetRowFromCenter,
} from './widgetGridModel';
import {
  buildGridGeometry,
  placementPoint as resolvePlacementPoint,
  type GridGeometry,
  type Point,
} from './widgetGridGeometry';
import { useMeasuredWidgetHeights } from './useMeasuredWidgetHeights';

const GAP = spacing[3];
const EMPTY_ROW_HEIGHT = 112;
const VIRTUAL_ROWS = 1;
const POSITION_TRANSITION_MS = 220;
const ACTIVE_LAYER = { zIndex: 100, elevation: 12 };
const INACTIVE_LAYER = { zIndex: 0, elevation: 0 };

function placementPoint(
  placement: WidgetPlacement,
  geometry: GridGeometry,
): Point {
  return resolvePlacementPoint(placement, geometry, GAP);
}

function lastDragTargetRow(layout: WidgetPlacement[]) {
  const contentRows = layout.reduce(
    (max, placement) => Math.max(max, placement.row + 1),
    1,
  );
  return contentRows + VIRTUAL_ROWS - 1;
}

type GridItemProps = {
  placement: WidgetPlacement;
  active: boolean;
  settling: boolean;
  editing: boolean;
  point: Point;
  settlePoint: Point;
  unitWidth: number;
  onHeight: (id: string, event: LayoutChangeEvent) => void;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, translationX: number, translationY: number) => void;
  onDragPosition: (absoluteY: number) => void;
  onDragFinalize: () => void;
  onSettleComplete: () => void;
  onRemove: (id: string) => void;
  scrollOffset: SharedValue<number>;
};

function GridItem({
  placement,
  active,
  settling,
  editing,
  point,
  settlePoint,
  unitWidth,
  onHeight,
  onDragStart,
  onDragMove,
  onDragPosition,
  onDragFinalize,
  onSettleComplete,
  onRemove,
  scrollOffset,
}: GridItemProps) {
  const Component = widgetRegistry[placement.type].component;
  const width = placement.colSpan * unitWidth + (placement.colSpan - 1) * GAP;
  const baseX = useSharedValue(point.x);
  const baseY = useSharedValue(point.y);
  const positionStyle = useAnimatedStyle(() => ({
    left: baseX.value,
    top: baseY.value,
  }));

  useEffect(() => {
    if (active || settling) return;
    baseX.value = withTiming(point.x, { duration: POSITION_TRANSITION_MS });
    baseY.value = withTiming(point.y, { duration: POSITION_TRANSITION_MS });
  }, [active, baseX, baseY, point.x, point.y, settling]);

  return (
    <Animated.View
      onLayout={event => onHeight(placement.id, event)}
      style={[
        { position: 'absolute', width },
        positionStyle,
        active ? ACTIVE_LAYER : INACTIVE_LAYER,
      ]}
    >
      <DraggableWidget
        id={placement.id}
        editing={editing}
        dragging={active}
        settling={settling}
        settlePoint={settlePoint}
        baseX={baseX}
        baseY={baseY}
        onDragStart={() => onDragStart(placement.id)}
        onDragMove={onDragMove}
        onDragPosition={onDragPosition}
        onDragFinalize={onDragFinalize}
        onSettleComplete={onSettleComplete}
        onRemove={onRemove}
        scrollOffset={scrollOffset}
      >
        <Component colSpan={placement.colSpan} width={width} />
      </DraggableWidget>
    </Animated.View>
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

type GridContentProps = {
  activeId: string | null;
  activeOrigin: Point | null;
  settlingId: string | null;
  baseById: ReadonlyMap<string, WidgetPlacement>;
  editing: boolean;
  geometry: GridGeometry;
  measuredHeights: ReadonlyMap<string, number>;
  previewLayout: WidgetPlacement[];
  onHeight: GridItemProps['onHeight'];
  onDragStart: GridItemProps['onDragStart'];
  onDragMove: GridItemProps['onDragMove'];
  onDragPosition: GridItemProps['onDragPosition'];
  onDragFinalize: GridItemProps['onDragFinalize'];
  onSettleComplete: GridItemProps['onSettleComplete'];
  onRemove: GridItemProps['onRemove'];
  scrollOffset: SharedValue<number>;
};

function GridContent({
  activeId,
  activeOrigin,
  settlingId,
  baseById,
  editing,
  geometry,
  measuredHeights,
  previewLayout,
  onHeight,
  onDragStart,
  onDragMove,
  onDragPosition,
  onDragFinalize,
  onSettleComplete,
  onRemove,
  scrollOffset,
}: GridContentProps) {
  const activePreview = previewLayout.find(item => item.id === activeId);
  const activePreviewPoint = activePreview
    ? placementPoint(activePreview, geometry)
    : null;
  const occupancy = createOccupancyGrid(
    previewLayout,
    geometry.rowHeights.length,
  );
  return (
    <>
      {activePreview && !settlingId && (
        <View
          className="absolute rounded-[22px] border-2 border-dashed border-accent bg-accent-soft"
          style={{
            left: activePreviewPoint?.x ?? 0,
            top: activePreviewPoint?.y ?? 0,
            width:
              activePreview.colSpan * geometry.unitWidth +
              (activePreview.colSpan - 1) * GAP,
            height: measuredHeights.get(activePreview.id) ?? EMPTY_ROW_HEIGHT,
          }}
        />
      )}
      {previewLayout.map(previewPlacement => {
        const active = previewPlacement.id === activeId;
        const settling = previewPlacement.id === settlingId;
        const renderedPlacement = active
          ? baseById.get(previewPlacement.id) ?? previewPlacement
          : previewPlacement;
        return (
          <GridItem
            key={previewPlacement.id}
            placement={renderedPlacement}
            active={active}
            settling={settling}
            editing={editing}
            point={
              active && activeOrigin
                ? activeOrigin
                : placementPoint(renderedPlacement, geometry)
            }
            settlePoint={placementPoint(previewPlacement, geometry)}
            unitWidth={geometry.unitWidth}
            onHeight={onHeight}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragPosition={onDragPosition}
            onDragFinalize={onDragFinalize}
            onSettleComplete={onSettleComplete}
            onRemove={onRemove}
            scrollOffset={scrollOffset}
          />
        );
      })}
      {activeId &&
        occupancy.map((row, rowIndex) =>
          row.every(cell => cell === null) ? (
            <View
              key={`empty-${rowIndex}`}
              pointerEvents="none"
              className="absolute left-0 right-0 rounded-[18px] border border-dashed border-border-soft"
              style={{
                top: geometry.rowTops[rowIndex],
                height: geometry.rowHeights[rowIndex],
              }}
            />
          ) : null,
        )}
    </>
  );
}

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

  const geometry = useMemo(
    () =>
      buildGridGeometry(
        previewLayout,
        measuredHeights,
        containerWidth,
        activeId !== null,
        GAP,
        EMPTY_ROW_HEIGHT,
        VIRTUAL_ROWS,
      ),
    [activeId, containerWidth, measuredHeights, previewLayout],
  );

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
      const target = {
        row: Math.min(
          maxTargetRowRef.current,
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
      <View
        onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
        className="min-h-[1px]"
      />
    );
  }

  return (
    <View
      onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
      style={{ height: geometry.height }}
    >
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
    </View>
  );
}
