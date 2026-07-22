import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type {
  ExerciseDerivedPr,
  ExercisePrKind,
} from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { colors } from '@/theme/tokens';
import { displayWeight, formatWeight } from '@/utils/units';

type ExercisePrSectionProps = {
  prs: ExerciseDerivedPr[];
  weightUnit: WeightUnit;
};

function getPrLabel(t: TFunction, kind: ExercisePrKind): string {
  const labels = {
    volumeSet: t('exerciseOverview.pr.types.volumeSet'),
    topWeight: t('exerciseOverview.pr.types.topWeight'),
    estimated1Rm: t('exerciseOverview.pr.types.estimated1Rm'),
    maxReps: t('exerciseOverview.pr.types.maxReps'),
  };
  return labels[kind];
}

function formatDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPrValue(
  t: TFunction,
  pr: ExerciseDerivedPr,
  weightUnit: WeightUnit,
): string {
  if (pr.kind === 'maxReps') {
    return `${pr.value.toLocaleString()} ${t(
      'exerciseOverview.analytics.reps',
    )}`;
  }

  if (pr.kind === 'volumeSet') {
    const value = displayWeight(pr.value, weightUnit);
    return `${Math.round(value).toLocaleString()} ${weightUnit}`;
  }

  return formatWeight(pr.value, weightUnit);
}

function formatSetSummary(
  t: TFunction,
  pr: ExerciseDerivedPr,
  weightUnit: WeightUnit,
): string {
  const weight =
    pr.weightKg == null ? null : formatWeight(pr.weightKg, weightUnit);
  return weight
    ? `${weight} x ${pr.reps}`
    : `${pr.reps} ${t('exerciseOverview.analytics.reps')}`;
}

export function ExercisePrSection({ prs, weightUnit }: ExercisePrSectionProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card>
      <Text className="t-heading">{t('exerciseOverview.pr.title')}</Text>
      <Text className="t-caption mt-1 text-text-secondary">
        {t('exerciseOverview.pr.subtitle')}
      </Text>

      <View className="mt-4 gap-2">
        {prs.length > 0 ? (
          prs.map(pr => (
            <View
              key={pr.kind}
              className="flex-row items-center gap-3 rounded-[18px] border border-border-soft px-3 py-3"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk">
                <ClayIcon name="award" size={18} color={colors.accent} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="t-label">{getPrLabel(t, pr.kind)}</Text>
                <Text className="t-title mt-0.5" numberOfLines={1}>
                  {formatPrValue(t, pr, weightUnit)}
                </Text>
                <Text className="t-caption mt-1 text-text-secondary">
                  {formatSetSummary(t, pr, weightUnit)} · {pr.workoutName} ·{' '}
                  {formatDate(pr.achievedAt, i18n.language)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="rounded-[18px] border border-dashed border-border-soft px-4 py-6">
            <Text className="t-label text-center">
              {t('exerciseOverview.pr.emptyTitle')}
            </Text>
            <Text className="t-caption mt-2 text-center text-text-secondary">
              {t('exerciseOverview.pr.emptyBody')}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
