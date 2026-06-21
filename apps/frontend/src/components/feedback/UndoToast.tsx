// Global "undo" affordance shown after a destructive action (e.g. swipe-to-
// delete). The action commits immediately — this gives a short, low-friction
// window to reverse it, so a confirm dialog isn't needed on every delete.
// Swipe the toast down to dismiss it early; tap Undo to reverse the delete.
//
// Usage:
//   const { showUndo } = useUndoToast();
//   const snapshot = repo.getById(id);
//   repo.deleteById(id);
//   showUndo({ message: t('common.deletedNamed', { name }), onUndo: () =>
//     snapshot && repo.create(snapshot) });

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors, motion, radii, shadows, typography } from '@/theme/tokens';

// How long the undo affordance stays on screen before the delete is final.
const VISIBLE_MS = 5000;
// Floats the toast just above the bottom tab bar so it never sits under it.
const TAB_BAR_CLEARANCE = 76;
// Where the card starts/ends its vertical fade — a gentle rise on enter, a
// slide clear of the screen on exit.
const ENTER_OFFSET = 14;
const EXIT_OFFSET = 220;
// A downward drag past this distance (or a flick faster than this) dismisses.
const DISMISS_DISTANCE = 56;
const DISMISS_VELOCITY = 800;

type UndoRequest = {
  message: string;
  onUndo: () => void;
  /** Override the default visible window (ms). */
  durationMs?: number;
};

type UndoToastContextValue = {
  showUndo: (request: UndoRequest) => void;
};

const UndoToastContext = createContext<UndoToastContextValue | null>(null);

export function useUndoToast(): UndoToastContextValue {
  const ctx = useContext(UndoToastContext);
  if (!ctx) {
    throw new Error('useUndoToast must be used within an UndoToastProvider');
  }
  return ctx;
}

type ActiveToast = UndoRequest & { id: number };

type UndoToastProviderProps = {
  children: ReactNode;
};

export function UndoToastProvider({ children }: UndoToastProviderProps) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const idRef = useRef(0);

  const showUndo = useCallback((request: UndoRequest) => {
    // Replace any in-flight toast — only the most recent delete is undoable.
    idRef.current += 1;
    setToast({ ...request, id: idRef.current });
  }, []);

  const handleClosed = useCallback(() => setToast(null), []);

  return (
    <UndoToastContext.Provider value={{ showUndo }}>
      {children}
      {toast && (
        <UndoToastCard
          key={toast.id}
          message={toast.message}
          durationMs={toast.durationMs ?? VISIBLE_MS}
          onUndo={toast.onUndo}
          onClosed={handleClosed}
        />
      )}
    </UndoToastContext.Provider>
  );
}

type UndoToastCardProps = {
  message: string;
  durationMs: number;
  onUndo: () => void;
  onClosed: () => void;
};

function UndoToastCard({
  message,
  durationMs,
  onUndo,
  onClosed,
}: UndoToastCardProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const translateY = useSharedValue(ENTER_OFFSET);
  const opacity = useSharedValue(0);
  // Latches once the card is leaving so a stray timer/gesture can't double-fire.
  const closing = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single exit path for every dismissal (timeout, undo tap, swipe): slide the
  // card down and fade it, then unmount once it's off screen.
  const close = useCallback(() => {
    if (closing.value === 1) {
      return;
    }
    closing.value = 1;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    opacity.value = withTiming(0, { duration: motion.fast });
    translateY.value = withTiming(
      EXIT_OFFSET,
      { duration: motion.base, easing: Easing.in(Easing.cubic) },
      finished => {
        if (finished) {
          runOnJS(onClosed)();
        }
      },
    );
  }, [closing, opacity, translateY, onClosed]);

  // Animate in on mount and arm the auto-dismiss timer.
  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: motion.base,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, { duration: motion.base });
    timer.current = setTimeout(close, durationMs);
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [translateY, opacity, close, durationMs]);

  const handleUndo = () => {
    onUndo();
    close();
  };

  const pan = Gesture.Pan()
    // Only a deliberate downward drag grabs the gesture, so the Undo tap and
    // any underlying scroll keep working.
    .activeOffsetY(8)
    .failOffsetY(-8)
    .onUpdate(event => {
      'worklet';
      translateY.value = Math.max(0, event.translationY);
      opacity.value = interpolate(
        translateY.value,
        [0, DISMISS_DISTANCE * 2],
        [1, 0.35],
        Extrapolation.CLAMP,
      );
    })
    .onEnd(event => {
      'worklet';
      if (
        event.translationY > DISMISS_DISTANCE ||
        event.velocityY > DISMISS_VELOCITY
      ) {
        runOnJS(close)();
        return;
      }
      // Not far enough — settle back to rest.
      translateY.value = withTiming(0, {
        duration: motion.fast,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: motion.fast });
    });

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, cardStyle]}>
          <ClayIcon name="trash" size={16} color={colors.cream} />
          <Text style={styles.message} numberOfLines={1}>
            {message}
          </Text>
          <Pressable
            onPress={handleUndo}
            hitSlop={10}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonLabel}>{t('common.undo')}</Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: colors.moss,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    ...shadows.nav,
  },
  message: {
    flex: 1,
    color: colors.cream,
    fontSize: typography.body,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.lineOnMoss,
  },
  pressed: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: colors.cream,
    fontSize: typography.label,
    fontWeight: '700',
  },
});
