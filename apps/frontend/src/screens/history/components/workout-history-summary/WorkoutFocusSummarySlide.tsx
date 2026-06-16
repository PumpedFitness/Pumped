import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  BodyPartHighlighter,
  MUSCLE_GROUP_BODY_PARTS,
  type BodyPartHighlight,
  type MuscleGroupBodyPartKey,
} from '@/components/body';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { colors } from '@/theme/tokens';
import { SummarySlideHeader } from './SummarySlideHeader';
import {
  buildMuscleFocus,
  getMonthSummary,
} from './workoutHistorySummaryModel';

type MuscleFocusItem = {
  name: string;
  share: number;
};

type WorkoutFocusSummarySlideProps = {
  workouts: WorkoutHistoryItem[];
};

const MUSCLE_GROUP_NAME_KEYS = {
  Abs: 'abs',
  Back: 'back',
  Biceps: 'biceps',
  Calves: 'calves',
  Chest: 'chest',
  Forearms: 'forearms',
  Glutes: 'glutes',
  Hamstrings: 'hamstrings',
  Quads: 'quads',
  Shoulders: 'shoulders',
  Traps: 'traps',
  Triceps: 'triceps',
} as const satisfies Record<string, MuscleGroupBodyPartKey>;

const FOCUS_BODY_PALETTE = [
  'rgba(198, 123, 82, 0.48)',
  colors.accent,
  colors.accentHoney,
  colors.cream,
] as const;

function getFocusIntensity(share: number): number {
  if (share >= 0.35) {
    return 4;
  }
  if (share >= 0.22) {
    return 3;
  }
  if (share >= 0.12) {
    return 2;
  }
  return 1;
}

function getMuscleGroupKey(name: string): MuscleGroupBodyPartKey | undefined {
  const key = name as keyof typeof MUSCLE_GROUP_NAME_KEYS;
  return Object.prototype.hasOwnProperty.call(MUSCLE_GROUP_NAME_KEYS, key)
    ? MUSCLE_GROUP_NAME_KEYS[key]
    : undefined;
}

function buildBodyHighlights(focus: MuscleFocusItem[]): BodyPartHighlight[] {
  const intensityByPart = new Map<BodyPartHighlight['part'], number>();

  focus.forEach(item => {
    const muscleKey = getMuscleGroupKey(item.name);
    if (!muscleKey) {
      return;
    }

    MUSCLE_GROUP_BODY_PARTS[muscleKey].forEach(part => {
      const intensity = getFocusIntensity(item.share);
      intensityByPart.set(
        part,
        Math.max(intensityByPart.get(part) ?? 0, intensity),
      );
    });
  });

  return [...intensityByPart].map(([part, intensity]) => ({
    part,
    intensity,
  }));
}

export function WorkoutFocusSummarySlide({
  workouts,
}: WorkoutFocusSummarySlideProps) {
  const { t, i18n } = useTranslation();
  const summary = getMonthSummary(workouts, i18n.language);
  const focus = buildMuscleFocus(summary.workouts, Number.MAX_SAFE_INTEGER);
  const bodyHighlights = buildBodyHighlights(focus);

  return (
    <View className="flex-1 gap-5 p-5" collapsable={false}>
      <SummarySlideHeader
        eyebrow={t('history.summary.focus.eyebrow')}
        title={focus[0]?.name ?? t('history.summary.focus.emptyTitle')}
        description={
          focus.length > 0
            ? t('history.summary.focus.description', { month: summary.label })
            : t('history.summary.focus.emptyDescription')
        }
        icon="target"
      />

      <View className="flex-1 gap-4 rounded-[22px] border border-border-on-moss bg-white/[0.06] p-4">
        {bodyHighlights.length > 0 ? (
          <>
            <View className="flex-1 flex-row items-center justify-center gap-3">
              <View className="flex-1 items-center">
                <BodyPartHighlighter
                  border="rgba(243, 238, 226, 0.36)"
                  defaultFill="rgba(243, 238, 226, 0.10)"
                  defaultStroke="rgba(243, 238, 226, 0.18)"
                  highlights={bodyHighlights}
                  palette={FOCUS_BODY_PALETTE}
                  scale={0.55}
                  view="front"
                />
              </View>
              <View className="flex-1 items-center">
                <BodyPartHighlighter
                  border="rgba(243, 238, 226, 0.36)"
                  defaultFill="rgba(243, 238, 226, 0.10)"
                  defaultStroke="rgba(243, 238, 226, 0.18)"
                  highlights={bodyHighlights}
                  palette={FOCUS_BODY_PALETTE}
                  scale={0.55}
                  view="back"
                />
              </View>
            </View>
            <View className="flex-row flex-wrap justify-center gap-2">
              {focus.slice(0, 4).map(item => (
                <View
                  key={item.name}
                  className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1"
                >
                  <View
                    className="size-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        FOCUS_BODY_PALETTE[getFocusIntensity(item.share) - 1],
                    }}
                  />
                  <Text className="text-[11px] font-semibold text-cream">
                    {item.name}
                  </Text>
                  <Text className="text-[11px] tabular-nums text-cream-dim">
                    {Math.round(item.share * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="t-caption max-w-[240px] text-center text-cream-dim">
              {t('history.summary.focus.emptyChart')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
