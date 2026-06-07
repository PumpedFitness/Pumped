import { bodyWeightEntries } from '../data/local/schema/bodyMetrics';
import { useUserProfile } from '../hooks/useUserProfile';
import { formatWeight, toKg } from '../utils/units';
import { MetricHistoryScreen } from './MetricHistoryScreen';

export function WeightHistoryScreen() {
  const { profile } = useUserProfile();
  const weightUnit = profile.weightUnit;

  return (
    <MetricHistoryScreen
      title="Weight"
      unit={weightUnit}
      table={bodyWeightEntries}
      recordedAtColumn={bodyWeightEntries.recordedAt}
      formatValue={v => formatWeight(v, weightUnit)}
      parseInput={text => {
        const n = parseFloat(text);
        if (isNaN(n) || n <= 0) return null;
        return toKg(n, weightUnit);
      }}
      inputPlaceholder={weightUnit === 'kg' ? 'e.g. 80.5' : 'e.g. 177.5'}
    />
  );
}
