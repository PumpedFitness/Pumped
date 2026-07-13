import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from 'heroui-native';
import {
  formatNumber,
  rangeRolloverTargetFields,
} from '@/data/local/sets/progressionGoals';
import { ConfirmationActions } from '@/components/clay/option-popup/OptionPopupActions';
import { OptionPopupFrame } from '@/components/clay/option-popup/OptionPopupFrame';
import type { ProgressionGoal } from '@/types/setType';
import type { SetCardModel } from './exerciseSetTableModel';
import { RangeRolloverProgressionEditor } from './RangeRolloverProgressionEditor';

type ProgressionEditorSheetProps = {
  card: SetCardModel | null;
  visible: boolean;
  onClose: () => void;
};

function parseInputNumber(text: string, fallback: number): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : fallback;
}

function selectedProgressionField(
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
  progression: NonNullable<SetCardModel['progression']>,
) {
  return progression.fields.find(item => item.id === goal.fieldId);
}

function decimalsForGoal(
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
  progression: NonNullable<SetCardModel['progression']>,
): number {
  return decimalsForField(selectedProgressionField(goal, progression));
}

function decimalsForField(
  field: { config: { decimals?: number } } | undefined,
): number {
  return Math.max(0, field?.config.decimals ?? 0);
}

function roundToDecimals(value: number, decimals: number): number {
  if (decimals === 0) {
    return Math.round(value);
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function parseInputText(text: string, allowDecimal: boolean): string {
  const normalizedText = text.replaceAll(',', '.');
  const numericText = normalizedText.replace(/[^\d.]/g, '');
  if (!allowDecimal) {
    return numericText.replaceAll('.', '');
  }
  const firstSeparator = numericText.indexOf('.');

  if (firstSeparator === -1) {
    return numericText;
  }

  return (
    numericText.slice(0, firstSeparator + 1) +
    numericText.slice(firstSeparator + 1).replaceAll('.', '')
  );
}

function normalizeGoalForSelectedField(
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
  progression: NonNullable<SetCardModel['progression']>,
): Extract<ProgressionGoal, { kind: 'linear' }> {
  return {
    ...goal,
    increment: roundToDecimals(
      goal.increment,
      decimalsForGoal(goal, progression),
    ),
  };
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
  const defaultGoal = progression.options.find(
    option => option.kind === 'linear',
  )?.goal;
  if (defaultGoal?.kind === 'linear') {
    return defaultGoal;
  }
  return {
    kind: 'linear',
    fieldId: progression.fields[0]?.id,
    increment: 1,
  };
}

function rangeRolloverGoal(
  goal: ProgressionGoal,
  progression: NonNullable<SetCardModel['progression']>,
): Extract<ProgressionGoal, { kind: 'rangeRollover' }> {
  if (goal.kind === 'rangeRollover') {
    return goal;
  }
  const defaultGoal = progression.options.find(
    option => option.kind === 'rangeRollover',
  )?.goal;
  if (defaultGoal?.kind === 'rangeRollover') {
    return defaultGoal;
  }
  const rangeField = progression.fields[0];
  const targetField = rangeRolloverTargetFields(
    progression.fields,
    rangeField?.id,
  )[0];
  return {
    kind: 'rangeRollover',
    rangeFieldId: rangeField?.id,
    targetFieldId: targetField?.id,
    rangeMin: 5,
    rangeMax: 8,
    rangeIncrement: 1,
    targetIncrement: 1,
  };
}

function TypePills({ goal, progression, onChange }: TypePillsProps) {
  const { t } = useTranslation();

  const setKind = (kind: ProgressionGoal['kind']) => {
    if (goal.kind === kind) {
      onChange(goal);
      return;
    }
    onChange(
      kind === 'linear'
        ? linearGoal(goal, progression)
        : kind === 'rangeRollover'
        ? rangeRolloverGoal(goal, progression)
        : progression.options.find(option => option.kind === kind)?.goal ?? {
            kind: 'none',
          },
    );
  };

  return (
    <View className="gap-2">
      {progression.options.map(option => {
        const selected = goal.kind === option.kind;
        return (
          <Pressable
            key={option.kind}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            className={`min-h-11 justify-center rounded-[12px] border px-3 ${
              selected
                ? 'border-accent bg-accent-soft'
                : 'border-border-soft bg-background'
            }`}
            onPress={() => setKind(option.kind)}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selected ? 'text-accent' : 'text-foreground'
              }`}
            >
              {t(option.labelKey)}
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
              onPress={() =>
                onChange(
                  normalizeGoalForSelectedField(
                    { ...goal, fieldId: field.id },
                    progression,
                  ),
                )
              }
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
  const decimals = decimalsForGoal(goal, progression);
  const allowDecimal = decimals > 0;

  useEffect(() => {
    const normalizedIncrement = roundToDecimals(goal.increment, decimals);
    if (normalizedIncrement !== goal.increment) {
      localIncrementRef.current = normalizedIncrement;
      onChange({ ...goal, increment: normalizedIncrement });
      setText(formatNumber(normalizedIncrement));
      return;
    }
    if (normalizedIncrement !== localIncrementRef.current) {
      localIncrementRef.current = normalizedIncrement;
      setText(formatNumber(normalizedIncrement));
    }
  }, [decimals, goal, onChange]);

  const updateIncrement = (input: string, format: boolean) => {
    const parsed = roundToDecimals(
      parseInputNumber(input, goal.increment),
      decimals,
    );
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
          keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
          value={text}
          onChangeText={uiText => {
            const nextText = parseInputText(uiText, allowDecimal);
            setText(nextText);
            if (nextText.trim()) {
              updateIncrement(nextText, false);
            }
          }}
          onEndEditing={event => {
            updateIncrement(
              parseInputText(event.nativeEvent.text, allowDecimal),
              true,
            );
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
          ) : draftGoal.kind === 'rangeRollover' ? (
            <RangeRolloverProgressionEditor
              goal={draftGoal}
              progression={progression}
              onChange={setDraftGoal}
            />
          ) : null}
        </View>
      ) : null}
    </OptionPopupFrame>
  );
}
