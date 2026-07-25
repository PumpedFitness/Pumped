import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

type SparklineProps = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  fillArea?: boolean;
};

type Point = { x: number; y: number };

// Map raw values onto the drawable box, inset by half the stroke so round
// caps never clip at the edges. A flat series is pinned to the vertical center.
function toPoints(
  data: number[],
  width: number,
  height: number,
  pad: number,
): Point[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min;
  const innerW = Math.max(0, width - pad * 2);
  const innerH = Math.max(0, height - pad * 2);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  return data.map((value, index) => {
    const t = span === 0 ? 0.5 : (value - min) / span;
    return {
      x: pad + index * stepX,
      y: pad + innerH * (1 - t),
    };
  });
}

// Catmull-Rom → cubic bezier for a smooth line through every point.
function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const { x, y } = points[0];
    return `M ${x} ${y} L ${x} ${y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function Sparkline({
  data,
  color = colors.accent,
  width = 64,
  height = 30,
  strokeWidth = 2,
  fillArea = false,
}: SparklineProps) {
  if (!data || data.length === 0) {
    return <Svg width={width} height={height} />;
  }

  const pad = strokeWidth / 2;
  const points = toPoints(data, width, height, pad);
  const linePath = buildSmoothPath(points);
  const areaPath =
    fillArea && points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';

  return (
    <Svg width={width} height={height}>
      {areaPath ? <Path d={areaPath} fill={color} fillOpacity={0.12} /> : null}
      <Path
        d={linePath}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
