import { Text, View, type DimensionValue } from 'react-native';
import { colors } from '../theme/tokens';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// inset-bar — muscle-split / meter bars: `inset 0 1px 3px rgba(27,26,24,.08)`.
// RN has no inset shadow, so we approximate with a hairline top rim on the track.
const TRACK_RIM = 'rgba(27,26,24,0.06)';

type BarRowProps = {
  label: string;
  value: string | number;
  /** Filled fraction 0..1. */
  fill: number;
  /** Fill color (defaults to ink). */
  color?: string;
  /** Track color (defaults to the #EBE8E4 bar track). */
  trackColor?: string;
  className?: string;
};

/**
 * BarRow — a horizontal labelled meter (Weekly-sets-by-muscle row).
 * name (56px, muted 600 12) · bar (h10, radius 999, track + inset rim, filled) ·
 * value (26px right, ink 700 12).
 */
export function BarRow({
  label,
  value,
  fill,
  color = colors.ink,
  trackColor = colors.track,
  className = '',
}: BarRowProps) {
  const pct: DimensionValue = `${clamp01(fill) * 100}%`;

  return (
    <View className={`flex-row items-center gap-[10px] ${className}`}>
      <Text className="w-[56px] text-[12px] font-[600] text-muted" numberOfLines={1}>
        {label}
      </Text>
      <View
        className="h-[10px] flex-1 overflow-hidden rounded-full"
        style={{
          backgroundColor: trackColor,
          borderTopWidth: 1,
          borderTopColor: TRACK_RIM,
        }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: pct, backgroundColor: color }}
        />
      </View>
      <Text className="w-[26px] text-right text-[12px] font-[700] text-foreground">
        {value}
      </Text>
    </View>
  );
}

type BarGroupProps = {
  /** Per-bar heights as fractions 0..1. */
  heights: number[];
  /** Per-bar colors; defaults to bar-idle with the last two ink / accent. */
  colors?: string[];
  /** Overall cluster height (px). Default 34. */
  height?: number;
  /** Fixed bar width (px). If omitted, bars flex to fill. */
  barWidth?: number;
  /** Gap between bars (px). Default 4. */
  gap?: number;
  className?: string;
};

/**
 * BarGroup — a compact vertical bar cluster (Tonnage mini chart).
 * Bars grow from the baseline, radius 999. Default palette is bar-idle for
 * all but the final two bars (ink, then accent) per the v2 spec.
 */
export function BarGroup({
  heights,
  colors: barColors,
  height = 34,
  barWidth,
  gap = 4,
  className = '',
}: BarGroupProps) {
  const n = heights.length;

  const resolveColor = (i: number): string => {
    if (barColors && barColors[i]) return barColors[i];
    if (i === n - 1) return colors.accent;
    if (i === n - 2) return colors.ink;
    return colors.barIdle;
  };

  return (
    <View className={`flex-row items-end ${className}`} style={{ height, gap }}>
      {heights.map((h, i) => (
        <View
          key={i}
          className={`rounded-full ${barWidth ? '' : 'flex-1'}`}
          style={{
            height: Math.max(2, clamp01(h) * height),
            width: barWidth,
            backgroundColor: resolveColor(i),
          }}
        />
      ))}
    </View>
  );
}
