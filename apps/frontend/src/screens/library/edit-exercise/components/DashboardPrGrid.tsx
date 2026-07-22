import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import type {
  ExerciseDerivedPr,
  ExercisePrKind,
} from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  formatShortDate,
  formatVolumeValue,
  formatWeightValue,
} from './exerciseFormat';

type DashboardPrGridProps = {
  prs: ExerciseDerivedPr[];
  weightUnit: WeightUnit;
};

const ORDER: ExercisePrKind[] = [
  'estimated1Rm',
  'topWeight',
  'volumeSet',
  'maxReps',
];

const LABEL_KEYS = {
  estimated1Rm: 'exerciseOverview.dashboard.records.estimated1Rm',
  topWeight: 'exerciseOverview.dashboard.records.topWeight',
  volumeSet: 'exerciseOverview.dashboard.records.volumeSet',
  maxReps: 'exerciseOverview.dashboard.records.maxReps',
} as const;

function prValue(
  pr: ExerciseDerivedPr,
  weightUnit: WeightUnit,
  t: TFunction,
): { value: string; unit: string } {
  if (pr.kind === 'maxReps') {
    return {
      value: pr.value.toLocaleString(),
      unit: t('exerciseOverview.analytics.reps'),
    };
  }
  if (pr.kind === 'volumeSet') {
    return { value: formatVolumeValue(pr.value, weightUnit), unit: weightUnit };
  }
  return { value: formatWeightValue(pr.value, weightUnit), unit: weightUnit };
}

function prSub(
  pr: ExerciseDerivedPr,
  weightUnit: WeightUnit,
  language: string,
  t: TFunction,
): string {
  const date = formatShortDate(pr.achievedAt, language);
  if (pr.weightKg != null) {
    return `${formatWeightValue(pr.weightKg, weightUnit)} × ${
      pr.reps
    } · ${date}`;
  }
  return `${pr.reps} ${t('exerciseOverview.analytics.reps')} · ${date}`;
}

function PrCard({
  pr,
  weightUnit,
}: {
  pr: ExerciseDerivedPr;
  weightUnit: WeightUnit;
}) {
  const { t, i18n } = useTranslation();
  const { value, unit } = prValue(pr, weightUnit, t);

  return (
    <View className="flex-1 rounded-[18px] border border-border-hairline bg-surface-card p-[13px]">
      <View className="flex-row items-center gap-[6px]">
        <ClayIcon name="award" size={14} color={colors.accent} />
        <Text className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted">
          {t(LABEL_KEYS[pr.kind])}
        </Text>
      </View>
      <Text className="mt-2 text-[22px] font-bold tracking-[-0.3px] text-foreground">
        {value}
        <Text className="text-[13px] font-semibold text-text-secondary">
          {' '}
          {unit}
        </Text>
      </Text>
      <Text className="mt-[3px] text-[11.5px] text-muted">
        {prSub(pr, weightUnit, i18n.language, t)}
      </Text>
    </View>
  );
}

export function DashboardPrGrid({ prs, weightUnit }: DashboardPrGridProps) {
  const { t } = useTranslation();
  const byKind = new Map(prs.map(pr => [pr.kind, pr]));
  const ordered = ORDER.map(kind => byKind.get(kind)).filter(
    (pr): pr is ExerciseDerivedPr => pr != null,
  );

  if (ordered.length === 0) {
    return (
      <View className="rounded-[18px] border border-dashed border-border-soft px-4 py-6">
        <Text className="text-center text-[13.5px] font-semibold text-foreground">
          {t('exerciseOverview.pr.emptyTitle')}
        </Text>
        <Text className="mt-2 text-center text-[12.5px] text-text-secondary">
          {t('exerciseOverview.pr.emptyBody')}
        </Text>
      </View>
    );
  }

  const rows: ExerciseDerivedPr[][] = [];
  for (let i = 0; i < ordered.length; i += 2) {
    rows.push(ordered.slice(i, i + 2));
  }

  return (
    <View className="gap-[10px]">
      {rows.map((row, index) => (
        <View key={index} className="flex-row gap-[10px]">
          {row.map(pr => (
            <PrCard key={pr.kind} pr={pr} weightUnit={weightUnit} />
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
