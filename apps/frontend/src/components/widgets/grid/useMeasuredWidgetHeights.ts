import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export function useMeasuredWidgetHeights() {
  const [heights, setHeights] = useState<ReadonlyMap<string, number>>(
    () => new Map(),
  );
  const recordHeight = useCallback((id: string, event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setHeights(current => {
      if (current.get(id) === height) return current;
      return new Map(current).set(id, height);
    });
  }, []);
  return { heights, recordHeight };
}
