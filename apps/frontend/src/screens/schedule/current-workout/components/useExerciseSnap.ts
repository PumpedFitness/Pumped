import { useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { CurrentWorkoutExercise } from '@/stores/currentWorkoutModel';

// The active exercise is the last header that has reached ~the pinned position.
const ACTIVE_OFFSET = 48;

export function allSetsDone(exercise: CurrentWorkoutExercise): boolean {
  return exercise.sets.length > 0 && exercise.sets.every(set => set.isDone);
}

function sameNumbers(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

// Native snapToOffsets: a firm, decisive snap that always lands on an exercise.
// There is no scripted scroll animation — the OS snap settles on the nearest
// offset. An exercise taller than the viewport gets extra page stops so all of
// its sets stay reachable while every stop still belongs to one exercise.
export function useExerciseSnap(exercises: CurrentWorkoutExercise[]) {
  const offsets = useRef<number[]>([]);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const [snapOffsets, setSnapOffsets] = useState<number[]>([]);
  const [activeId, setActiveId] = useState(
    () =>
      exercises.find(exercise => !allSetsDone(exercise))?.id ??
      exercises[0]?.id,
  );
  const activeIdRef = useRef(activeId);

  const recompute = () => {
    const viewport = viewportHeight.current;
    const next: number[] = [];
    for (let i = 0; i < exercises.length; i += 1) {
      const top = offsets.current[i];
      if (top == null) {
        return; // not every header has measured yet — wait.
      }
      next.push(top);
      // Page stops for an exercise taller than the viewport: step a screenful
      // at a time, with the final stop bottom-aligned so its last set is flush.
      const end =
        i + 1 < exercises.length
          ? offsets.current[i + 1]
          : contentHeight.current;
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
  };

  // Where the scroll will come to rest — the snap offset nearest the current
  // position. Basing the active exercise on this (not the raw release position)
  // is what stops a scroll-up from briefly flipping to the previous exercise on
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
    exercises.forEach((_, i) => {
      const offset = offsets.current[i];
      if (offset != null && offset <= rest + ACTIVE_OFFSET) {
        index = i;
      }
    });
    const id = exercises[index]?.id;
    if (id && id !== activeIdRef.current) {
      activeIdRef.current = id;
      setActiveId(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  return {
    activeId,
    setOffset: (index: number, y: number) => {
      offsets.current[index] = y;
      recompute();
    },
    onViewportLayout: (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (height !== viewportHeight.current) {
        viewportHeight.current = height;
        recompute();
      }
    },
    onContentSizeChange: (_width: number, height: number) => {
      if (height !== contentHeight.current) {
        contentHeight.current = height;
        recompute();
      }
    },
    scrollProps: {
      snapToOffsets: snapOffsets.length > 0 ? snapOffsets : undefined,
      // Momentum (not a forced one-stop-per-swipe) decides where it lands, so a
      // small nudge settles back on the current exercise — you have to swipe
      // past the midpoint to switch. `disableIntervalMomentum` is intentionally
      // off; it made every flick jump to the next exercise.
      decelerationRate: 'fast' as const,
      onScrollEndDrag: settle,
      onMomentumScrollEnd: settle,
    },
  };
}
