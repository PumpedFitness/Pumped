import { bodyFatEntries } from '../../data/local/schema/bodyMetrics';
import { MetricHistoryScreen } from './MetricHistoryScreen';
import { colors } from '../../theme/tokens';

export function BodyFatHistoryScreen() {
  return (
    <MetricHistoryScreen
      title="Body Fat"
      unit="%"
      metric="bodyFat"
      table={bodyFatEntries}
      recordedAtColumn={bodyFatEntries.recordedAt}
      formatValue={v => `${v.toFixed(1)}%`}
      lineColor={colors.accent}
      areaTopColor="rgba(198, 123, 82, 0.3)"
      areaBottomColor="rgba(198, 123, 82, 0.0)"
    />
  );
}
