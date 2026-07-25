import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { shadows } from '@pumped/ui';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  ExerciseDerivedPr,
  ExercisePrKind,
} from '@/hooks/useExerciseAnalytics';
import { displayWeight } from '@/utils/units';

type PersonalRecordsSectionProps = {
  prs: ExerciseDerivedPr[];
  exerciseName: string | null;
  weightUnit: WeightUnit;
};

type PrLabelKey = `trends.prs.${ExercisePrKind}`;

const PR_LABEL_KEY: Record<ExercisePrKind, PrLabelKey> = {
  topWeight: 'trends.prs.topWeight',
  estimated1Rm: 'trends.prs.estimated1Rm',
  volumeSet: 'trends.prs.volumeSet',
  maxReps: 'trends.prs.maxReps',
};

function formatLoad(
  t: TFunction,
  pr: ExerciseDerivedPr,
  weightUnit: WeightUnit,
): string {
  if (pr.weightKg != null && pr.weightKg > 0) {
    const weight = displayWeight(pr.weightKg, weightUnit);
    return t('trends.prs.load', {
      weight: Math.round(weight * 10) / 10,
      unit: weightUnit,
      reps: pr.reps,
    });
  }
  return t('trends.prs.reps', { reps: pr.reps });
}

function formatPrDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
  });
}

export function PersonalRecordsSection({
  prs,
  exerciseName,
  weightUnit,
}: PersonalRecordsSectionProps) {
  const { t, i18n } = useTranslation();

  if (prs.length === 0 || !exerciseName) {
    return null;
  }

  return (
    <View className="gap-[14px]">
      <Text className="text-[20px] font-[800] leading-none tracking-[-0.2px] text-foreground">
        {t('trends.prs.title')}
      </Text>
      <Text className="t-caption -mt-2">
        {t('trends.prs.subtitle', { name: exerciseName })}
      </Text>

      <View className="gap-[10px]">
        {prs.map(pr => (
          <View
            key={pr.kind}
            className="flex-row items-center gap-3 rounded-[22px] border border-border-hairline bg-surface-card px-[18px] py-[16px]"
            style={shadows.row}
          >
            <Text className="flex-1 text-[15px] font-[700] leading-[1.2] text-foreground">
              {t(PR_LABEL_KEY[pr.kind])}
            </Text>
            <Text className="text-[15px] font-[700] text-foreground">
              {formatLoad(t, pr, weightUnit)}
            </Text>
            <Text className="w-[58px] text-right text-[12px] font-[600] text-muted">
              {formatPrDate(pr.achievedAt, i18n.language)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
