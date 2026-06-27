import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from 'heroui-native';

import {
  formatNumber,
  rangeRolloverRangeField,
  rangeRolloverTargetField,
  rangeRolloverTargetFields,
} from '@/data/local/sets/progressionGoals';
import type { ProgressionGoal } from '@/types/setType';

import type { SetCardModel } from './exerciseSetTableModel';

type RangeProgression = NonNullable<SetCardModel['progression']>;

function parseInputNumber(text: string, fallback: number): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : fallback;
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

function roundToDecimals(value: number, decimals: number): number {
  if (decimals === 0) {
    return Math.round(value);
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function decimalsForField(
  field: { config: { decimals?: number } } | undefined,
): number {
  return Math.max(0, field?.config.decimals ?? 0);
}

function normalizeRangeRolloverGoalForFields(
  goal: Extract<ProgressionGoal, { kind: 'rangeRollover' }>,
  progression: RangeProgression,
): Extract<ProgressionGoal, { kind: 'rangeRollover' }> {
  const rangeField = rangeRolloverRangeField(progression.fields, goal);
  const targetField = rangeRolloverTargetField(progression.fields, {
    ...goal,
    rangeFieldId: rangeField?.id,
  });
  return {
    ...goal,
    rangeFieldId: rangeField?.id,
    targetFieldId: targetField?.id,
  };
}

type NumberGoalInputProps = {
  label: string;
  value: number;
  decimals: number;
  onChange: (value: number) => void;
  suffix?: string;
};

function NumberGoalInput({
  label,
  value,
  decimals,
  onChange,
  suffix,
}: NumberGoalInputProps) {
  const [text, setText] = useState(formatNumber(value));
  const localValueRef = useRef(value);
  const allowDecimal = decimals > 0;

  useEffect(() => {
    const normalizedValue = roundToDecimals(value, decimals);
    if (normalizedValue !== localValueRef.current) {
      localValueRef.current = normalizedValue;
      setText(formatNumber(normalizedValue));
    }
  }, [decimals, value]);

  const updateValue = (input: string, format: boolean) => {
    const parsed = roundToDecimals(
      parseInputNumber(input, localValueRef.current),
      decimals,
    );
    localValueRef.current = parsed;
    onChange(parsed);
    if (format) {
      setText(formatNumber(parsed));
    }
  };

  return (
    <View className="gap-1.5">
      <Text className="t-caption text-muted">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Input
          className="h-[46px] flex-1 rounded-[14px] border-border-hairline bg-surface-sunk px-3 text-foreground"
          keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
          value={text}
          onChangeText={uiText => {
            const nextText = parseInputText(uiText, allowDecimal);
            setText(nextText);
            if (nextText.trim()) {
              updateValue(nextText, false);
            }
          }}
          onEndEditing={event => {
            updateValue(
              parseInputText(event.nativeEvent.text, allowDecimal),
              true,
            );
          }}
        />
        {suffix ? <Text className="t-caption text-muted">{suffix}</Text> : null}
      </View>
    </View>
  );
}

type RangeRolloverProgressionEditorProps = {
  goal: Extract<ProgressionGoal, { kind: 'rangeRollover' }>;
  progression: RangeProgression;
  surface?: 'card' | 'sunk';
  onChange: (goal: ProgressionGoal) => void;
};

export function RangeRolloverProgressionEditor({
  goal,
  progression,
  surface = 'sunk',
  onChange,
}: RangeRolloverProgressionEditorProps) {
  const { t } = useTranslation();
  const rangeField = rangeRolloverRangeField(progression.fields, goal);
  const targetField = rangeRolloverTargetField(progression.fields, goal);
  const targetFields = rangeRolloverTargetFields(
    progression.fields,
    rangeField?.id,
  );
  const updateGoal = (
    nextGoal: Extract<ProgressionGoal, { kind: 'rangeRollover' }>,
  ) => onChange(normalizeRangeRolloverGoalForFields(nextGoal, progression));
  const updateRange = (fieldId: string) => {
    updateGoal({
      ...goal,
      rangeFieldId: fieldId,
      targetFieldId: rangeRolloverTargetFields(progression.fields, fieldId)[0]
        ?.id,
    });
  };

  return (
    <View
      className={`gap-3 rounded-[16px] p-3 ${
        surface === 'card' ? 'bg-surface-card' : 'bg-surface-sunk'
      }`}
    >
      <FieldChoices
        label={t('setTypeEditor.progression.rangeField')}
        fields={progression.fields}
        selectedId={rangeField?.id}
        onSelect={updateRange}
      />
      <FieldChoices
        label={t('setTypeEditor.progression.targetField')}
        fields={targetFields}
        selectedId={targetField?.id}
        onSelect={fieldId => updateGoal({ ...goal, targetFieldId: fieldId })}
      />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <NumberGoalInput
            label={t('setTypeEditor.progression.rangeMin')}
            value={goal.rangeMin}
            decimals={decimalsForField(rangeField)}
            onChange={value =>
              updateGoal({ ...goal, rangeMin: Math.min(value, goal.rangeMax) })
            }
          />
        </View>
        <View className="flex-1">
          <NumberGoalInput
            label={t('setTypeEditor.progression.rangeMax')}
            value={goal.rangeMax}
            decimals={decimalsForField(rangeField)}
            onChange={value =>
              updateGoal({ ...goal, rangeMax: Math.max(value, goal.rangeMin) })
            }
          />
        </View>
      </View>
      <NumberGoalInput
        label={t('setTypeEditor.progression.rangeIncrease')}
        value={goal.rangeIncrement}
        decimals={decimalsForField(rangeField)}
        onChange={value => updateGoal({ ...goal, rangeIncrement: value })}
      />
      <NumberGoalInput
        label={t('setTypeEditor.progression.targetIncrease')}
        value={goal.targetIncrement}
        decimals={decimalsForField(targetField)}
        onChange={value => updateGoal({ ...goal, targetIncrement: value })}
        suffix={targetField?.unit === 'seconds' ? 's' : undefined}
      />
    </View>
  );
}

type FieldChoicesProps = {
  label: string;
  fields: { id: string; name: string }[];
  selectedId: string | undefined;
  onSelect: (fieldId: string) => void;
};

function FieldChoices({
  label,
  fields,
  selectedId,
  onSelect,
}: FieldChoicesProps) {
  return (
    <View className="gap-1.5">
      <Text className="t-caption text-muted">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {fields.map(field => {
          const selected = selectedId === field.id;
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
              onPress={() => onSelect(field.id)}
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
