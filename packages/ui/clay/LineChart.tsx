import { Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

// Chart geometry — the SVG is drawn in a fixed viewBox and stretched to fit
// the container width, so all point math happens in these logical units.
const VIEW_W = 320;
const VIEW_H = 160;
const PAD_X = 6;
// Series is mapped into ~130px of vertical space, leaving headroom for the
// last-point marker's stroke and a touch of breathing room top/bottom.
const PLOT_H = 130;
const PLOT_TOP = (VIEW_H - PLOT_H) / 2;
// 40% of the value range is added as padding above/below the series so a flat
// line sits centred and peaks never kiss the edges.
const RANGE_PAD = 0.4;

const AREA_FILL = 'rgba(226, 84, 44, 0.10)';

type Point = { x: number; y: number };

type LineChartProps = {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  style?: ViewStyle;
  className?: string;
};

function toPoints(data: number[]): Point[] {
  const count = data.length;
  if (count === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const rawRange = max - min;
  // Guard against a flat series (range 0) so the line renders centred.
  const range = rawRange === 0 ? 1 : rawRange;
  const padded = range * (1 + RANGE_PAD * 2);
  const lo = min - range * RANGE_PAD;

  const usableW = VIEW_W - PAD_X * 2;
  const step = count > 1 ? usableW / (count - 1) : 0;

  return data.map((value, index) => {
    const x = count > 1 ? PAD_X + step * index : VIEW_W / 2;
    const norm = (value - lo) / padded;
    const y = PLOT_TOP + (1 - norm) * PLOT_H;
    return { x, y };
  });
}

// Catmull-Rom → cubic bezier smoothing: each segment's control points are
// derived from its neighbouring points for a natural, tension-free curve.
function smoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

export function LineChart({
  data,
  labels,
  color = colors.accent,
  height = 170,
  style,
  className = '',
}: LineChartProps) {
  const points = toPoints(data);
  const linePath = smoothPath(points);
  const last = points[points.length - 1];

  // Close the line path down to the baseline and back to form the area fill.
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${VIEW_H} L ${points[0].x} ${VIEW_H} Z`
      : '';

  return (
    <View className={className} style={style}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
      >
        {areaPath ? <Path d={areaPath} fill={AREA_FILL} stroke="none" /> : null}
        {linePath ? (
          <Path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {last ? (
          <Circle
            cx={last.x}
            cy={last.y}
            r={6}
            fill={colors.card}
            stroke={color}
            strokeWidth={3}
          />
        ) : null}
      </Svg>
      {labels && labels.length > 0 ? (
        <View className="mt-[8px] flex-row justify-between">
          {labels.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className="text-[11px] font-[600] text-muted"
            >
              {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
