import { Fragment } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { shadows } from '@/theme/tokens';
import { displayWeight } from '@/utils/units';
import type {
  ExerciseChartMetric,
  ExerciseChartPoint,
} from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { formatVolumeValue, formatWeightValue } from './exerciseFormat';

type DashboardStatHeroProps = {
  chartData: Record<ExerciseChartMetric, ExerciseChartPoint[]>;
  weightUnit: WeightUnit;
};

type StatKind = 'weight' | 'volume';

const STATS = [
  {
    metric: 'estimated1Rm',
    labelKey: 'exerciseOverview.dashboard.est1Rm',
    kind: 'weight',
  },
  {
    metric: 'topWeight',
    labelKey: 'exerciseOverview.dashboard.topSet',
    kind: 'weight',
  },
  {
    metric: 'volume',
    labelKey: 'exerciseOverview.dashboard.volume',
    kind: 'volume',
  },
] as const;

const POSITIVE = '#C6D6A8';
const NEGATIVE = '#E7B4AC';

type Delta = { text: string; positive: boolean } | null;

function computeDelta(
  points: readonly ExerciseChartPoint[],
  kind: StatKind,
  weightUnit: WeightUnit,
): Delta {
  const last = points.at(-1);
  const prev = points.at(-2);
  if (!last || !prev) return null;

  if (kind === 'volume') {
    if (prev.value === 0) return null;
    const percent = Math.round(((last.value - prev.value) / prev.value) * 100);
    return {
      text: `${percent >= 0 ? '+' : ''}${percent}%`,
      positive: percent >= 0,
    };
  }

  const diff =
    displayWeight(last.value, weightUnit) -
    displayWeight(prev.value, weightUnit);
  const rounded = Math.round(diff * 10) / 10;
  return {
    text: `${rounded >= 0 ? '+' : ''}${rounded.toFixed(1)}`,
    positive: rounded >= 0,
  };
}

function DeltaPill({ delta }: { delta: Delta }) {
  if (!delta) {
    return (
      <Text className="mt-[5px] text-[13px] font-bold text-cream/40">—</Text>
    );
  }
  const color = delta.positive ? POSITIVE : NEGATIVE;
  const bg = delta.positive
    ? 'bg-[rgba(126,144,97,0.35)]'
    : 'bg-[rgba(178,107,98,0.38)]';
  return (
    <View
      className={`mt-[5px] flex-row items-center gap-[3px] self-start rounded-full px-[7px] py-[2px] ${bg}`}
    >
      <Svg width={10} height={10} viewBox="0 0 12 12">
        <Path
          d={delta.positive ? 'M6 2l4 5H2z' : 'M6 10 2 5h8z'}
          fill={color}
        />
      </Svg>
      <Text className="text-[11px] font-bold" style={{ color }}>
        {delta.text}
      </Text>
    </View>
  );
}

export function DashboardStatHero({
  chartData,
  weightUnit,
}: DashboardStatHeroProps) {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row gap-[10px] rounded-[24px] bg-moss p-4"
      style={shadows.raised}
    >
      {STATS.map((stat, index) => {
        const points = chartData[stat.metric];
        const last = points.at(-1);
        const value = last
          ? stat.kind === 'volume'
            ? formatVolumeValue(last.value, weightUnit)
            : formatWeightValue(last.value, weightUnit)
          : '—';
        const unit = stat.kind === 'weight' && last ? weightUnit : null;

        return (
          <Fragment key={stat.metric}>
            {index > 0 ? (
              <View className="w-px bg-[rgba(243,238,226,0.14)]" />
            ) : null}
            <View className="flex-1">
              <Text className="text-[10.5px] font-bold uppercase tracking-[1px] text-[rgba(243,238,226,0.65)]">
                {t(stat.labelKey)}
              </Text>
              <Text className="mt-[3px] text-[27px] font-bold tracking-[-0.4px] text-cream">
                {value}
                {unit ? (
                  <Text className="text-[15px] font-semibold text-cream">
                    {' '}
                    {unit}
                  </Text>
                ) : null}
              </Text>
              <DeltaPill delta={computeDelta(points, stat.kind, weightUnit)} />
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}
