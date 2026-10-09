import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '@pumped/ui/theme/tokens';
import type { WorkoutHeartRate } from '@/lib/health/algorithms/workoutHeartRate';

const CHART_HEIGHT = 132;
const AXIS_WIDTH = 26;
const TICK_LABEL_WIDTH = 44;
const VERTICAL_PADDING = 8;
const STRIP_HEIGHT = 8;
/** A gap longer than this is the watch losing contact — break the line. */
const LINE_BREAK_SECONDS = 60;

type WorkoutHeartRateChartProps = {
  heartRate: WorkoutHeartRate;
  /** Epoch ms the workout started; ticks count minutes from here. */
  startedAt: number;
  colorForExercise: (exerciseKey: string) => string;
};

function valueRange(heartRate: WorkoutHeartRate): [number, number] {
  const values = heartRate.curve.map(point => point.value);
  const low = Math.floor((Math.min(...values) - 5) / 10) * 10;
  const high = Math.ceil((Math.max(...values) + 5) / 10) * 10;
  return [low, Math.max(high, low + 20)];
}

function minuteTicks(fromTs: number, toTs: number, originTs: number): number[] {
  const spanMinutes = (toTs - originTs) / 60;
  const step = spanMinutes > 90 ? 30 : spanMinutes > 40 ? 15 : 10;
  const ticks: number[] = [];
  for (let minute = 0; originTs + minute * 60 <= toTs; minute += step) {
    if (originTs + minute * 60 >= fromTs) ticks.push(minute);
  }
  return ticks;
}

/**
 * Heart rate across the workout, with each set drawn behind the curve in its
 * exercise's color. Set starts are estimated (only the tick-off time is
 * stored), so the bands mark roughly where the work happened.
 */
export function WorkoutHeartRateChart({
  heartRate,
  startedAt,
  colorForExercise,
}: WorkoutHeartRateChartProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const [low, high] = valueRange(heartRate);
  const span = Math.max(1, heartRate.endTs - heartRate.startTs);
  const originTs = Math.floor(startedAt / 1000);

  const x = (ts: number) =>
    AXIS_WIDTH + ((ts - heartRate.startTs) / span) * (width - AXIS_WIDTH);
  const y = (value: number) =>
    VERTICAL_PADDING +
    (1 - (value - low) / (high - low)) * (CHART_HEIGHT - VERTICAL_PADDING * 2);

  const path = heartRate.curve
    .map((point, index) => {
      const previous = heartRate.curve[index - 1];
      const command =
        previous === undefined || point.ts - previous.ts > LINE_BREAK_SECONDS
          ? 'M'
          : 'L';
      return `${command}${x(point.ts).toFixed(1)},${y(point.value).toFixed(1)}`;
    })
    .join('');

  const valueTicks = [low, Math.round((low + high) / 20) * 10, high];
  // A tick whose label would run past the right edge is dropped rather than
  // squeezed in next to its neighbour.
  const ticks = minuteTicks(
    heartRate.startTs,
    heartRate.endTs,
    originTs,
  ).filter(minute => x(originTs + minute * 60) + TICK_LABEL_WIDTH / 2 <= width);

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <View style={{ height: CHART_HEIGHT }}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            {heartRate.sets.map(set => (
              <Rect
                key={set.setId}
                x={x(set.startTs)}
                y={0}
                width={Math.max(2, x(set.endTs) - x(set.startTs))}
                height={CHART_HEIGHT}
                fill={colorForExercise(set.exerciseKey)}
                opacity={0.14}
              />
            ))}
            {valueTicks.map(value => (
              <SvgText
                key={value}
                x={AXIS_WIDTH - 7}
                // Baseline offset instead of alignmentBaseline, which Android
                // ignores.
                y={y(value) + 3.4}
                fontSize={9.5}
                fill={colors.muted}
                textAnchor="end"
              >
                {value}
              </SvgText>
            ))}
            <Path
              d={path}
              stroke={colors.accent}
              strokeWidth={1.75}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            {heartRate.peak ? (
              <Circle
                cx={x(heartRate.peak.ts)}
                cy={y(heartRate.peak.value)}
                r={3}
                fill={colors.accent}
              />
            ) : null}
          </Svg>
        ) : null}
      </View>

      {/* The solid strip carries the color key; the faint bands above only
          tie each spike to its set. */}
      <View style={{ height: STRIP_HEIGHT }} className="mt-1">
        {width > 0 ? (
          <Svg width={width} height={STRIP_HEIGHT}>
            {heartRate.sets.map(set => (
              <Rect
                key={set.setId}
                x={x(set.startTs)}
                y={0}
                width={Math.max(4, x(set.endTs) - x(set.startTs))}
                height={STRIP_HEIGHT}
                rx={2}
                fill={colorForExercise(set.exerciseKey)}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={{ height: 16 }} className="mt-1.5">
        {width > 0
          ? ticks.map(minute => (
              <Text
                key={minute}
                numberOfLines={1}
                className="absolute text-[10.5px] text-muted"
                style={{
                  left: x(originTs + minute * 60) - TICK_LABEL_WIDTH / 2,
                  width: TICK_LABEL_WIDTH,
                  textAlign: 'center',
                }}
              >
                {t('common.minutesShort', { count: minute })}
              </Text>
            ))
          : null}
      </View>
    </View>
  );
}
