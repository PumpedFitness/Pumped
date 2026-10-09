import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { ExercisePrKind } from '@/hooks/useExerciseAnalytics';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { SharedAchievement } from '@/lib/share/shareTypes';
import { displayWeight } from '@/utils/units';

type AchievementCardProps = {
  achievement: SharedAchievement;
};

type PrLabelKey = `trends.prs.${ExercisePrKind}`;

const PR_LABEL_KEY: Record<ExercisePrKind, PrLabelKey> = {
  topWeight: 'trends.prs.topWeight',
  estimated1Rm: 'trends.prs.estimated1Rm',
  volumeSet: 'trends.prs.volumeSet',
  maxReps: 'trends.prs.maxReps',
};

/**
 * A received personal record. View-only — someone else's record has no place
 * in the receiver's history — so it is presented as a card, not a form.
 * Loads are converted to the receiver's weight unit.
 */
export function AchievementCard({ achievement }: AchievementCardProps) {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const unit = profile.weightUnit;

  const load =
    achievement.weightKg != null && achievement.weightKg > 0
      ? t('trends.prs.load', {
          weight:
            Math.round(displayWeight(achievement.weightKg, unit) * 10) / 10,
          unit,
          reps: achievement.reps,
        })
      : t('trends.prs.reps', { reps: achievement.reps });
  const date = new Date(achievement.achievedAt).toLocaleDateString(
    i18n.language,
    { day: 'numeric', month: 'long', year: 'numeric' },
  );

  return (
    <View className="items-center gap-2 rounded-[28px] bg-moss px-6 py-9">
      <View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-surface-card/10">
        <ClayIcon name="award" size={28} color={colors.accent} />
      </View>
      <Text className="t-eyebrow text-surface-card/70">
        {t(PR_LABEL_KEY[achievement.kind])}
      </Text>
      <Text className="t-title text-center text-surface-card">
        {achievement.exerciseName}
      </Text>
      <Text className="mt-1 text-[34px] font-[800] tracking-[-0.5px] text-surface-card">
        {load}
      </Text>
      <Text className="t-caption mt-2 text-center text-surface-card/70">
        {date}
      </Text>
      <Text className="t-caption text-center text-surface-card/70">
        {t('share.receive.achievement.setIn', {
          workout: achievement.workoutName,
        })}
      </Text>
    </View>
  );
}
