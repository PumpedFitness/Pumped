import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button, Input, TextArea } from 'heroui-native';
import type {
  WorkoutScheduleType,
  WorkoutSetType,
  WorkoutTemplateColor,
  WorkoutTemplateStatus,
  WorkoutWeekday,
} from '../../data/local/enums';
import type {
  SaveWorkoutTemplateInput,
  WorkoutTemplateExerciseInput,
} from '../../data/local/services';
import type { ExerciseOption } from '../../hooks/useWorkoutTemplates';
import type { WorkoutTemplate } from '../../types/workout';
import { colors } from '../../theme/tokens';
import { AppView } from '../AppView';
import { OptionSelectorSheet } from '../forms/OptionSelectorSheet';
import {
  OptionalSliderSheet,
  OptionalSliderTrigger,
  type OptionalSliderConfig,
} from '../forms/OptionalSliderSheet';
import { ClayIcon } from '../icons/ClayIcon';
import { ExercisePickerScreen } from './ExercisePickerScreen';
import {
  getWorkoutTemplateColor,
  WORKOUT_TEMPLATE_COLORS,
} from './workoutTemplateColors';

type ScheduleMode = 'NONE' | WorkoutScheduleType;

type DraftSet = {
  setType: WorkoutSetType;
  targetReps: string;
  targetPercentage1Rm: string;
  targetRpe: string;
};

type DraftExercise = {
  exerciseId: string;
  goal: string;
  notes: string | null;
  sets: DraftSet[];
};

type WorkoutTemplateEditorProps = {
  visible: boolean;
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onClose: () => void;
  onSave: (input: SaveWorkoutTemplateInput) => void;
  onRequestDelete: (template: WorkoutTemplate) => void;
};

type OptionPillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

type WorkoutTemplateExerciseEditorProps = {
  exercise: DraftExercise;
  name: string;
  onGoalChange: (goal: string) => void;
  onSetChange: (setIndex: number, set: DraftSet) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onRemove: () => void;
};

type WorkoutTemplateSetEditorProps = {
  index: number;
  set: DraftSet;
  canRemove: boolean;
  onChange: (set: DraftSet) => void;
  onRemove: () => void;
};

type PrescriptionField = 'REPS' | 'PERCENTAGE_1RM' | 'RPE';

const WEEKDAYS: { value: WorkoutWeekday; label: string }[] = [
  { value: 'MONDAY', label: 'M' },
  { value: 'TUESDAY', label: 'T' },
  { value: 'WEDNESDAY', label: 'W' },
  { value: 'THURSDAY', label: 'T' },
  { value: 'FRIDAY', label: 'F' },
  { value: 'SATURDAY', label: 'S' },
  { value: 'SUNDAY', label: 'S' },
];

const SET_TYPES: { value: WorkoutSetType; label: string }[] = [
  { value: 'WARMUP', label: 'Warmup' },
  { value: 'NORMAL', label: 'Working' },
  { value: 'BACKOFF', label: 'Backoff' },
  { value: 'DROP', label: 'Drop' },
  { value: 'AMRAP', label: 'AMRAP' },
];

const PRESCRIPTION_SLIDER_CONFIG: Record<
  PrescriptionField,
  OptionalSliderConfig
> = {
  REPS: {
    title: 'Target reps',
    description: 'Choose the planned repetitions for this set.',
    minValue: 1,
    maxValue: 30,
    step: 1,
    defaultValue: 8,
    formatValue: value => `${value} reps`,
  },
  PERCENTAGE_1RM: {
    title: 'Percentage of 1RM',
    description: 'Choose the planned load relative to your one-rep max.',
    minValue: 5,
    maxValue: 100,
    step: 2.5,
    defaultValue: 70,
    formatValue: value => `${value}% 1RM`,
  },
  RPE: {
    title: 'Target RPE',
    description: 'Choose the planned effort from 1 to 10.',
    minValue: 1,
    maxValue: 10,
    step: 0.5,
    defaultValue: 8,
    formatValue: value => `RPE ${value}`,
  },
};

