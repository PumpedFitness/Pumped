import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from 'heroui-native';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { OptionSelectorSheet } from '@pumped/ui/forms/OptionSelectorSheet';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { usePeriodizationDesign } from './PeriodizationDesignContext';
import {
  newPeriodizationWorkout,
  type PeriodizationWorkout,
} from './periodizationDraft';

type PeriodizationPhaseEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PeriodizationPhaseEditor'
>;

type WeekGroup = {
  week: number;
  workouts: PeriodizationWorkout[];
};

function groupByWeek(workouts: PeriodizationWorkout[]): WeekGroup[] {
  const groups = new Map<number, PeriodizationWorkout[]>();
  [...workouts]
    .sort((a, b) => a.week - b.week || a.weekday - b.weekday)
    .forEach(workout => {
      groups.set(workout.week, [...(groups.get(workout.week) ?? []), workout]);
    });
  return [...groups].map(([week, groupedWorkouts]) => ({
    week,
    workouts: groupedWorkouts,
  }));
}

export function PeriodizationPhaseEditorScreen({
  navigation,
  route,
}: PeriodizationPhaseEditorScreenProps) {
  const { t } = useTranslation();
  const { draft, updateDraft } = usePeriodizationDesign();
  const { templates } = useWorkoutTemplates();
  const [pickerOpen, setPickerOpen] = useState(false);
  const phase = draft?.phases.find(item => item.id === route.params.phaseId);

  if (!draft || !phase) {
    return null;
  }

  const updatePhase = (next: typeof phase) =>
    updateDraft({
      ...draft,
      phases: draft.phases.map(item => (item.id === next.id ? next : item)),
    });
  const editWorkout = (workoutId: string) =>
    navigation.navigate('PeriodizationWorkoutEditor', {
      phaseId: phase.id,
      workoutId,
    });
  const createWorkout = () => {
    const workout = newPeriodizationWorkout(phase);
    updatePhase({ ...phase, workouts: [...phase.workouts, workout] });
    editWorkout(workout.id);
  };

  return (
    <AppView edges={['top', 'bottom']}>
      <ModalHeader
        title={t('schedule.periodization.phaseEditorTitle')}
        rightLabel={t('common.done')}
        onLeftPress={() => navigation.goBack()}
        onRightPress={() => navigation.goBack()}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-10 pt-5"
        keyboardShouldPersistTaps="handled"
      >
        <Input
          autoFocus={!phase.name}
          className="h-[54px] rounded-[18px] border-border-hairline bg-surface-card px-4 text-foreground"
          placeholder={t('schedule.periodization.phaseNamePlaceholder')}
          value={phase.name}
          onChangeText={name => updatePhase({ ...phase, name })}
        />

        <View className="gap-4">
          <Text className="t-eyebrow">
            {t('schedule.periodization.workoutsLabel')}
          </Text>
          {phase.workouts.length === 0 ? (
            <View className="rounded-[18px] border border-dashed border-border-soft px-4 py-7">
              <Text className="t-caption text-center text-muted">
                {t('schedule.periodization.noPhaseWorkouts')}
              </Text>
            </View>
          ) : (
            groupByWeek(phase.workouts).map(group => (
              <View key={group.week} className="gap-2">
                <Text className="t-eyebrow px-1 text-muted">
                  {t('schedule.periodization.weekHeading', {
                    week: group.week,
                  })}
                </Text>
                {group.workouts.map(workout => (
                  <Pressable
                    key={workout.id}
                    accessibilityRole="button"
                    className="flex-row items-center gap-3 rounded-[18px] bg-surface-card px-4 py-3 active:bg-surface-sunk"
                    onPress={() => editWorkout(workout.id)}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-accent-soft">
                      <Text className="text-[12px] font-black text-accent">
                        {t('schedule.periodization.dayShort', {
                          day: workout.weekday,
                        })}
                      </Text>
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="t-label" numberOfLines={1}>
                        {workout.template.name ||
                          t('schedule.periodization.untitledWorkout')}
                      </Text>
                      {workout.template.description ? (
                        <Text className="t-caption mt-0.5" numberOfLines={1}>
                          {workout.template.description}
                        </Text>
                      ) : null}
                    </View>
                    <ClayIcon name="chevron" size={16} color={colors.muted} />
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </View>

        <View className="flex-row gap-2">
          <Button
            className="h-12 flex-1 rounded-full"
            variant="secondary"
            feedbackVariant="scale"
            onPress={createWorkout}
          >
            <ClayIcon name="plus" size={16} color={colors.accent} />
            <Button.Label>
              {t('schedule.periodization.newWorkout')}
            </Button.Label>
          </Button>
          <Button
            className="h-12 flex-1 rounded-full"
            variant="secondary"
            feedbackVariant="scale"
            onPress={() => setPickerOpen(true)}
          >
            <Button.Label>
              {t('schedule.periodization.fromLibrary')}
            </Button.Label>
          </Button>
        </View>
      </ScrollView>

      <OptionSelectorSheet
        visible={pickerOpen}
        title={t('schedule.periodization.pickWorkout')}
        value=""
        options={templates.map(template => ({
          value: template.id,
          label: template.name,
        }))}
        onClose={() => setPickerOpen(false)}
        onChange={templateId => {
          const template = templates.find(item => item.id === templateId);
          if (!template) {
            return;
          }
          const workout = newPeriodizationWorkout(phase, template);
          updatePhase({ ...phase, workouts: [...phase.workouts, workout] });
          setPickerOpen(false);
          editWorkout(workout.id);
        }}
      />
    </AppView>
  );
}
