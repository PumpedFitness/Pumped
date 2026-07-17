import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, LinearTransition } from 'react-native-reanimated';
import type { WidgetPlacement } from '@/types/widget';
import { spacing } from '@/theme/tokens';
import { DraggableWidget } from './DraggableWidget';
import { widgetRegistry } from './registry';

const GAP = spacing[3];
const COLS = 3;
const DROP_ZONE_INSET = 0.35;
const DROP_HOVER_MS = 200;
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

type WidgetGridProps = {
  layout: WidgetPlacement[];
  editing: boolean;
  onEditStart: () => void;
  onReorder: (orderedIds: string[]) => void;
  onRemove: (id: string) => void;
};

export function WidgetGrid({
  layout,
  editing,
  onEditStart,
  onReorder,
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
  const hoverRef = useRef<{ id: string | null; since: number }>({
    id: null,
    since: 0,
  });
  const previewRef = useRef(previewLayout);
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
      const targetId = findDropTarget(
        framesRef.current,
        id,
        absoluteX - containerOriginRef.current.x,
        absoluteY - containerOriginRef.current.y,
      );
      if (!targetId) {
        hoverRef.current = { id: null, since: 0 };
        return;
      }
      const resolvedTargetId = targetId;
      const now = Date.now();
      if (hoverRef.current.id !== resolvedTargetId) {
        hoverRef.current = { id: resolvedTargetId, since: now };
        return;
      }
      if (now - hoverRef.current.since < DROP_HOVER_MS) return;
      hoverRef.current = { id: null, since: 0 };
      setPreviewLayout(current =>
        moveOneStep(current, id, resolvedTargetId),
      );
    },
    [],
  );

  const finishDrag = useCallback(() => {
    draggedIdRef.current = null;
    hoverRef.current = { id: null, since: 0 };
    setActiveId(null);
    onReorder(previewRef.current.map(item => item.id));
  }, [onReorder]);

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
      {previewLayout.map(item => {
        const entry = widgetRegistry[item.type];
        if (!entry) return null;
        const Component = entry.component;
        const width = item.colSpan * unitWidth + (item.colSpan - 1) * GAP;
        const position = positions.get(item.id) ?? { x: 0, y: 0 };
        return (
          <Animated.View
            key={item.id}
            layout={
              activeId === item.id
                ? undefined
                : PREVIEW_TRANSITION
            }
            style={[{ width }, activeId === item.id ? ACTIVE_LAYER : INACTIVE_LAYER]}
            onLayout={event => recordPosition(item.id, event)}
          >
            <DraggableWidget
              id={item.id}
              editing={editing}
              layoutX={position.x}
              layoutY={position.y}
              onDragStart={() => startDrag(item.id)}
              onDragMove={moveDrag}
              onDrop={finishDrag}
              onRemove={onRemove}
            >
              <Component colSpan={item.colSpan} width={width} />
            </DraggableWidget>
          </Animated.View>
        );
      })}
    </View>
  );
}
