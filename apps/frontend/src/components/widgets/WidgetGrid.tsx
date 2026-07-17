import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, LinearTransition } from 'react-native-reanimated';
import type { WidgetPlacement } from '@/types/widget';
import { spacing } from '@/theme/tokens';
import { DraggableWidget } from './DraggableWidget';
import { widgetRegistry } from './registry';

const GAP = spacing[3];
const COLS = 3;
const DROP_ZONE_INSET = 0.32;
const DROP_HOVER_MS = 160;
const PREVIEW_TRANSITION = LinearTransition.duration(260).easing(
  Easing.out(Easing.cubic),
);
const ACTIVE_LAYER = { zIndex: 100, elevation: 12 };
const INACTIVE_LAYER = { zIndex: 0, elevation: 0 };

type ItemFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type HoverState = { id: string | null; since: number };

function acceptHover(hover: { current: HoverState }, id: string): boolean {
  const now = Date.now();
  if (hover.current.id !== id) {
    hover.current = { id, since: now };
    return false;
  }
  if (now - hover.current.since < DROP_HOVER_MS) return false;
  hover.current = { id: null, since: 0 };
  return true;
}

type PlacedWidget = WidgetPlacement & {
  row: number;
  column: number;
  spacerColumns: number;
};

function placeWidgets(layout: WidgetPlacement[]): PlacedWidget[] {
  let row = 0;
  let nextColumn = 0;
  return layout.map(item => {
    const maxColumn = COLS - item.colSpan;
    const preferred = Math.max(0, Math.min(maxColumn, item.column ?? nextColumn));
    if (nextColumn + item.colSpan > COLS || preferred < nextColumn) {
      row += 1;
      nextColumn = 0;
    }
    const column = item.column == null ? nextColumn : preferred;
    const placed = {
      ...item,
      row,
      column,
      spacerColumns: column - nextColumn,
    };
    nextColumn = column + item.colSpan;
    return placed;
  });
}

