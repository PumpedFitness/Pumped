import { useCallback, useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

// The active section is the last header that has reached ~the pinned position.
const ACTIVE_OFFSET = 48;

/** One snapping unit: a standalone exercise or a whole superset. Typed
 *  structurally so the list decides what a section is, not this hook. */
export type SnapSection = { id: string; isComplete: boolean };

function sameNumbers(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

// Native snapToOffsets: a firm, decisive snap that always lands on a section.
// There is no scripted scroll animation — the OS snap settles on the nearest
// offset. A section taller than the viewport gets extra page stops so all of
// its sets stay reachable while every stop still belongs to one section — that
// is what lets you scroll through a superset's rounds.
//
// Tried and rejected: gating the snap on how near a section boundary was, so
// the middle of a tall section scrolled freely. It read as worse than this.
export function useSectionSnap(sections: SnapSection[]) {
  const offsets = useRef<number[]>([]);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const [snapOffsets, setSnapOffsets] = useState<number[]>([]);
  const [activeId, setActiveId] = useState(
    () => sections.find(section => !section.isComplete)?.id ?? sections[0]?.id,
  );
  const activeIdRef = useRef(activeId);

  const sectionCount = sections.length;

  const recompute = useCallback(() => {
    const viewport = viewportHeight.current;
    const next: number[] = [];
    for (let i = 0; i < sectionCount; i += 1) {
      const top = offsets.current[i];
      if (top == null) {
        return; // not every header has measured yet — wait.
      }
      next.push(top);
      // Page stops for a section taller than the viewport: step a screenful
      // at a time, with the final stop bottom-aligned so its last set is flush.
      const end =
        i + 1 < sectionCount ? offsets.current[i + 1] : contentHeight.current;
      if (viewport > 0 && end != null && end - top > viewport) {
        for (let stop = top + viewport; stop < end - 1; stop += viewport) {
          next.push(Math.min(stop, end - viewport));
        }
      }
    }
    // Page stops can coincide with the bottom-aligned cap — sort + dedupe so the
    // native snap offsets stay strictly ascending.
    const sorted = Array.from(new Set(next)).sort((a, b) => a - b);
    setSnapOffsets(prev => (sameNumbers(prev, sorted) ? prev : sorted));
  }, [sectionCount]);

  // Where the scroll will come to rest — the snap offset nearest the current
  // position. Basing the active section on this (not the raw release position)
  // is what stops a scroll-up from briefly flipping to the previous section on
  // finger-lift and then flipping back once the snap settles.
  const restingOffset = (y: number) => {
    if (snapOffsets.length === 0) {
      return y;
    }
    let best = snapOffsets[0];
    for (const offset of snapOffsets) {
      if (Math.abs(offset - y) < Math.abs(best - y)) {
        best = offset;
      }
    }
    return best;
  };

  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rest = restingOffset(event.nativeEvent.contentOffset.y);
    let index = 0;
    sections.forEach((_, i) => {
      const offset = offsets.current[i];
      if (offset != null && offset <= rest + ACTIVE_OFFSET) {
        index = i;
      }
    });
    const id = sections[index]?.id;
    if (id && id !== activeIdRef.current) {
      activeIdRef.current = id;
      setActiveId(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  // Stable so the list can memoize its rows against them — a state change here
  // must not rebuild every set card.
  const setOffset = useCallback(
    (index: number, y: number) => {
      offsets.current[index] = y;
      recompute();
    },
    [recompute],
  );

  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (height !== viewportHeight.current) {
        viewportHeight.current = height;
        recompute();
      }
    },
    [recompute],
  );

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      if (height !== contentHeight.current) {
        contentHeight.current = height;
        recompute();
      }
    },
    [recompute],
  );

  return {
    activeId,
    setOffset,
    onViewportLayout,
    onContentSizeChange,
    scrollProps: {
      snapToOffsets: snapOffsets.length > 0 ? snapOffsets : undefined,
      // Momentum (not a forced one-stop-per-swipe) decides where it lands, so a
      // small nudge settles back on the current section — you have to swipe
      // past the midpoint to switch. `disableIntervalMomentum` is intentionally
      // off; it made every flick jump to the next section.
      decelerationRate: 'fast' as const,
      onScrollEndDrag: settle,
      onMomentumScrollEnd: settle,
    },
  };
}
