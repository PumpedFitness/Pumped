import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'tour-storage' });

const SEEN_TOUR_KEY = 'has_seen_tour';

// Master switch for the post-onboarding guided tour. Disabled for now — flip to
// `true` to bring it back; no other wiring needs to change.
const TOUR_ENABLED = false;

type TourState = {
  hasSeenTour: boolean;
  active: boolean;
  step: number;

  startTour: () => void;
  nextStep: () => void;
  goToStep: (step: number) => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
};

export const useTourStore = create<TourState>((set, get) => ({
  hasSeenTour: storage.getBoolean(SEEN_TOUR_KEY) ?? false,
  active: false,
  step: 0,

  startTour: () => {
    // Disabled for now, and only ever runs once per install otherwise.
    if (!TOUR_ENABLED || get().hasSeenTour) {
      return;
    }
    set({ active: true, step: 0 });
  },

  nextStep: () => {
    set(state => ({ step: state.step + 1 }));
  },

  goToStep: (step: number) => {
    set({ step });
  },

  skipTour: () => {
    storage.set(SEEN_TOUR_KEY, true);
    set({ active: false, hasSeenTour: true, step: 0 });
  },

  completeTour: () => {
    storage.set(SEEN_TOUR_KEY, true);
    set({ active: false, hasSeenTour: true, step: 0 });
  },

  resetTour: () => {
    storage.remove(SEEN_TOUR_KEY);
    set({ hasSeenTour: false, active: false, step: 0 });
  },
}));
