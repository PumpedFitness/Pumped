import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { clampRestMs } from './restTimerModel';

// Re-render cadence while running. The displayed value is derived from the
// target timestamp, so this only drives the visual countdown, never the math.
const TICK_MS = 250;

type RestStatus = 'idle' | 'running' | 'paused';

type RestState = {
  status: RestStatus;
  /** Set whose completion started this rest timer. */
  sourceSetId: string | null;
  /** Target completion timestamp while running; null otherwise. */
  endsAt: number | null;
  /** Authoritative remaining time while idle/paused. */
  remainingMs: number;
  /** Seeded duration, the ring denominator. */
  totalMs: number;
  isMinimized: boolean;
};

const IDLE: RestState = {
  status: 'idle',
  sourceSetId: null,
  endsAt: null,
  remainingMs: 0,
  totalMs: 0,
  isMinimized: false,
};

export type RestTimerController = {
  isActive: boolean;
  isRunning: boolean;
  isMinimized: boolean;
  remainingMs: number;
  totalMs: number;
  sourceSetId: string | null;
  /** Reset + run a fresh rest of `seconds` (a new set replaces any running one). */
  start: (seconds: number, sourceSetId?: string) => void;
  toggle: () => void;
  addSeconds: (deltaSeconds: number) => void;
  skip: () => void;
  minimize: () => void;
  expand: () => void;
};

// Best-effort success buzz when a rest completes.
function fireRestDoneHaptic() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  } catch {
    // expo-haptics native module unavailable until the app is rebuilt.
  }
}

export function useRestTimer(): RestTimerController {
  const [state, setState] = useState<RestState>(IDLE);
  const [now, setNow] = useState(() => Date.now());

  // Tick only while running.
  useEffect(() => {
    if (state.status !== 'running') {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [state.status]);

  // Recompute immediately on foreground so a rest that elapsed while
  // backgrounded auto-completes (and buzzes) exactly once on resume.
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') {
        setNow(Date.now());
      }
    });
    return () => sub.remove();
  }, []);

  const remainingMs =
    state.status === 'running' && state.endsAt != null
      ? Math.max(0, state.endsAt - now)
      : state.remainingMs;

  // Auto-complete: flipping to IDLE clears the running guard, so this fires once.
  useEffect(() => {
    if (
      state.status === 'running' &&
      state.endsAt != null &&
      now >= state.endsAt
    ) {
      fireRestDoneHaptic();
      setState(IDLE);
    }
  }, [state.status, state.endsAt, now]);

  const start = useCallback((seconds: number, sourceSetId?: string) => {
    const totalMs = clampRestMs(seconds * 1000);
    if (totalMs <= 0) {
      setState(IDLE);
      return;
    }
    const startedAt = Date.now();
    setNow(startedAt);
    // "Never show again" (fullscreen off) opens straight to the bottom bar.
    const startMinimized = !useAppSettingsStore.getState().restTimerFullscreen;
    setState({
      status: 'running',
      sourceSetId: sourceSetId ?? null,
      endsAt: startedAt + totalMs,
      remainingMs: totalMs,
      totalMs,
      isMinimized: startMinimized,
    });
  }, []);

  const toggle = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setState(prev => {
      if (prev.status === 'running' && prev.endsAt != null) {
        return {
          ...prev,
          status: 'paused',
          endsAt: null,
          remainingMs: Math.max(0, prev.endsAt - t),
        };
      }
      if (prev.status === 'paused') {
        return { ...prev, status: 'running', endsAt: t + prev.remainingMs };
      }
      return prev;
    });
  }, []);

  const addSeconds = useCallback((deltaSeconds: number) => {
    const t = Date.now();
    setNow(t);
    setState(prev => {
      if (prev.status === 'idle') {
        return prev;
      }
      const current =
        prev.status === 'running' && prev.endsAt != null
          ? Math.max(0, prev.endsAt - t)
          : prev.remainingMs;
      const nextRemaining = clampRestMs(current + deltaSeconds * 1000);
      const totalMs = Math.max(prev.totalMs, nextRemaining);
      if (prev.status === 'running') {
        return {
          ...prev,
          endsAt: t + nextRemaining,
          remainingMs: nextRemaining,
          totalMs,
        };
      }
      return { ...prev, remainingMs: nextRemaining, totalMs };
    });
  }, []);

  const skip = useCallback(() => setState(IDLE), []);
  const minimize = useCallback(
    () =>
      setState(prev =>
        prev.status === 'idle' ? prev : { ...prev, isMinimized: true },
      ),
    [],
  );
  const expand = useCallback(
    () => setState(prev => ({ ...prev, isMinimized: false })),
    [],
  );

  return {
    isActive: state.status !== 'idle',
    isRunning: state.status === 'running',
    isMinimized: state.isMinimized,
    remainingMs,
    totalMs: state.totalMs,
    sourceSetId: state.status === 'idle' ? null : state.sourceSetId,
    start,
    toggle,
    addSeconds,
    skip,
    minimize,
    expand,
  };
}
