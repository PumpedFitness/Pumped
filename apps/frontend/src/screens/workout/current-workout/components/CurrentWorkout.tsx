import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'heroui-native';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type {
  CurrentWorkoutExercise,
  CurrentWorkoutSet,
} from '@/stores/currentWorkoutModel';
import { colors } from '@/theme/tokens';
import type { ExerciseSelectionResult } from '@/types/exercise';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import {
  SET_TYPE_OPTIONS,
  ExerciseSetTable,
} from '@/components/exercise/set-table';
import { OptionPopup, type PopupOption } from '@/components/clay/option-popup';
import { ConfirmationActions } from '@/components/clay/option-popup/OptionPopupActions';
import { OptionPopupFrame } from '@/components/clay/option-popup/OptionPopupFrame';
import { ClayIcon } from '@/components/icons/ClayIcon';

type CurrentWorkoutProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CurrentWorkout'>;
  exerciseSelection?: ExerciseSelectionResult;
  onChooseExercises: (selectedExerciseIds: string[]) => void;
};

type CurrentWorkoutNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CurrentWorkout'
>;
type FinishWorkout = ReturnType<typeof useCurrentWorkout>['finishWorkout'];
type RemoveSet = ReturnType<typeof useCurrentWorkout>['removeSet'];
type RemoveExercise = ReturnType<typeof useCurrentWorkout>['removeExercise'];
type TemplateFinishChoice = 'keep' | 'update';

type EmptyWorkoutProps = {
  onBack: () => void;
};

function EmptyWorkout({ onBack }: EmptyWorkoutProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-surface-card">
        <ClayIcon name="dumbbell" size={26} color={colors.muted} />
      </View>
      <Text className="t-heading text-center">
        {t('currentWorkout.empty.title')}
      </Text>
      <Text className="t-caption text-center">
        {t('currentWorkout.empty.body')}
      </Text>
      <Button
        className="mt-2 rounded-full"
        variant="secondary"
        feedbackVariant="scale"
        onPress={onBack}
      >
        <Button.Label>{t('currentWorkout.empty.backToPlan')}</Button.Label>
      </Button>
    </View>
  );
}

function completeWorkout(
  t: TFunction,
  navigation: CurrentWorkoutNavigation,
  finishWorkout: FinishWorkout,
  updateTemplate = false,
) {
  try {
    finishWorkout({ updateTemplate });
    navigation.goBack();
  } catch (error) {
    Alert.alert(
      t('currentWorkout.alerts.finishFailedTitle'),
      error instanceof Error ? error.message : t('common.tryAgain'),
    );
  }
}

function requestRemoveSet(
  t: TFunction,
  exercise: CurrentWorkoutExercise,
  set: CurrentWorkoutSet,
  removeSet: RemoveSet,
) {
  if (!set.isDone) {
    removeSet(exercise.id, set.id);
    return;
  }
  Alert.alert(
    t('currentWorkout.alerts.removeSetTitle'),
    t('currentWorkout.alerts.removeSetBody'),
    [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => removeSet(exercise.id, set.id),
      },
    ],
  );
}

function requestRemoveExercise(
  t: TFunction,
  exercise: CurrentWorkoutExercise,
  removeExercise: RemoveExercise,
) {
  const remove = () => removeExercise(exercise.id);
  if (!exercise.sets.some(set => set.isDone)) {
    remove();
    return;
  }
  Alert.alert(
    t('currentWorkout.alerts.removeExerciseTitle'),
    t('currentWorkout.alerts.removeExerciseBody'),
    [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: remove },
    ],
  );
}

