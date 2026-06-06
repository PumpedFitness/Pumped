import { useState, useCallback } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { WidgetPlacement } from '../../types/widget';
import { widgetRegistry } from './registry';
import { spacing } from '../../theme/tokens';

const GAP = spacing[3]; // 12
const COLS = 3;

type RowItem = WidgetPlacement & { width: number; flatIndex: number };

type Row = {
  key: string;
  items: RowItem[];
};

function packRows(placements: WidgetPlacement[], availableWidth: number): Row[] {
  const unitWidth = (availableWidth - (COLS - 1) * GAP) / COLS;
  const rows: Row[] = [];
  let currentRow: RowItem[] = [];
  let currentCols = 0;
  let flatIndex = 0;

  for (const placement of placements) {
    const span = Math.min(placement.colSpan, COLS);
    if (currentCols + span > COLS) {
      if (currentRow.length > 0) {
        rows.push({ key: currentRow.map(r => r.id).join('-'), items: currentRow });
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
    rows.push({ key: currentRow.map(r => r.id).join('-'), items: currentRow });
  }

  return rows;
}

type WidgetGridProps = {
  layout: WidgetPlacement[];
};

export function WidgetGrid({ layout }: WidgetGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  if (containerWidth === 0) {
    return <View onLayout={onLayout} style={{ minHeight: 1 }} />;
  }

  const rows = packRows(layout, containerWidth);

  return (
    <View onLayout={onLayout} style={{ gap: GAP }}>
      {rows.map(row => (
        <View key={row.key} style={{ flexDirection: 'row', gap: GAP }}>
          {row.items.map(item => {
            const entry = widgetRegistry[item.type];
            if (!entry) return null;
            const Component = entry.component;
            return (
              <View key={item.id} style={{ width: item.width }}>
                <Component colSpan={item.colSpan} width={item.width} />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
