import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'current-workout-overlay-storage' });

const SIDE_KEY = 'overlay_side';
const OFFSET_Y_KEY = 'overlay_offset_y';

// 0 = right edge (default), 1 = left edge.
export type OverlaySide = 0 | 1;

function readSide(): OverlaySide {
  return storage.getNumber(SIDE_KEY) === 1 ? 1 : 0;
}

function readOffsetY(): number {
  return storage.getNumber(OFFSET_Y_KEY) ?? 0;
}

type CurrentWorkoutOverlayState = {
  /** Which screen edge the widget snaps to. */
  side: OverlaySide;
  /** Resting vertical offset (px) from the default top position. */
  offsetY: number;
  setSide: (side: OverlaySide) => void;
  setOffsetY: (offsetY: number) => void;
};

export const useCurrentWorkoutOverlayStore = create<CurrentWorkoutOverlayState>(
  set => ({
    side: readSide(),
    offsetY: readOffsetY(),

    setSide: (side: OverlaySide) => {
      storage.set(SIDE_KEY, side);
      set({ side });
    },

    setOffsetY: (offsetY: number) => {
      storage.set(OFFSET_Y_KEY, offsetY);
      set({ offsetY });
    },
  }),
);
