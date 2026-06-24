import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from 'heroui-native';
import { formatNumber } from '@/data/local/sets/progressionGoals';
import { ConfirmationActions } from '@/components/clay/option-popup/OptionPopupActions';
import { OptionPopupFrame } from '@/components/clay/option-popup/OptionPopupFrame';
import type { ProgressionGoal } from '@/types/setType';
import type { SetCardModel } from './exerciseSetTableModel';
import type { SetCardProgressionKind } from './setCardProgression';

type ProgressionEditorSheetProps = {
  card: SetCardModel | null;
  visible: boolean;
  onClose: () => void;
};

function parseInputNumber(text: string, fallback: number): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : fallback;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseInputText(text: string): string {
  const normalizedText = text.replaceAll(',', '.');
  const firstSeparator = normalizedText.indexOf('.');

  if (firstSeparator === -1) {
    return normalizedText;
  }

  return (
    normalizedText.slice(0, firstSeparator + 1) +
    normalizedText.slice(firstSeparator + 1).replaceAll('.', '')
  );
}

function incrementSuffix(
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
  progression: NonNullable<SetCardModel['progression']>,
): string | undefined {
  const field = progression.fields.find(item => item.id === goal.fieldId);
  if (!field) {
    return undefined;
  }
  if (field.unit === 'seconds') {
    return 's';
  }
  return undefined;
}

type TypePillsProps = {
  goal: ProgressionGoal;
  progression: NonNullable<SetCardModel['progression']>;
  onChange: (goal: ProgressionGoal) => void;
};

function linearGoal(
  goal: ProgressionGoal,
  progression: NonNullable<SetCardModel['progression']>,
): Extract<ProgressionGoal, { kind: 'linear' }> {
  if (goal.kind === 'linear') {
    return goal;
  }
  return {
    kind: 'linear',
    fieldId: progression.fields[0]?.id,
    increment: 1,
  };
}

function TypePills({ goal, progression, onChange }: TypePillsProps) {
  const { t } = useTranslation();
  const options: Array<{ value: SetCardProgressionKind; label: string }> = [
    { value: 'none', label: t('progression.modes.none') },
    ...(progression.canUseLinear
      ? [{ value: 'linear' as const, label: t('progression.modes.linear') }]
      : []),
  ];

  const setKind = (kind: ProgressionGoal['kind']) => {
    onChange(
      kind === 'none' ? { kind: 'none' } : linearGoal(goal, progression),
    );
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map(option => {
        const selected = goal.kind === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            className={`min-h-9 justify-center rounded-full border px-3 ${
              selected
                ? 'border-accent bg-accent-soft'
                : 'border-border-soft bg-background'
            }`}
            onPress={() => setKind(option.value)}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selected ? 'text-accent' : 'text-foreground'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type FieldPillsProps = {
  goal: Extract<ProgressionGoal, { kind: 'linear' }>;
  progression: NonNullable<SetCardModel['progression']>;
  onChange: (goal: ProgressionGoal) => void;
};

function FieldPills({ goal, progression, onChange }: FieldPillsProps) {
  const { t } = useTranslation();
  if (progression.fields.length === 0) {
    return null;
  }

  return (
    <View className="gap-1.5">
      <Text className="t-caption text-muted">
        {t('setTypeEditor.progression.field')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {progression.fields.map(field => {
          const selected = goal.fieldId === field.id;
          return (
            <Pressable
              key={field.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className={`min-h-9 justify-center rounded-full border px-3 ${
                selected
                  ? 'border-accent bg-accent-soft'
                  : 'border-border-soft bg-background'
              }`}
              onPress={() => onChange({ ...goal, fieldId: field.id })}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  selected ? 'text-accent' : 'text-foreground'
                }`}
              >
                {field.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type IncrementInputProps = {
  goal: Extract<ProgressionGoal, { kind: 'linear' }>;
  progression: NonNullable<SetCardModel['progression']>;
  onChange: (goal: ProgressionGoal) => void;
};

function IncrementInput({ goal, progression, onChange }: IncrementInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState(formatNumber(goal.increment));
  const localIncrementRef = useRef(goal.increment);

  useEffect(() => {
    if (goal.increment !== localIncrementRef.current) {
      localIncrementRef.current = goal.increment;
      setText(formatNumber(goal.increment));
    }
  }, [goal.increment]);

  const updateIncrement = (input: string, format: boolean) => {
    const parsed = roundToTwoDecimals(parseInputNumber(input, goal.increment));
    localIncrementRef.current = parsed;
    onChange({ ...goal, increment: parsed });
    if (format) {
      setText(formatNumber(parsed));
    }
  };

  return (
    <View className="gap-1.5">
      <Text className="t-caption text-muted">
        {t('setTypeEditor.progression.increase')}
      </Text>
      <View className="flex-row items-center gap-2">
        <Input
          className="h-[46px] flex-1 rounded-[14px] border-border-hairline bg-surface-sunk px-3 text-foreground"
          keyboardType="decimal-pad"
          value={text}
          onChangeText={uiText => {
            const nextText = parseInputText(uiText);
            setText(nextText);
            if (nextText.trim()) {
              updateIncrement(nextText, false);
            }
          }}
          onEndEditing={event => {
            updateIncrement(parseInputText(event.nativeEvent.text), true);
          }}
        />
        {incrementSuffix(goal, progression) ? (
          <Text className="t-caption text-muted">
            {incrementSuffix(goal, progression)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ProgressionEditorSheet({
  card,
  visible,
  onClose,
}: ProgressionEditorSheetProps) {
  const { t } = useTranslation();
  const progression = card?.progression;
  const [draftGoal, setDraftGoal] = useState<ProgressionGoal>({
    kind: 'none',
  });

  useEffect(() => {
    if (visible && progression) {
      setDraftGoal(progression.goal);
    }
  }, [progression, visible]);

  const confirm = () => {
    progression?.onChange(draftGoal);
    onClose();
  };

  return (
    <OptionPopupFrame
      visible={visible}
      title={t('setTable.progressionTypePickerTitle')}
      text={t('setTable.progressionPopupText')}
      footer={
        <ConfirmationActions
          confirmLabel={t('common.apply')}
          disabled={!progression}
          onClose={onClose}
          onConfirm={confirm}
        />
      }
      onClose={onClose}
    >
      {progression ? (
        <View className="mt-5 gap-4">
          <TypePills
            goal={draftGoal}
            progression={progression}
            onChange={setDraftGoal}
          />
          {draftGoal.kind === 'linear' ? (
            <View className="gap-3 rounded-[16px] bg-surface-sunk p-3">
              <FieldPills
                goal={draftGoal}
                progression={progression}
                onChange={setDraftGoal}
              />
              <IncrementInput
                goal={draftGoal}
                progression={progression}
                onChange={setDraftGoal}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </OptionPopupFrame>
  );
}
