import { useState } from 'react';
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  BodyPartHighlighter,
  MUSCLE_GROUP_BODY_PARTS,
  type BodyPartHighlight,
  type MuscleGroupBodyPartKey,
} from '@/components/body';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import { colors } from '@/theme/tokens';
import type { ExerciseToEdit } from '@/components/exercise/useExerciseDraft';

type ExerciseOverviewHeaderProps = {
  exercise: ExerciseToEdit;
  onEdit: () => void;
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

const HEADER_BODY_PALETTE = [
  'rgba(198, 123, 82, 0.48)',
  colors.accent,
  colors.accentHoney,
  colors.cream,
] as const;

function getMuscleGroupKey(name: string): MuscleGroupBodyPartKey | undefined {
  const key = name as keyof typeof MUSCLE_GROUP_NAME_KEYS;
  return Object.prototype.hasOwnProperty.call(MUSCLE_GROUP_NAME_KEYS, key)
    ? MUSCLE_GROUP_NAME_KEYS[key]
    : undefined;
}

function buildBodyHighlights(muscleGroups: string[]): BodyPartHighlight[] {
  const parts = new Set<BodyPartHighlight['part']>();

  muscleGroups.forEach(group => {
    const key = getMuscleGroupKey(group);
    if (!key) return;
    MUSCLE_GROUP_BODY_PARTS[key].forEach(part => parts.add(part));
  });

  return [...parts].map(part => ({ part, intensity: 3 }));
}

export function ExerciseOverviewHeader({
  exercise,
  onEdit,
}: ExerciseOverviewHeaderProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [activePage, setActivePage] = useState(0);
  const exerciseOption = useExerciseOptions().find(
    option => option.id === exercise.id,
  );
  const muscleGroups = exerciseOption?.muscleGroupNames ?? [];
  const bodyHighlights = buildBodyHighlights(muscleGroups);
  const pageWidth = Math.max(260, width - 72);
  const pageStep = pageWidth + 12;
  const pageCount = 2;

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const x = event.nativeEvent.contentOffset.x;
    setActivePage(
      Math.min(pageCount - 1, Math.max(0, Math.round(x / pageStep))),
    );
  };

  return (
    <View className="gap-4 rounded-[28px] bg-moss px-5 py-5">
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1">
          <Text className="t-eyebrow text-surface-card/70">
            {exerciseOption?.typeName ?? t('exerciseOverview.noType')}
          </Text>
          <Text className="t-title mt-1 text-surface-card" numberOfLines={3}>
            {exercise.name}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('exerciseOverview.editA11y')}
          onPress={onEdit}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface-card/15 active:opacity-70"
        >
          <ClayIcon name="edit" size={18} color={colors.card} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={pageStep}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3"
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        <View
          className="h-72 overflow-hidden rounded-[24px] bg-surface-card/15"
          style={{ width: pageWidth }}
        >
          {exercise.picture ? (
            <Image
              source={{ uri: exercise.picture }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <ClayIcon name="dumbbell" size={54} color={colors.card} />
            </View>
          )}
        </View>

        <View
          className="h-72 items-center justify-center rounded-[24px] bg-surface-card/10 px-4 py-3"
          style={{ width: pageWidth }}
        >
          {bodyHighlights.length > 0 ? (
            <View className="flex-row items-center justify-center gap-4">
              <BodyPartHighlighter
                border="rgba(243, 238, 226, 0.36)"
                defaultFill="rgba(243, 238, 226, 0.10)"
                defaultStroke="rgba(243, 238, 226, 0.18)"
                highlights={bodyHighlights}
                palette={HEADER_BODY_PALETTE}
                scale={0.58}
                view="front"
              />
              <BodyPartHighlighter
                border="rgba(243, 238, 226, 0.36)"
                defaultFill="rgba(243, 238, 226, 0.10)"
                defaultStroke="rgba(243, 238, 226, 0.18)"
                highlights={bodyHighlights}
                palette={HEADER_BODY_PALETTE}
                scale={0.58}
                view="back"
              />
            </View>
          ) : (
            <Text className="t-caption text-center text-surface-card/70">
              {t('exerciseOverview.noMuscleGroups')}
            </Text>
          )}
        </View>
      </ScrollView>

      <View className="flex-row justify-center gap-2">
        {Array.from({ length: pageCount }, (_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              activePage === index
                ? 'w-6 bg-surface-card'
                : 'w-2 bg-surface-card/35'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
