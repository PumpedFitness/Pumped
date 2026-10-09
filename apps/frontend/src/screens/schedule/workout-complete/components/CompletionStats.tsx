import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Easing, FadeInDown } from 'react-native-reanimated';
import { colors, shadows } from '@pumped/ui/theme/tokens';
import { ClayIcon, type IconName } from '@pumped/ui/icons/ClayIcon';
import { AnimatedView } from '@pumped/ui/uniwind';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { WorkoutFinishSummary } from '@/types/workout';
import { displayWeight } from '@/utils/units';

type CompletionStatsProps = {
  summary: WorkoutFinishSummary;
  weightUnit: WeightUnit;
  /** Entrance delay for the first tile, ms; the rest stagger after it. */
  delay: number;
};

type StatTileProps = {
  icon: IconName;
  label: string;
  target: number;
  format: (value: number) => string;
  delay: number;
};

const COUNT_MS = 800;

// Ticks a number from 0 to `target` with an ease-out, starting after `delay`.
// JS-driven on purpose: it renders text, and three short-lived counters are
// far cheaper than the native text-prop workaround.
function useCountUp(target: number, delay: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / COUNT_MS);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, delay]);

  return value;
}

function StatTile({ icon, label, target, format, delay }: StatTileProps) {
  const value = useCountUp(target, delay + 100);

  return (
    <AnimatedView
      className="flex-1"
      entering={FadeInDown.delay(delay)
        .duration(380)
        .easing(Easing.out(Easing.cubic))
        .withInitialValues({ transform: [{ translateY: 10 }] })}
    >
      <View
        className="items-center gap-1.5 rounded-[22px] bg-surface-card px-2 py-4"
        style={shadows.card}
      >
        <View className="h-8 w-8 items-center justify-center rounded-full bg-accent-soft">
          <ClayIcon name={icon} size={16} color={colors.accent} />
        </View>
        <Text
          className="text-[22px] font-black tabular-nums text-foreground"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {format(value)}
        </Text>
        <Text className="t-eyebrow text-muted">{label}</Text>
      </View>
    </AnimatedView>
  );
}

export function CompletionStats({
  summary,
  weightUnit,
  delay,
}: CompletionStatsProps) {
  const { t, i18n } = useTranslation();
  const minutes = Math.max(1, Math.round(summary.durationMs / 60000));
  const volume = displayWeight(summary.totalVolumeKg, weightUnit);

  return (
    <View className="flex-row gap-3">
      <StatTile
        icon="clock"
        label={t('workoutComplete.stats.duration')}
        target={minutes}
        format={value =>
          t('workoutComplete.stats.minutes', { count: Math.round(value) })
        }
        delay={delay}
      />
      <StatTile
        icon="check"
        label={t('workoutComplete.stats.sets')}
        target={summary.setCount}
        format={value => `${Math.round(value)}`}
        delay={delay + 60}
      />
      <StatTile
        icon="dumbbell"
        label={t('workoutComplete.stats.volume')}
        target={volume}
        format={value =>
          `${Math.round(value).toLocaleString(i18n.language)} ${weightUnit}`
        }
        delay={delay + 120}
      />
    </View>
  );
}
