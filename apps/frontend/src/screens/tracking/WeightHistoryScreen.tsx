import { bodyWeightEntries } from '../../data/local/schema/bodyMetrics';
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatWeight } from '../../utils/units';
import { MetricHistoryScreen } from './MetricHistoryScreen';

export function WeightHistoryScreen() {
  const { profile } = useUserProfile();
  const weightUnit = profile.weightUnit;

  return (
    <MetricHistoryScreen
      title="Weight"
      unit={weightUnit}
      metric="weight"
      table={bodyWeightEntries}
      recordedAtColumn={bodyWeightEntries.recordedAt}
      formatValue={v => formatWeight(v, weightUnit)}
    />
  );
}
