import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { colors } from '@pumped/ui/theme/tokens';
import type { CivilDate } from '@/lib/health/civilDate';
import {
  annotatedIndexSpans,
  type Annotation,
} from '@/lib/health/algorithms/annotations';
import type { UsualRange } from '@/lib/health/algorithms/params';
import type { SeriesPoint } from '@/lib/health/stats/series';
import { BandChart } from './BandChart';

type ScrubbableChartProps = {
  points: readonly SeriesPoint[];
  band: UsualRange | null;
  width: number;
  height: number;
  /** Formatiert den Wert unter dem Finger, samt Einheit. */
  formatValue: (value: number) => string;
  formatDate: (date: CivilDate) => string;
  /** Markierungen des Nutzers — getönt hinter der Linie. */
  annotations?: readonly Annotation[];
};

const PAD = 6;

/**
 * Ein Verlauf, den man anfassen kann.
 *
 * Ohne Scrubbing ist eine Sparkline eine Form: Man sieht, dass es hoch- und
 * runterging, aber nicht wann und wie viel. Der Finger löst genau das auf —
 * und weil er den Punkt verdeckt, steht die Ablesung **über** dem Diagramm,
 * nicht daneben.
 *
 * Bewusst `Gesture.Pan` mit `minDistance(0)` statt eines Long-Press: Ein
 * Verlauf lädt zum Entlangfahren ein, und eine Verzögerung vor dem ersten Wert
 * fühlt sich wie ein hängender Screen an.
 */
export function ScrubbableChart({
  points,
  band,
  width,
  height,
  formatValue,
  formatDate,
  annotations = [],
}: ScrubbableChartProps) {
  const [index, setIndex] = useState<number | null>(null);

  const pick = useCallback(
    (x: number) => {
      if (points.length < 2) return;
      const inner = width - PAD * 2;
      const step = inner / (points.length - 1);
      const nearest = Math.round((x - PAD) / step);
      setIndex(Math.max(0, Math.min(points.length - 1, nearest)));
    },
    [points.length, width],
  );

  const clear = useCallback(() => setIndex(null), []);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin(event => runOnJS(pick)(event.x))
    .onUpdate(event => runOnJS(pick)(event.x))
    .onFinalize(() => runOnJS(clear)());

  const active = index === null ? null : points[index];

  return (
    <View>
      <View className="h-[18px] justify-end">
        {active !== undefined && active !== null ? (
          <Text className="text-[12px] font-semibold text-foreground">
            {formatDate(active.date)}
            <Text className="text-muted"> · </Text>
            {formatValue(active.value)}
          </Text>
        ) : null}
      </View>

      <GestureDetector gesture={pan}>
        {/* Der Treffbereich ist die volle Kartenbreite, nicht die Linie —
            eine 2 px breite Kurve trifft niemand. */}
        <View collapsable={false}>
          <BandChart
            values={points.map(point => point.value)}
            band={band}
            width={width}
            height={height}
            highlightIndex={index}
            highlightColor={colors.accent}
            annotatedSpans={annotatedIndexSpans(
              points.map(point => point.date),
              annotations,
            )}
          />
        </View>
      </GestureDetector>
    </View>
  );
}
