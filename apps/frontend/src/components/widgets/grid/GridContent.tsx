import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { WidgetPlacement } from '@/types/widget';
import { widgetRegistry } from '@/components/widgets/registry';
import { DraggableWidget } from './DraggableWidget';
import { createOccupancyGrid } from './widgetGridModel';
import type { GridGeometry, Point } from './widgetGridGeometry';
import {
  ACTIVE_LAYER,
  EMPTY_ROW_HEIGHT,
  GAP,
  INACTIVE_LAYER,
  placementPoint,
} from './gridConstants';
import { useSlotPosition } from './useSlotPosition';

export type GridItemProps = {
  placement: WidgetPlacement;
  active: boolean;
  settling: boolean;
  /** Ease into a new slot — only while a drag is resolving. */
  animate: boolean;
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

export function GridItem({
  placement,
  active,
  settling,
  animate,
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
  const { baseX, baseY } = useSlotPosition(point, animate, active || settling);
  const positionStyle = useAnimatedStyle(() => ({
    left: baseX.value,
    top: baseY.value,
  }));

  return (
    <Animated.View
      onLayout={event => onHeight(placement.id, event)}
      style={[
        { position: 'absolute', width },
        positionStyle,
        active ? ACTIVE_LAYER : INACTIVE_LAYER,
      ]}
    >
      <View
        accessible
        accessibilityLabel={`${placement.type} widget position`}
        pointerEvents="none"
        testID={`home-widget-${placement.type}`}
        className="absolute left-0 top-0 h-6 w-6"
      />
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
        <Component
          colSpan={placement.colSpan}
          width={width}
          editing={editing}
        />
      </DraggableWidget>
    </Animated.View>
  );
}

export type GridContentProps = {
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

export function GridContent({
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
            animate={activeId !== null || settlingId !== null}
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
