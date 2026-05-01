import {View, Text} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import {colors} from '../theme/tokens';

type SyncState = 'synced' | 'syncing' | 'offline';

const labels: Record<SyncState, string> = {
  synced: 'Synced',
  syncing: 'Syncing',
  offline: 'Offline',
};

const dotColors: Record<SyncState, string> = {
  synced: colors.success,
  syncing: colors.accent,
  offline: colors.warning,
};

export function SyncStatus({state = 'synced'}: {state?: SyncState}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (state === 'syncing') {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, {duration: 600}),
          withTiming(1, {duration: 600}),
        ),
        -1,
        false,
      );
    } else {
      opacity.value = withTiming(1, {duration: 80});
    }
  }, [state, opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      className={`flex-row items-center gap-1.5 py-1 pl-1.5 pr-2 rounded-sm h-6 bg-surface border ${
        state === 'offline' ? 'border-warning' : 'border-border'
      }`}>
      <Animated.View
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={[{backgroundColor: dotColors[state]}, dotStyle]}
      />
      <Text
        className={`font-mono text-[11px] font-medium uppercase tracking-wide ${
          state === 'offline' ? 'text-warning' : 'text-foreground-secondary'
        }`}>
        {labels[state]}
      </Text>
    </View>
  );
}
