import {View} from 'react-native';
import Svg, {Path, Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import {colors} from '../theme/tokens';

function smoothPath(points: {x: number; y: number}[], tension = 0.5): string {
  if (points.length < 2) return '';
  const t = tension;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + ((p2.x - p0.x) * t) / 6;
    const c1y = p1.y + ((p2.y - p0.y) * t) / 6;
    const c2x = p2.x - ((p3.x - p1.x) * t) / 6;
    const c2y = p2.y - ((p3.y - p1.y) * t) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  showEnd?: boolean;
}

export function Sparkline({data = [], width = 96, height = 28, showEnd = true}: SparklineProps) {
  if (!data.length) {
    return <View style={{width, height, backgroundColor: colors.surfaceInput, borderRadius: 2}} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 3;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = data.map((y, i) => ({
    x: pad + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: pad + (1 - (y - min) / (max - min || 1)) * innerH,
  }));

  const linePath = smoothPath(points);
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x} ${height - pad} L ${points[0].x} ${height - pad} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#sparkGrad)" />
      <Path
        d={linePath}
        fill="none"
        stroke={colors.accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEnd && (
        <Circle
          cx={last.x}
          cy={last.y}
          r={2.5}
          fill={colors.accent}
          stroke={colors.bg}
          strokeWidth={1}
        />
      )}
    </Svg>
  );
}
