import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import type { CurrentWorkoutExercise } from '@/stores/currentWorkoutModel';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { exerciseColorTokens } from './exerciseColorTokens';
import { requestRemoveExercise } from './currentWorkoutConfirm';

export type ExerciseTrayState = 'active' | 'upcoming' | 'finished';

type SessionExerciseHeaderProps = {
  index: number;
  name: string;
  exercise: CurrentWorkoutExercise;
  state: ExerciseTrayState;
  /** Stable store action; the confirm flow is bound here, not by the parent,
   *  so this component memoizes cleanly. */
  onRemoveExercise: (exerciseId: string) => void;
};

// A thin, opaque band that pins while scrolling its sets. Only the active
// exercise wears its color — finished read as done, upcoming as disabled.
// Memoized: unchanged exercises don't re-render when a sibling is edited.
export const SessionExerciseHeader = memo(function SessionExerciseHeader({
  index,
  name,
  exercise,
  state,
  onRemoveExercise,
}: SessionExerciseHeaderProps) {
  const { t } = useTranslation();
  const tone = exerciseColorTokens(exercise.color);
  const isActive = state === 'active';
  const isFinished = state === 'finished';
  const doneCount = exercise.sets.filter(set => set.isDone).length;
  const totalCount = exercise.sets.length;

  const titleColor = isActive ? tone.onTile : colors.muted;
  const metaColor = isActive ? tone.onTile : colors.muted;

  return (
    <View
      className="flex-row items-center gap-2.5 px-4 py-2.5"
      style={{
        backgroundColor: isActive ? tone.fg : colors.cardSunk,
        borderBottomWidth: 2,
        borderBottomColor: isActive
          ? tone.fg
          : isFinished
          ? colors.sage
          : colors.line,
      }}
    >
      <View
        className="h-6 min-w-6 items-center justify-center rounded-full px-1.5"
        style={{ backgroundColor: isActive ? tone.onTile : colors.muted }}
      >
        <Text
          className="text-[11px] font-bold tabular-nums"
          style={{ color: isActive ? tone.fg : colors.cream }}
        >
          {index + 1}
        </Text>
      </View>

      <Text
        className="t-heading flex-1"
        numberOfLines={1}
        style={{ color: titleColor }}
      >
        {name}
      </Text>

      {isFinished ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-moss">
          <ClayIcon name="check" size={13} color={colors.cream} />
        </View>
      ) : (
        <Text
          className="text-[12.5px] font-semibold tabular-nums"
          style={{ color: metaColor }}
        >
          {t('currentWorkout.setsDoneShort', {
            done: doneCount,
            total: totalCount,
          })}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('currentWorkout.removeExerciseA11y', { name })}
        className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-sunk"
        onPress={() => {
          void requestRemoveExercise(t, exercise, onRemoveExercise);
        }}
      >
        <ClayIcon
          name="trash"
          size={16}
          color={isActive ? tone.onTile : colors.muted}
        />
      </Pressable>
    </View>
  );
});
