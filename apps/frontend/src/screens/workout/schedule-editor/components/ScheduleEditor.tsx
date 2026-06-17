import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'heroui-native';
import type { SaveScheduleInput, Schedule } from '@/types/schedule';
import type { WorkoutTemplate } from '@/types/workout';
import { colors } from '@/theme/tokens';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { SegmentedControl } from '@/components/clay/SegmentedControl';
import { OptionSelectorSheet } from '@/components/forms/OptionSelectorSheet';
import { useScheduleEditorDraft } from '@/screens/workout/schedule-editor/useScheduleEditorDraft';
import { ScheduleSlotGrid } from './ScheduleSlotGrid';

const REST_VALUE = '__REST__';
const MAX_WEEKS = 8;
const MAX_DAYS = 30;

type ScheduleEditorProps = {
  schedule: Schedule | null;
  templates: WorkoutTemplate[];
  onSave: (input: SaveScheduleInput) => void;
  onClose: () => void;
  onRequestDelete: (schedule: Schedule) => void;
};

type RotationLengthStepperProps = {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

function RotationLengthStepper({
  label,
  value,
  max,
  onChange,
}: RotationLengthStepperProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between rounded-[22px] bg-moss p-4">
      <View className="flex-1">
        <Text className="t-label text-cream">
          {t('schedule.rotationLength')}
        </Text>
        <Text className="t-caption mt-0.5 text-cream-dim">{label}</Text>
      </View>
      <View className="flex-row items-center rounded-full bg-moss-deep p-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('schedule.decreaseLength')}
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => onChange(value - 1)}
        >
          <ClayIcon name="minus" size={17} color={colors.cream} />
        </Pressable>
        <Text className="min-w-9 text-center text-[17px] font-bold tabular-nums text-cream">
          {value}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('schedule.increaseLength')}
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <ClayIcon name="plus" size={17} color={colors.cream} />
        </Pressable>
      </View>
    </View>
  );
}

type ActiveProgramToggleProps = {
  active: boolean;
  onToggle: () => void;
};

function ActiveProgramToggle({ active, onToggle }: ActiveProgramToggleProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      className="flex-row items-center justify-between rounded-[18px] border border-border-hairline bg-surface-card px-4 py-3.5"
      onPress={onToggle}
    >
      <View className="flex-1 pr-3">
        <Text className="t-label text-foreground">
          {t('schedule.activeProgram')}
        </Text>
        <Text className="t-caption text-muted">
          {t('schedule.activeProgramHint')}
        </Text>
      </View>
      <View
        className={`h-7 w-12 justify-center rounded-full px-0.5 ${
          active ? 'bg-accent' : 'bg-surface-sunk'
        }`}
      >
        <View
          className={`h-6 w-6 rounded-full bg-cream ${
            active ? 'self-end' : 'self-start'
          }`}
        />
      </View>
    </Pressable>
  );
}

export function ScheduleEditor({
  schedule,
  templates,
  onSave,
  onClose,
  onRequestDelete,
}: ScheduleEditorProps) {
  const { t } = useTranslation();
  const [pickerDayOffset, setPickerDayOffset] = useState<number | null>(null);
  const {
    draft,
    updateDraft,
    setRecurrenceType,
    setPeriodLength,
    setSlot,
    save,
  } = useScheduleEditorDraft({ schedule, onSave, onSaved: onClose });

  const templateNames = useMemo(
    () => new Map(templates.map(template => [template.id, template.name])),
    [templates],
  );

  const pickerOptions = useMemo(
    () => [
      { value: REST_VALUE, label: t('schedule.restDay') },
      ...templates.map(template => ({
        value: template.id,
        label: template.name,
      })),
    ],
    [templates, t],
  );

  const maxPeriod = draft.recurrenceType === 'WEEKLY' ? MAX_WEEKS : MAX_DAYS;
  const periodLabel =
    draft.recurrenceType === 'WEEKLY'
      ? t('schedule.periodWeeks', { count: draft.periodLength })
      : t('schedule.periodDays', { count: draft.periodLength });

  return (
    <AppView edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ModalHeader
          title={schedule ? t('schedule.editTitle') : t('schedule.newTitle')}
          rightLabel={t('common.save')}
          onLeftPress={onClose}
          onRightPress={save}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-5 pb-10 pt-6"
          keyboardShouldPersistTaps="handled"
        >
          <Input
            autoFocus={!schedule}
            className="h-[54px] rounded-[18px] border-border-hairline bg-surface-card px-4 text-foreground"
            placeholder={t('schedule.namePlaceholder')}
            value={draft.name}
            onChangeText={name => updateDraft({ name })}
          />

          <SegmentedControl
            options={[
              { value: 'WEEKLY', label: t('schedule.mode.weekly') },
              { value: 'CYCLE', label: t('schedule.mode.cycle') },
            ]}
            value={draft.recurrenceType}
            onChange={value =>
              setRecurrenceType(value as Schedule['recurrenceType'])
            }
          />

          <RotationLengthStepper
            label={periodLabel}
            value={draft.periodLength}
            max={maxPeriod}
            onChange={setPeriodLength}
          />

          <ScheduleSlotGrid
            recurrenceType={draft.recurrenceType}
            periodLength={draft.periodLength}
            slots={draft.slots}
            templateNames={templateNames}
            onPressSlot={setPickerDayOffset}
          />

          <ActiveProgramToggle
            active={draft.isActive}
            onToggle={() => updateDraft({ isActive: !draft.isActive })}
          />

          {draft.error && (
            <View className="rounded-[18px] bg-danger/10 px-4 py-3">
              <Text className="t-label text-danger">{draft.error}</Text>
            </View>
          )}

          <Button
            className="h-14 rounded-full bg-accent"
            feedbackVariant="scale"
            onPress={save}
          >
            <Button.Label className="text-[16px] font-bold text-accent-foreground">
              {t('schedule.saveCta')}
            </Button.Label>
          </Button>

          {schedule && (
            <Button
              className="h-14 rounded-full"
              variant="danger-soft"
              feedbackVariant="scale"
              onPress={() => onRequestDelete(schedule)}
            >
              <ClayIcon name="trash" size={18} color={colors.danger} />
              <Button.Label>{t('schedule.deleteCta')}</Button.Label>
            </Button>
          )}
        </ScrollView>

        <OptionSelectorSheet
          visible={pickerDayOffset !== null}
          title={t('schedule.pickWorkout')}
          value={
            pickerDayOffset !== null
              ? draft.slots[pickerDayOffset] ?? REST_VALUE
              : REST_VALUE
          }
          options={pickerOptions}
          onClose={() => setPickerDayOffset(null)}
          onChange={value => {
            if (pickerDayOffset !== null) {
              setSlot(pickerDayOffset, value === REST_VALUE ? null : value);
            }
          }}
        />
      </KeyboardAvoidingView>
    </AppView>
  );
}