function moveOneStep(
  layout: WidgetPlacement[],
  draggedId: string,
  targetId: string,
): WidgetPlacement[] {
  const fromIndex = layout.findIndex(item => item.id === draggedId);
  const toIndex = layout.findIndex(item => item.id === targetId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return layout;
  const nextIndex = fromIndex + Math.sign(toIndex - fromIndex);
  const next = [...layout];
  const [dragged] = next.splice(fromIndex, 1);
  next.splice(nextIndex, 0, dragged);
  return next;
}

function findDropTarget(
  frames: ReadonlyMap<string, ItemFrame>,
  draggedId: string,
  x: number,
  y: number,
): string | null {
  for (const [id, frame] of frames) {
    if (id === draggedId) continue;
    const insetX = frame.width * DROP_ZONE_INSET;
    const insetY = frame.height * DROP_ZONE_INSET;
    const insideX = x >= frame.x + insetX && x <= frame.x + frame.width - insetX;
    const insideY = y >= frame.y + insetY && y <= frame.y + frame.height - insetY;
    if (insideX && insideY) return id;
  }
  return null;
}

function findEmptyTarget(
  placed: PlacedWidget[],
  frames: ReadonlyMap<string, ItemFrame>,
  id: string,
  x: number,
  y: number,
  unitWidth: number,
): { key: string; column: number } | null {
  const dragged = placed.find(item => item.id === id);
  const frame = frames.get(id);
  if (!dragged || !frame || y < frame.y || y > frame.y + frame.height) return null;
  const column = Math.max(
    0,
    Math.min(COLS - dragged.colSpan, Math.floor(x / (unitWidth + GAP))),
  );
  const occupied = placed.some(
    item =>
      item.id !== id &&
      item.row === dragged.row &&
      column < item.column + item.colSpan &&
      column + dragged.colSpan > item.column,
  );
  if (occupied || column === dragged.column) return null;
  return { key: `empty-${dragged.row}-${column}`, column };
}

type WidgetGridItemProps = {
  item: PlacedWidget;
  active: boolean;
  editing: boolean;
  unitWidth: number;
  position: { x: number; y: number };
  onLayout: (id: string, event: LayoutChangeEvent) => void;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDrop: () => void;
  onRemove: (id: string) => void;
};

function WidgetGridItem({
  item,
  active,
  editing,
  unitWidth,
  position,
  onLayout,
  onDragStart,
  onDragMove,
  onDrop,
  onRemove,
}: WidgetGridItemProps) {
  const entry = widgetRegistry[item.type];
  if (!entry) return null;
  const Component = entry.component;
  const width = item.colSpan * unitWidth + (item.colSpan - 1) * GAP;
  return (
    <Animated.View
      layout={active ? undefined : PREVIEW_TRANSITION}
      style={[
        { width, marginLeft: item.spacerColumns * (unitWidth + GAP) },
        active ? ACTIVE_LAYER : INACTIVE_LAYER,
      ]}
      onLayout={event => onLayout(item.id, event)}
    >
      <DraggableWidget
        id={item.id}
        editing={editing}
        layoutX={position.x}
        layoutY={position.y}
        onDragStart={() => onDragStart(item.id)}
        onDragMove={onDragMove}
        onDrop={onDrop}
        onRemove={onRemove}
      >
        <Component colSpan={item.colSpan} width={width} />
      </DraggableWidget>
    </Animated.View>
  );
}

type WidgetGridProps = {
  layout: WidgetPlacement[];
  editing: boolean;
  onEditStart: () => void;
  onLayoutChange: (layout: WidgetPlacement[]) => void;
  onRemove: (id: string) => void;
};

export function WidgetGrid({
  layout,
  editing,
  onEditStart,
  onLayoutChange,
  onRemove,
}: WidgetGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [previewLayout, setPreviewLayout] = useState(layout);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [positions, setPositions] = useState<
    ReadonlyMap<string, { x: number; y: number }>
  >(() => new Map());
  const framesRef = useRef(new Map<string, ItemFrame>());
  const containerRef = useRef<View>(null);
  const containerOriginRef = useRef({ x: 0, y: 0 });
  const draggedIdRef = useRef<string | null>(null);
  const hoverRef = useRef<HoverState>({
    id: null,
    since: 0,
  });
  const previewRef = useRef(previewLayout);
  const placed = useMemo(() => placeWidgets(previewLayout), [previewLayout]);
  const placedRef = useRef(placed);
  placedRef.current = placed;
  useEffect(() => {
    previewRef.current = previewLayout;
  }, [previewLayout]);

  useEffect(() => {
    if (!draggedIdRef.current) setPreviewLayout(layout);
  }, [layout]);

  const unitWidth = useMemo(
    () => (containerWidth - (COLS - 1) * GAP) / COLS,
    [containerWidth],
  );

  const measureContainer = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      containerOriginRef.current = { x, y };
    });
  }, []);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setContainerWidth(event.nativeEvent.layout.width);
      measureContainer();
    },
    [measureContainer],
  );

  const startDrag = useCallback(
    (id: string) => {
      draggedIdRef.current = id;
      hoverRef.current = { id: null, since: 0 };
      setActiveId(id);
      measureContainer();
      onEditStart();
    },
    [measureContainer, onEditStart],
  );

  const moveDrag = useCallback(
    (id: string, absoluteX: number, absoluteY: number) => {
      const localX = absoluteX - containerOriginRef.current.x;
      const localY = absoluteY - containerOriginRef.current.y;
      const targetId = findDropTarget(
        framesRef.current,
        id,
        localX,
        localY,
      );
      if (!targetId) {
        const empty = findEmptyTarget(
          placedRef.current,
          framesRef.current,
          id,
          localX,
          localY,
          unitWidth,
        );
        if (!empty) {
          hoverRef.current = { id: null, since: 0 };
          return;
        }
        if (!acceptHover(hoverRef, empty.key)) return;
        setPreviewLayout(current =>
          current.map(item =>
            item.id === id ? { ...item, column: empty.column } : item,
          ),
        );
        return;
      }
      const resolvedTargetId = targetId;
      if (!acceptHover(hoverRef, resolvedTargetId)) return;
      setPreviewLayout(current =>
        moveOneStep(current, id, resolvedTargetId),
      );
    },
    [unitWidth],
  );

  const finishDrag = useCallback(() => {
    draggedIdRef.current = null;
    hoverRef.current = { id: null, since: 0 };
    setActiveId(null);
    onLayoutChange(previewRef.current);
  }, [onLayoutChange]);

  const recordPosition = useCallback(
    (id: string, event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      framesRef.current.set(id, { x, y, width, height });
      setPositions(current => {
        const previous = current.get(id);
        if (previous?.x === x && previous.y === y) return current;
        const next = new Map(current);
        next.set(id, { x, y });
        return next;
      });
    },
    [],
  );

  if (containerWidth === 0) {
    return (
      <View ref={containerRef} onLayout={onLayout} className="min-h-[1px]" />
    );
  }

  return (
    <View
      ref={containerRef}
      collapsable={false}
      onLayout={onLayout}
      className="flex-row flex-wrap gap-3"
    >
      {placed.map(item => {
        const position = positions.get(item.id) ?? { x: 0, y: 0 };
        return (
          <WidgetGridItem
            key={item.id}
            item={item}
            active={activeId === item.id}
            editing={editing}
            unitWidth={unitWidth}
            position={position}
            onLayout={recordPosition}
            onDragStart={startDrag}
            onDragMove={moveDrag}
            onDrop={finishDrag}
            onRemove={onRemove}
          />
        );
      })}
    </View>
  );
}