function applyExerciseSelection(
  t: TFunction,
  currentExercises: CurrentWorkoutExercise[],
  selection: ExerciseSelectionResult,
  updateExercises: (exerciseIds: string[]) => void,
) {
  const selectedIds = new Set(selection.exerciseIds);
  const removesCompletedExercise = currentExercises.some(
    exercise =>
      !selectedIds.has(exercise.exerciseId) &&
      exercise.sets.some(set => set.isDone),
  );
  if (!removesCompletedExercise) {
    updateExercises(selection.exerciseIds);
    return;
  }
  Alert.alert(
    t('currentWorkout.alerts.removeExercisesTitle'),
    t('currentWorkout.alerts.removeExercisesBody'),
    [
      { text: t('currentWorkout.alerts.keepExercises'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => updateExercises(selection.exerciseIds),
      },
    ],
  );
}

type CurrentWorkoutFooterProps = {
  canFinish: boolean;
  shouldPromptForTemplate: boolean;
  navigation: CurrentWorkoutNavigation;
  finishWorkout: FinishWorkout;
  discardWorkout: () => void;
};

type DiscardWorkoutPopupProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DiscardWorkoutPopup({
  visible,
  onClose,
  onConfirm,
}: DiscardWorkoutPopupProps) {
  const { t } = useTranslation();

  return (
    <OptionPopupFrame
      visible={visible}
      title={t('currentWorkout.alerts.discardTitle')}
      text={t('currentWorkout.alerts.discardBody')}
      footer={
        <ConfirmationActions
          confirmLabel={t('currentWorkout.alerts.discard')}
          disabled={false}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      }
      onClose={onClose}
    >
      {null}
    </OptionPopupFrame>
  );
}

function CurrentWorkoutFooter({
  canFinish,
  shouldPromptForTemplate,
  navigation,
  finishWorkout,
  discardWorkout,
}: CurrentWorkoutFooterProps) {
  const { t } = useTranslation();
  const [templatePopupVisible, setTemplatePopupVisible] = useState(false);
  const [discardPopupVisible, setDiscardPopupVisible] = useState(false);

  const templateFinishOptions: PopupOption<TemplateFinishChoice>[] = [
    {
      value: 'keep',
      label: t('currentWorkout.templatePopup.keep'),
      description: t('currentWorkout.templatePopup.keepDescription'),
    },
    {
      value: 'update',
      label: t('currentWorkout.templatePopup.update'),
      description: t('currentWorkout.templatePopup.updateDescription'),
    },
  ];

  const requestFinish = () => {
    if (!canFinish) {
      return;
    }
    if (shouldPromptForTemplate) {
      setTemplatePopupVisible(true);
      return;
    }
    completeWorkout(t, navigation, finishWorkout);
  };

  const finishWithTemplateChoice = (choice: TemplateFinishChoice) => {
    completeWorkout(t, navigation, finishWorkout, choice === 'update');
  };

  const confirmDiscard = () => {
    discardWorkout();
    navigation.goBack();
  };

  return (
    <>
      <View className="flex-row gap-3 border-t border-border-soft bg-background px-5 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currentWorkout.discardA11y')}
          className="h-12 w-12 items-center justify-center rounded-full border border-border-hairline bg-surface-card active:bg-surface-sunk"
          onPress={() => setDiscardPopupVisible(true)}
        >
          <ClayIcon name="trash" size={19} color={colors.muted} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currentWorkout.finishA11y')}
          accessibilityState={{ disabled: !canFinish }}
          disabled={!canFinish}
          className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full ${
            canFinish ? 'bg-accent' : 'bg-surface-sunk'
          }`}
          onPress={requestFinish}
        >
          <ClayIcon
            name="check"
            size={18}
            color={canFinish ? colors.accentInk : colors.muted}
          />
          <Text
            className={`t-label ${
              canFinish ? 'text-accent-foreground' : 'text-muted'
            }`}
          >
            {t('currentWorkout.finish')}
          </Text>
        </Pressable>
      </View>

      <OptionPopup
        needsConfirmation
        visible={templatePopupVisible}
        title={t('currentWorkout.templatePopup.title')}
        text={t('currentWorkout.templatePopup.text')}
        options={templateFinishOptions}
        onClose={() => setTemplatePopupVisible(false)}
        onSelect={finishWithTemplateChoice}
      />
      <DiscardWorkoutPopup
        visible={discardPopupVisible}
        onClose={() => setDiscardPopupVisible(false)}
        onConfirm={confirmDiscard}
      />
    </>
  );
}

export function CurrentWorkout({
  navigation,
  exerciseSelection,
  onChooseExercises,
}: CurrentWorkoutProps) {
  const { t } = useTranslation();
  const appliedSelectionId = useRef<string | null>(null);
  const {
    currentWorkout,
    exerciseOptions,
    discardWorkout,
    finishWorkout,
    updateSet,
    toggleSetDone,
    addSet,
    removeSet,
    updateExercises,
    removeExercise,
    canFinish,
    structureChanged,
  } = useCurrentWorkout();

  useEffect(() => {
    if (!currentWorkout) {
      // Mark any selection param present while no workout exists as consumed
      // so a stale param can't apply to a workout started later while this
      // screen stays mounted.
      appliedSelectionId.current = exerciseSelection?.id ?? null;
      return;
    }
    if (
      exerciseSelection &&
      exerciseSelection.id !== appliedSelectionId.current
    ) {
      appliedSelectionId.current = exerciseSelection.id;
      applyExerciseSelection(
        t,
        currentWorkout.exercises,
        exerciseSelection,
        updateExercises,
      );
    }
  }, [currentWorkout, exerciseSelection, t, updateExercises]);

  if (!currentWorkout) {
    return <EmptyWorkout onBack={() => navigation.goBack()} />;
  }

  const exerciseNames = new Map(
    exerciseOptions.map(exercise => [exercise.id, exercise.name] as const),
  );
  const allSets = currentWorkout.exercises.flatMap(exercise => exercise.sets);
  const completedSetCount = allSets.filter(set => set.isDone).length;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[24px] bg-moss px-5 py-5">
          <Text className="t-eyebrow text-surface-card/70">
            {t('currentWorkout.inProgress')}
          </Text>
          <Text className="t-title mt-1 text-surface-card">
            {currentWorkout.name}
          </Text>
          <Text className="t-caption mt-2 text-surface-card/70">
            {t('currentWorkout.setsCompleted', {
              completed: completedSetCount,
              total: allSets.length,
            })}
          </Text>
        </View>

        {currentWorkout.exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            name={
              exerciseNames.get(exercise.exerciseId) ??
              t('plan.card.fallbackExercise')
            }
            description={t('currentWorkout.setsDone', {
              done: exercise.sets.filter(set => set.isDone).length,
              total: exercise.sets.length,
            })}
            onRemove={() => requestRemoveExercise(t, exercise, removeExercise)}
          >
            <ExerciseSetTable
              sets={exercise.sets}
              setTypeOptions={SET_TYPE_OPTIONS}
              onAddSet={() => addSet(exercise.id)}
              onChangeSet={(setId, values) =>
                updateSet(exercise.id, setId, values)
              }
              onToggleSetDone={setId => toggleSetDone(exercise.id, setId)}
              onRemoveSet={set => requestRemoveSet(t, exercise, set, removeSet)}
            />
          </ExerciseCard>
        ))}

        <Pressable
          accessibilityRole="button"
          className="min-h-14 flex-row items-center justify-center gap-2 rounded-[20px] border border-dashed border-accent bg-accent-soft px-4"
          onPress={() =>
            onChooseExercises(
              currentWorkout.exercises.map(exercise => exercise.exerciseId),
            )
          }
        >
          <ClayIcon name="plus" size={18} color={colors.accent} />
          <Text className="t-label text-accent">
            {t('currentWorkout.addOrRemoveExercises')}
          </Text>
        </Pressable>
      </ScrollView>

      <CurrentWorkoutFooter
        canFinish={canFinish}
        shouldPromptForTemplate={structureChanged}
        navigation={navigation}
        finishWorkout={finishWorkout}
        discardWorkout={discardWorkout}
      />
    </View>
  );
}
