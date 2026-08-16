import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { Skeleton } from '@pumped/ui/clay/Skeleton';
import { widgetRegistry } from '@/components/widgets/registry';
import type { WidgetPlacement } from '@/types/widget';
import { EMPTY_ROW_HEIGHT, GAP } from './gridConstants';
import { buildGridGeometry, placementPoint } from './widgetGridGeometry';

type WidgetGridSkeletonProps = {
  layout: WidgetPlacement[];
  /** `0` before the grid has been laid out — see the note below. */
  containerWidth: number;
  gap: number;
  emptyRowHeight: number;
};

export function estimateWidgetHeight(placement: WidgetPlacement): number {
  return widgetRegistry[placement.type].meta.estimatedHeight;
}

/**
 * The grid's shape before its widgets can draw themselves.
 *
 * Positioned by the **same** `buildGridGeometry` the real grid uses, fed the
 * per-type estimates instead of measured heights. Laying the placeholders out
 * by hand would have been less code and would have drifted the moment the grid
 * changed its row maths — and a skeleton that sits where the content will not
 * is worse than no skeleton, because the correction is the very thing it exists
 * to hide.
 *
 * Before the container has been measured there is no column width to divide up,
 * so the blocks fall back to a plain full-width stack. That state lasts a single
 * frame; the alternative was the blank screen this replaces.
 */
export function WidgetGridSkeleton({
  layout,
  containerWidth,
  gap,
  emptyRowHeight,
}: WidgetGridSkeletonProps) {
  if (containerWidth === 0) {
    const rows = [...layout].sort(
      (a, b) => a.row - b.row || a.column - b.column,
    );
    return (
      <View style={{ gap }}>
        {rows.map(placement => (
          <Skeleton
            key={placement.id}
            height={estimateWidgetHeight(placement)}
          />
        ))}
      </View>
    );
  }

  const geometry = buildGridGeometry(
    layout,
    new Map(),
    containerWidth,
    false,
    gap,
    emptyRowHeight,
    0,
    estimateWidgetHeight,
  );

  return (
    <View pointerEvents="none" style={{ height: geometry.height }}>
      {layout.map(placement => {
        const point = placementPoint(placement, geometry, gap);
        return (
          <Skeleton
            key={placement.id}
            height={estimateWidgetHeight(placement)}
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y,
              width:
                placement.colSpan * geometry.unitWidth +
                (placement.colSpan - 1) * gap,
            }}
          />
        );
      })}
    </View>
  );
}

/**
 * Whether the grid has been laid out and measured at least once.
 *
 * Latched on purpose: it must not fall back to false when the layout changes
 * later. Adding a widget introduces one unmeasured id, and a plain "is
 * everything measured" check would drop skeletons over the whole grid for a
 * frame every time — a flash on a screen the user is already looking at, which
 * is the opposite of what this is for.
 */
export function useGridSettled(
  containerWidth: number,
  layout: WidgetPlacement[],
  measuredHeights: ReadonlyMap<string, number>,
): boolean {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (settled || containerWidth === 0) return;
    if (layout.every(placement => measuredHeights.has(placement.id))) {
      setSettled(true);
    }
  }, [containerWidth, layout, measuredHeights, settled]);

  return settled;
}

/**
 * The single frame before the column width is known.
 *
 * Rendered a 1px sliver before, which is exactly why the screen was blank until
 * the widgets appeared.
 */
export function GridMeasureShell({
  layout,
  onWidth,
}: {
  layout: WidgetPlacement[];
  onWidth: (width: number) => void;
}) {
  return (
    <View
      onLayout={(event: LayoutChangeEvent) =>
        onWidth(event.nativeEvent.layout.width)
      }
    >
      <WidgetGridSkeleton
        layout={layout}
        containerWidth={0}
        gap={GAP}
        emptyRowHeight={EMPTY_ROW_HEIGHT}
      />
    </View>
  );
}

/**
 * The skeleton laid over the grid until its widgets have been measured.
 *
 * Exit-animated rather than fading the content in: if the animation is ever
 * dropped the skeleton simply vanishes, where a dropped fade-in would leave the
 * grid stuck at zero opacity.
 */
export function GridSkeletonOverlay({
  layout,
  containerWidth,
}: {
  layout: WidgetPlacement[];
  containerWidth: number;
}) {
  return (
    <Animated.View
      exiting={FadeOut.duration(180)}
      style={StyleSheet.absoluteFill}
    >
      <WidgetGridSkeleton
        layout={layout}
        containerWidth={containerWidth}
        gap={GAP}
        emptyRowHeight={EMPTY_ROW_HEIGHT}
      />
    </Animated.View>
  );
}

/**
 * False for the first painted frame, true from the next one on.
 *
 * The reason the skeleton was invisible: it and the real widgets were children
 * of the same commit, so React rendered both before the screen updated once.
 * The home widgets open with an expensive first render — `useHealthSnapshot`
 * rebuilds every metric series, twice, because its cache lives per component —
 * and that work landed *inside* the commit that was supposed to be showing a
 * placeholder. The placeholder appeared only once the wait it covers was over.
 *
 * Two frames rather than one: a single `requestAnimationFrame` can run before
 * the commit it follows has been flushed to the native side, which would put
 * the widgets back in the same paint.
 */
export function useDeferredMount(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  return mounted;
}