function createDraftSet(setType: WorkoutSetType = 'NORMAL'): DraftSet {
  return {
    setType,
    targetReps: '',
    targetPercentage1Rm: '',
    targetRpe: '',
  };
}

function parseOptionalNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }

  return Number(normalized);
}

function formatSliderNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function OptionPill({ label, selected, onPress }: OptionPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-11 items-center justify-center rounded-full border px-4 ${
        selected
          ? 'border-accent bg-accent'
          : 'border-border-hairline bg-surface-card'
      }`}
      onPress={onPress}
    >
      <Text
        className={`t-label ${
          selected ? 'text-accent-foreground' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function formatSetTypeSummary(sets: DraftSet[]): string {
  const counts = SET_TYPES.map(option => ({
    label: option.label.toLocaleLowerCase(),
    count: sets.filter(set => set.setType === option.value).length,
  })).filter(item => item.count > 0);

  return counts.map(item => `${item.count} ${item.label}`).join(' · ');
}

function WorkoutTemplateSetEditor({
  index,
  set,
  canRemove,
  onChange,
  onRemove,
}: WorkoutTemplateSetEditorProps) {
  const [activePrescription, setActivePrescription] =
    useState<PrescriptionField | null>(null);
  const [isSetTypeSelectorOpen, setIsSetTypeSelectorOpen] = useState(false);
  const activeValue =
    activePrescription === 'REPS'
      ? set.targetReps
      : activePrescription === 'PERCENTAGE_1RM'
      ? set.targetPercentage1Rm
      : activePrescription === 'RPE'
      ? set.targetRpe
      : '';
  const activeConfig = PRESCRIPTION_SLIDER_CONFIG[activePrescription ?? 'REPS'];
  const setTypeLabel =
    SET_TYPES.find(option => option.value === set.setType)?.label ?? 'Working';

  const updatePrescription = (
    field: PrescriptionField,
    value: number | null,
  ): void => {
    const formattedValue = value === null ? '' : formatSliderNumber(value);

    if (field === 'REPS') {
      onChange({ ...set, targetReps: formattedValue });
      return;
    }
    if (field === 'PERCENTAGE_1RM') {
      onChange({ ...set, targetPercentage1Rm: formattedValue });
      return;
    }
    onChange({ ...set, targetRpe: formattedValue });
  };

  return (
    <View className="rounded-[18px] bg-surface-sunk p-2">
      <View className="flex-row items-center gap-1.5">
        <Text className="w-6 text-center text-[12px] font-bold tabular-nums text-muted">
          {index + 1}
        </Text>

        <OptionalSliderTrigger
          compact
          label="Type"
          value={setTypeLabel}
          onPress={() => setIsSetTypeSelectorOpen(true)}
        />
        <OptionalSliderTrigger
          compact
          label="Reps"
          value={set.targetReps}
          emptyLabel="-"
          onPress={() => setActivePrescription('REPS')}
        />
        <OptionalSliderTrigger
          compact
          label="% 1RM"
          value={set.targetPercentage1Rm}
          emptyLabel="-"
          onPress={() => setActivePrescription('PERCENTAGE_1RM')}
        />
        <OptionalSliderTrigger
          compact
          label="RPE"
          value={set.targetRpe}
          emptyLabel="-"
          onPress={() => setActivePrescription('RPE')}
        />

        {canRemove && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove set ${index + 1}`}
            className="h-10 w-8 items-center justify-center rounded-full active:bg-surface-card"
            onPress={onRemove}
          >
            <ClayIcon name="trash" size={15} color={colors.danger} />
          </Pressable>
        )}
      </View>

      <OptionSelectorSheet
        visible={isSetTypeSelectorOpen}
        title={`Set ${index + 1} type`}
        value={set.setType}
        options={SET_TYPES}
        onClose={() => setIsSetTypeSelectorOpen(false)}
        onChange={setType => onChange({ ...set, setType })}
      />

      <OptionalSliderSheet
        visible={activePrescription !== null}
        value={parseOptionalNumber(activeValue)}
        config={activeConfig}
        onClose={() => setActivePrescription(null)}
        onChange={value => {
          if (activePrescription) {
            updatePrescription(activePrescription, value);
          }
        }}
      />
    </View>
  );
}

export function WorkoutTemplateExerciseEditor({
  exercise,
  name,
  onGoalChange,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onRemove,
}: WorkoutTemplateExerciseEditorProps) {
  const [setsExpanded, setSetsExpanded] = useState(false);

  return (
    <View className="gap-4 rounded-[22px] border border-border-hairline bg-surface-card p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-accent-soft">
          <ClayIcon name="dumbbell" size={20} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="t-heading">{name}</Text>
          <Text className="t-caption mt-0.5">
            Working sets and a simple goal
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-sunk"
          onPress={onRemove}
        >
          <ClayIcon name="x" size={18} color={colors.danger} />
        </Pressable>
      </View>

      <Input
        className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
        placeholder="Goal, for example 3 × 8 at RPE 8"
        value={exercise.goal}
        onChangeText={onGoalChange}
      />

      <View className="overflow-hidden rounded-[18px] border border-border-soft">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: setsExpanded }}
          className="min-h-14 flex-row items-center gap-3 bg-surface-sunk px-4 py-3 active:bg-surface-card"
          onPress={() => setSetsExpanded(current => !current)}
        >
          <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-surface-card">
            <ClayIcon name="target" size={18} color={colors.ink2} />
          </View>
          <View className="flex-1">
            <Text className="t-label">
              {exercise.sets.length}{' '}
              {exercise.sets.length === 1 ? 'set' : 'sets'}
            </Text>
            <Text className="t-caption mt-0.5">
              {setsExpanded
                ? 'Hide prescriptions'
                : formatSetTypeSummary(exercise.sets)}
            </Text>
          </View>
          <ClayIcon
            name={setsExpanded ? 'chevronDown' : 'chevron'}
            size={18}
            color={colors.muted}
          />
        </Pressable>

        {setsExpanded && (
          <View className="gap-3 border-t border-border-soft p-3">
            {exercise.sets.map((set, index) => (
              <WorkoutTemplateSetEditor
                key={index}
                index={index}
                set={set}
                canRemove={exercise.sets.length > 1}
                onChange={nextSet => onSetChange(index, nextSet)}
                onRemove={() => onRemoveSet(index)}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              className="min-h-11 flex-row items-center justify-center gap-2 rounded-full bg-accent-soft px-4"
              onPress={onAddSet}
            >
              <ClayIcon name="plus" size={16} color={colors.accent} />
              <Text className="t-label text-accent">Add set</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function initialExercises(template: WorkoutTemplate | null): DraftExercise[] {
  if (!template) {
    return [];
  }

  return template.exercises.map(exercise => ({
    exerciseId: exercise.exerciseId,
    goal: exercise.goal ?? '',
    notes: exercise.notes,
    sets: exercise.sets.map(set => ({
      setType: set.setType,
      targetReps: set.targetReps?.toString() ?? '',
      targetPercentage1Rm: set.targetPercentage1Rm?.toString() ?? '',
      targetRpe: set.targetRpe?.toString() ?? '',
    })),
  }));
}

export function WorkoutTemplateEditor({
  visible,
  template,
  exerciseOptions,
  onClose,
  onSave,
  onRequestDelete,
}: WorkoutTemplateEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkoutTemplateStatus>('ACTIVE');
  const [color, setColor] = useState<WorkoutTemplateColor>('TERRACOTTA');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('NONE');
  const [scheduleInterval, setScheduleInterval] = useState(1);
  const [weekdays, setWeekdays] = useState<WorkoutWeekday[]>([]);
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(template?.name ?? '');
    setDescription(template?.description ?? '');
    setStatus(template?.status ?? 'ACTIVE');
    setColor(template?.color ?? 'TERRACOTTA');
    setScheduleMode(template?.schedule?.type ?? 'NONE');
    setScheduleInterval(template?.schedule?.interval ?? 1);
    setWeekdays(template?.schedule?.weekdays ?? []);
    setDraftExercises(initialExercises(template));
    setError(null);
  }, [template, visible]);

  const exerciseNames = useMemo(
    () =>
      new Map(
        exerciseOptions.map(exercise => [exercise.id, exercise.name] as const),
      ),
    [exerciseOptions],
  );
  const updateExercise = (
    exerciseId: string,
    update: (exercise: DraftExercise) => DraftExercise,
  ) => {
    setDraftExercises(current =>
      current.map(exercise =>
        exercise.exerciseId === exerciseId ? update(exercise) : exercise,
      ),
    );
  };

  const toggleWeekday = (weekday: WorkoutWeekday) => {
    setWeekdays(current =>
      current.includes(weekday)
        ? current.filter(value => value !== weekday)
        : [...current, weekday],
    );
  };

  const updateSelectedExercises = (exerciseIds: string[]) => {
    setDraftExercises(current => {
      const currentById = new Map(
        current.map(exercise => [exercise.exerciseId, exercise] as const),
      );

      return exerciseIds.map(
        exerciseId =>
          currentById.get(exerciseId) ?? {
            exerciseId,
            goal: '',
            notes: null,
            sets: [createDraftSet(), createDraftSet(), createDraftSet()],
          },
      );
    });
    setIsExercisePickerOpen(false);
  };

  const buildExerciseInput = (
    exercise: DraftExercise,
  ): WorkoutTemplateExerciseInput => ({
    exerciseId: exercise.exerciseId,
    goal: exercise.goal.trim() || null,
    notes: exercise.notes,
    sets: exercise.sets.map(set => ({
      setType: set.setType,
      targetReps: parseOptionalNumber(set.targetReps),
      targetPercentage1Rm: parseOptionalNumber(set.targetPercentage1Rm),
      targetRpe: parseOptionalNumber(set.targetRpe),
    })),
  });

  const handleSave = () => {
    if (!name.trim()) {
      setError('Give this template a name.');
      return;
    }
    if (scheduleMode === 'WEEKS' && weekdays.length === 0) {
      setError('Choose at least one training day.');
      return;
    }

    try {
      onSave({
        id: template?.id,
        name,
        description: description.trim() || null,
        status,
        color,
        schedule:
          scheduleMode === 'NONE'
            ? null
            : {
                type: scheduleMode,
                interval: scheduleInterval,
                weekdays: scheduleMode === 'WEEKS' ? weekdays : undefined,
              },
        exercises: draftExercises.map(buildExerciseInput),
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'The template could not be saved.',
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <AppView edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <View className="flex-row items-center justify-between border-b border-border-soft px-5 py-3">
            <Pressable
              accessibilityRole="button"
              className="h-11 min-w-16 items-start justify-center"
              onPress={onClose}
            >
              <Text className="t-label text-foreground-secondary">Cancel</Text>
            </Pressable>
            <Text className="t-heading">
              {template ? 'Edit template' : 'New template'}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="h-11 min-w-16 items-end justify-center"
              onPress={handleSave}
            >
              <Text className="t-label text-accent">Save</Text>
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-7 px-5 pb-10 pt-6"
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-3">
              <Text className="t-eyebrow">Template details</Text>
              <Input
                autoFocus={!template}
                className="h-[54px] rounded-[18px] border-border-hairline bg-surface-card px-4 text-foreground"
                placeholder="Template name"
                value={name}
                onChangeText={setName}
              />
              <TextArea
                className="min-h-[96px] rounded-[18px] border-border-hairline bg-surface-card px-4 py-3 text-foreground"
                placeholder="A short description"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="gap-3">
              <Text className="t-eyebrow">Schedule</Text>
              <View className="flex-row flex-wrap gap-2">
                <OptionPill
                  label="Flexible"
                  selected={scheduleMode === 'NONE'}
                  onPress={() => setScheduleMode('NONE')}
                />
                <OptionPill
                  label="Every few days"
                  selected={scheduleMode === 'DAYS'}
                  onPress={() => setScheduleMode('DAYS')}
                />
                <OptionPill
                  label="Weekly"
                  selected={scheduleMode === 'WEEKS'}
                  onPress={() => setScheduleMode('WEEKS')}
                />
              </View>

              {scheduleMode !== 'NONE' && (
                <View className="gap-4 rounded-[22px] bg-moss p-4">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="t-label text-cream">
                        Repeat interval
                      </Text>
                      <Text className="t-caption mt-0.5 text-cream-dim">
                        Every {scheduleInterval}{' '}
                        {scheduleMode === 'DAYS'
                          ? scheduleInterval === 1
                            ? 'day'
                            : 'days'
                          : scheduleInterval === 1
                          ? 'week'
                          : 'weeks'}
                      </Text>
                    </View>
                    <View className="flex-row items-center rounded-full bg-moss-deep p-1">
                      <Pressable
                        accessibilityRole="button"
                        className="h-10 w-10 items-center justify-center rounded-full"
                        onPress={() =>
                          setScheduleInterval(current =>
                            Math.max(1, current - 1),
                          )
                        }
                      >
                        <ClayIcon name="minus" size={17} color={colors.cream} />
                      </Pressable>
                      <Text className="min-w-9 text-center text-[17px] font-bold tabular-nums text-cream">
                        {scheduleInterval}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        className="h-10 w-10 items-center justify-center rounded-full"
                        onPress={() =>
                          setScheduleInterval(current => current + 1)
                        }
                      >
                        <ClayIcon name="plus" size={17} color={colors.cream} />
                      </Pressable>
                    </View>
                  </View>

                  {scheduleMode === 'WEEKS' && (
                    <View className="flex-row justify-between">
                      {WEEKDAYS.map(day => {
                        const selected = weekdays.includes(day.value);
                        return (
                          <Pressable
                            key={day.value}
                            accessibilityRole="button"
                            accessibilityLabel={day.value.toLowerCase()}
                            className={`h-10 w-10 items-center justify-center rounded-full ${
                              selected ? 'bg-accent' : 'bg-moss-deep'
                            }`}
                            onPress={() => toggleWeekday(day.value)}
                          >
                            <Text
                              className={`text-[13px] font-bold ${
                                selected ? 'text-accent-ink' : 'text-cream'
                              }`}
                            >
                              {day.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>

            <View className="gap-3">
              <Text className="t-eyebrow">Template color</Text>
              <View className="flex-row flex-wrap gap-3">
                {WORKOUT_TEMPLATE_COLORS.map(option => {
                  const selected = color === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityLabel={option.label}
                      accessibilityState={{ selected }}
                      className={`h-12 w-12 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-foreground' : 'border-transparent'
                      }`}
                      onPress={() => setColor(option.value)}
                    >
                      <View
                        className="h-9 w-9 items-center justify-center rounded-full"
                        style={{ backgroundColor: option.hex }}
                      >
                        {selected && (
                          <ClayIcon
                            name="check"
                            size={17}
                            color={
                              option.value === 'HONEY'
                                ? colors.accentInk
                                : colors.cream
                            }
                            stroke={2.5}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: getWorkoutTemplateColor(color).hex,
                  }}
                />
                <Text className="t-caption">
                  {getWorkoutTemplateColor(color).label} marks this template in
                  the calendar.
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <Text className="t-eyebrow">Template status</Text>
              <View className="flex-row flex-wrap gap-2">
                <OptionPill
                  label="Active"
                  selected={status === 'ACTIVE'}
                  onPress={() => setStatus('ACTIVE')}
                />
                <OptionPill
                  label="Inactive"
                  selected={status === 'INACTIVE'}
                  onPress={() => setStatus('INACTIVE')}
                />
                <OptionPill
                  label="Archived"
                  selected={status === 'ARCHIVED'}
                  onPress={() => setStatus('ARCHIVED')}
                />
              </View>
              <Text className="t-caption">
                {status === 'ACTIVE'
                  ? 'Active schedules appear as planned workouts.'
                  : status === 'INACTIVE'
                  ? 'Inactive templates stay available without adding plans.'
                  : 'Archived templates are kept out of your active library.'}
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="t-eyebrow">Exercises</Text>
                  <Text className="t-caption mt-1">
                    {draftExercises.length}{' '}
                    {draftExercises.length === 1 ? 'exercise' : 'exercises'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  className="min-h-11 flex-row items-center gap-2 rounded-full bg-accent-soft px-4"
                  onPress={() => setIsExercisePickerOpen(true)}
                >
                  <ClayIcon name="search" size={16} color={colors.accent} />
                  <Text className="t-label text-accent">Choose exercises</Text>
                </Pressable>
              </View>

              {draftExercises.map(exercise => (
                <WorkoutTemplateExerciseEditor
                  key={exercise.exerciseId}
                  exercise={exercise}
                  name={
                    exerciseNames.get(exercise.exerciseId) ?? 'Unknown exercise'
                  }
                  onGoalChange={goal =>
                    updateExercise(exercise.exerciseId, current => ({
                      ...current,
                      goal,
                    }))
                  }
                  onSetChange={(setIndex, set) =>
                    updateExercise(exercise.exerciseId, current => ({
                      ...current,
                      sets: current.sets.map((currentSet, index) =>
                        index === setIndex ? set : currentSet,
                      ),
                    }))
                  }
                  onAddSet={() =>
                    updateExercise(exercise.exerciseId, current => ({
                      ...current,
                      sets: [...current.sets, createDraftSet()],
                    }))
                  }
                  onRemoveSet={setIndex =>
                    updateExercise(exercise.exerciseId, current => ({
                      ...current,
                      sets:
                        current.sets.length > 1
                          ? current.sets.filter(
                              (_, index) => index !== setIndex,
                            )
                          : current.sets,
                    }))
                  }
                  onRemove={() =>
                    setDraftExercises(current =>
                      current.filter(
                        item => item.exerciseId !== exercise.exerciseId,
                      ),
                    )
                  }
                />
              ))}

              {draftExercises.length === 0 && (
                <Pressable
                  accessibilityRole="button"
                  className="items-center gap-3 rounded-[22px] border border-dashed border-border-hairline px-5 py-8"
                  onPress={() => setIsExercisePickerOpen(true)}
                >
                  <ClayIcon name="search" size={23} color={colors.accent} />
                  <Text className="t-heading">Search the exercise library</Text>
                  <Text className="t-caption text-center">
                    Choose exercises on a dedicated page and return here to set
                    goals and working sets.
                  </Text>
                </Pressable>
              )}
            </View>

            {error && (
              <View className="rounded-[18px] bg-danger/10 px-4 py-3">
                <Text className="t-label text-danger">{error}</Text>
              </View>
            )}

            <Button
              className="h-14 rounded-full bg-accent"
              feedbackVariant="scale"
              onPress={handleSave}
            >
              <Button.Label className="text-[16px] font-bold text-accent-foreground">
                Save template
              </Button.Label>
            </Button>

            {template && (
              <Button
                className="h-14 rounded-full"
                variant="danger-soft"
                feedbackVariant="scale"
                onPress={() => onRequestDelete(template)}
              >
                <ClayIcon name="trash" size={18} color={colors.danger} />
                <Button.Label>Delete template</Button.Label>
              </Button>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <ExercisePickerScreen
          visible={isExercisePickerOpen}
          exercises={exerciseOptions}
          selectedExerciseIds={draftExercises.map(
            exercise => exercise.exerciseId,
          )}
          onClose={() => setIsExercisePickerOpen(false)}
          onDone={updateSelectedExercises}
        />
      </AppView>
    </Modal>
  );
}
