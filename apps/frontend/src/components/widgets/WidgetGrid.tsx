import { useRef, useState, useCallback } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { WidgetPlacement } from '@/types/widget';
import { widgetRegistry } from './registry';
import { DraggableWidget } from './DraggableWidget';
import { spacing } from '@/theme/tokens';

const GAP = spacing[3];
const COLS = 3;

type RowItem = WidgetPlacement & { width: number; flatIndex: number };

type Row = {
  key: string;
  items: RowItem[];
};

function packRows(
  placements: WidgetPlacement[],
  availableWidth: number,
): Row[] {
  const unitWidth = (availableWidth - (COLS - 1) * GAP) / COLS;
  const rows: Row[] = [];
  let currentRow: RowItem[] = [];
  let currentCols = 0;
  let flatIndex = 0;

  for (const placement of placements) {
    const span = Math.min(placement.colSpan, COLS);
    if (currentCols + span > COLS) {
      if (currentRow.length > 0) {
        rows.push({
          key: currentRow.map(item => item.id).join('-'),
          items: currentRow,
        });
      }
      currentRow = [];
      currentCols = 0;
    }
    const width = span * unitWidth + (span - 1) * GAP;
    currentRow.push({ ...placement, width, flatIndex });
    currentCols += span;
    flatIndex++;
  }

  if (currentRow.length > 0) {
    rows.push({
      key: currentRow.map(item => item.id).join('-'),
      items: currentRow,
    });
  }

  return rows;
}

type WidgetGridProps = {
  layout: WidgetPlacement[];
  editing: boolean;
  onEditStart: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
};

export function WidgetGrid({
  layout,
  editing,
  onEditStart,
  onMove,
  onRemove,
}: WidgetGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const itemRefs = useRef(new Map<string, View>());

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const onDrop = useCallback(
    (draggedId: string, absoluteX: number, absoluteY: number) => {
      const fromIndex = layout.findIndex(item => item.id === draggedId);
      if (fromIndex < 0) return;

      let pending = itemRefs.current.size;
      let nearestId = draggedId;
      let nearestDistance = Number.POSITIVE_INFINITY;
      if (pending === 0) return;

      itemRefs.current.forEach((view, id) => {
        view.measureInWindow((x, y, width, height) => {
          const dx = absoluteX - (x + width / 2);
          const dy = absoluteY - (y + height / 2);
          const distance = dx * dx + dy * dy;
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestId = id;
          }
          pending -= 1;
          if (pending === 0) {
            const toIndex = layout.findIndex(item => item.id === nearestId);
            if (toIndex >= 0 && toIndex !== fromIndex) {
              onMove(fromIndex, toIndex);
            }
          }
        });
      });
    },
    [layout, onMove],
  );

  if (containerWidth === 0) {
    return <View onLayout={onLayout} className="min-h-[1px]" />;
  }

  const rows = packRows(layout, containerWidth);

  return (
    <View onLayout={onLayout} className="gap-3">
      {rows.map(row => (
        <View key={row.key} className="flex-row gap-3">
          {row.items.map(item => {
            const entry = widgetRegistry[item.type];
            if (!entry) return null;
            const Component = entry.component;
            return (
              <View
                key={item.id}
                ref={view => {
                  if (view) itemRefs.current.set(item.id, view);
                  else itemRefs.current.delete(item.id);
                }}
                collapsable={false}
                style={{ width: item.width }}
              >
                <DraggableWidget
                  id={item.id}
                  editing={editing}
                  onDragStart={onEditStart}
                  onDrop={onDrop}
                  onRemove={onRemove}
                >
                  <Component colSpan={item.colSpan} width={item.width} />
                </DraggableWidget>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
