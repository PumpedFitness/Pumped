import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { WorkoutTemplateEditor } from '@/screens/library/template-editor/components/WorkoutTemplateEditor';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { usePeriodizationDesign } from './PeriodizationDesignContext';
import { templateFromInput } from './periodizationDraft';

type PeriodizationWorkoutEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PeriodizationWorkoutEditor'
>;

type NumberStepperProps = {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
};

function NumberStepper({
  label,
  value,
  min,
  max,
  onChange,
}: NumberStepperProps) {
  return (
    <View className="flex-1 gap-2 rounded-[20px] bg-surface-card p-3">
      <Text className="t-caption text-muted">{label}</Text>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk"
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <ClayIcon name="minus" size={15} color={colors.ink2} />
        </Pressable>
        <Text className="text-[20px] font-black text-foreground tabular-nums">
          {value}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk"
          onPress={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
        >
          <ClayIcon name="plus" size={15} color={colors.ink2} />
        </Pressable>
      </View>
    </View>
  );
}

export function PeriodizationWorkoutEditorScreen({
  navigation,
  route,
}: PeriodizationWorkoutEditorScreenProps) {
  const { t } = useTranslation();
  const { draft, updateDraft } = usePeriodizationDesign();
  const { exerciseOptions } = useWorkoutTemplates();
  const phase = draft?.phases.find(item => item.id === route.params.phaseId);
  const workout = phase?.workouts.find(
    item => item.id === route.params.workoutId,
  );

  if (!draft || !phase || !workout) {
    return null;
  }

  const updateWorkout = (patch: Partial<typeof workout>) =>
    updateDraft({
      ...draft,
      phases: draft.phases.map(item =>
        item.id === phase.id
          ? {
              ...phase,
              workouts: phase.workouts.map(candidate =>
                candidate.id === workout.id
                  ? { ...workout, ...patch }
                  : candidate,
              ),
            }
          : item,
      ),
    });
  const save = (input: SaveWorkoutTemplateInput) => {
    updateWorkout({ template: templateFromInput(workout.template, input) });
  };

  const timing = (
    <View className="gap-2">
      <Text className="t-eyebrow">
        {t('schedule.periodization.timingLabel')}
      </Text>
      <View className="flex-row gap-3">
        <NumberStepper
          label={t('schedule.periodization.weekLabel')}
          value={workout.week}
          min={1}
          onChange={week => updateWorkout({ week })}
        />
        <NumberStepper
          label={t('schedule.periodization.weekdayLabel')}
          value={workout.weekday}
          min={1}
          max={7}
          onChange={weekday => updateWorkout({ weekday })}
        />
      </View>
    </View>
  );

  return (
    <WorkoutTemplateEditor
      key={workout.template.id}
      template={workout.template}
      exerciseOptions={exerciseOptions}
      title={t('schedule.periodization.workoutEditorTitle')}
      beforeDetails={timing}
      allowImport={false}
      onSave={save}
      onClose={() => navigation.goBack()}
    />
  );
}
