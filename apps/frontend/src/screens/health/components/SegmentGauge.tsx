import { View } from 'react-native';

type SegmentGaugeProps = {
  /** 0…1. */
  fraction: number;
  segments?: number;
  filled: string;
  empty: string;
};

/**
 * Der Score als Segmentreihe statt als glatter Balken.
 *
 * Ein durchgehender Balken suggeriert eine Auflösung, die die Zahl nicht hat —
 * der Score ist ein gerundeter Integer aus einer Schätzung. Diskrete Segmente
 * sagen dasselbe, ohne Genauigkeit zu behaupten, und lassen sich außerdem am
 * Rand ablesen, ohne die Zahl zu suchen.
 */
export function SegmentGauge({
  fraction,
  segments = 34,
  filled,
  empty,
}: SegmentGaugeProps) {
  const active = Math.round(Math.min(1, Math.max(0, fraction)) * segments);

  return (
    <View className="flex-row gap-[3px] h-[42px] items-stretch">
      {Array.from({ length: segments }, (_, index) => (
        <View
          key={index}
          className="flex-1 rounded-[2px]"
          style={{ backgroundColor: index < active ? filled : empty }}
        />
      ))}
    </View>
  );
}
