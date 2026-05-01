import {View, Text} from 'react-native';
import Svg, {Rect, Text as SvgText} from 'react-native-svg';
import {colors} from '../theme/tokens';

const heatColors = [
  colors.surfaceInput,          // 0 - no activity
  'rgba(212, 165, 116, 0.18)',  // 1
  'rgba(212, 165, 116, 0.40)',  // 2
  'rgba(212, 165, 116, 0.70)',  // 3
  colors.accent,                // 4 - max
];

interface YearHeatmapProps {
  data: Map<string, number>;
  weeks?: number;
  cellSize?: number;
  gap?: number;
}

export function YearHeatmap({
  data = new Map(),
  weeks = 26,
  cellSize = 11,
  gap = 3,
}: YearHeatmapProps) {
  const today = new Date();
  const endDow = today.getDay();
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - endDow);
  const startDate = new Date(lastWeekStart);
  startDate.setDate(lastWeekStart.getDate() - (weeks - 1) * 7);

  const rows = 7;
  const w = weeks * (cellSize + gap) - gap;
  const h = rows * (cellSize + gap) - gap + 18;

  const monthLabels: {c: number; label: string}[] = [];
  let lastMonth = -1;
  const cells: {c: number; r: number; iso: string; v: number}[] = [];

  for (let c = 0; c < weeks; c++) {
    for (let r = 0; r < rows; r++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + c * 7 + r);
      if (d > today) continue;
      const iso = d.toISOString().slice(0, 10);
      const v = data.get(iso) || 0;
      cells.push({c, r, iso, v});
      if (r === 0 && d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        monthLabels.push({
          c,
          label: d.toLocaleString('en-US', {month: 'short'}).toUpperCase(),
        });
      }
    }
  }

  return (
    <View
      style={{
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        padding: 16,
      }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {monthLabels.map((m, i) => (
          <SvgText
            key={i}
            x={m.c * (cellSize + gap)}
            y={10}
            fontFamily="monospace"
            fontSize={9}
            letterSpacing={0.54}
            fill={colors.textMuted}>
            {m.label}
          </SvgText>
        ))}
        {cells.map(({c, r, iso, v}) => (
          <Rect
            key={iso}
            x={c * (cellSize + gap)}
            y={r * (cellSize + gap) + 18}
            width={cellSize}
            height={cellSize}
            rx={1}
            fill={heatColors[v]}
            stroke={v === 0 ? colors.borderSoft : 'transparent'}
            strokeWidth={v === 0 ? 1 : 0}
          />
        ))}
      </Svg>
      {/* Legend */}
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12}}>
        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.66,
            textTransform: 'uppercase',
            color: colors.textMuted,
          }}>
          Less
        </Text>
        {heatColors.map((c, i) => (
          <View
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 1,
              backgroundColor: c,
              borderWidth: 1,
              borderColor: colors.borderSoft,
            }}
          />
        ))}
        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.66,
            textTransform: 'uppercase',
            color: colors.textMuted,
          }}>
          More
        </Text>
      </View>
    </View>
  );
}
