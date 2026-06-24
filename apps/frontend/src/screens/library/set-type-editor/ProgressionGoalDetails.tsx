import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  defaultLinearProgressionFieldId,
  getSetFieldRole,
  linearProgressionFields,
} from '@/data/local/sets/progressionGoals';
import type { ProgressionGoal } from '@/types/setType';
import type { DraftField } from './draft';
import { ProgressionNumberInputRow } from './ProgressionNumberInputRow';

export type ProgressionDraftField = DraftField & {
  id: string;
};

type FieldChoice = {
  id: string;
  name: string;
};

type ProgressionGoalDetailsProps = {
  goal: ProgressionGoal;
  fields: ProgressionDraftField[];
  onChange: (goal: ProgressionGoal) => void;
};

function fieldChoices(fields: ProgressionDraftField[]): FieldChoice[] {
  return linearProgressionFields(fields).map(field => ({
    id: field.id,
    name: field.name,
  }));
}

export function withDefaultProgressionFieldIds(
  goal: ProgressionGoal,
  fields: ProgressionDraftField[],
): ProgressionGoal {
  if (goal.kind !== 'linear') {
    return goal;
  }
  return {
    ...goal,
    fieldId: goal.fieldId ?? defaultLinearProgressionFieldId(fields),
  };
}

function selectedFieldId(
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
  fields: ProgressionDraftField[],
): string | undefined {
  return goal.fieldId ?? defaultLinearProgressionFieldId(fields);
}

type FieldSelectorProps = {
  goal: Extract<ProgressionGoal, { kind: 'linear' }>;
  fields: ProgressionDraftField[];
  onChange: (goal: ProgressionGoal) => void;
};

function FieldSelector({ goal, fields, onChange }: FieldSelectorProps) {
  const { t } = useTranslation();
  const choices = fieldChoices(fields);
  const selectedId = selectedFieldId(goal, fields);
  if (choices.length === 0) {
    return null;
  }
  return (
    <View className="gap-1.5">
      <Text className="t-caption text-muted">
        {t('setTypeEditor.progression.field')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {choices.map(field => (
          <Pressable
            key={field.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedId === field.id }}
            className={`min-h-9 justify-center rounded-full border px-3 ${
              selectedId === field.id
                ? 'border-accent bg-accent-soft'
                : 'border-border-soft bg-background'
            }`}
            onPress={() => onChange({ ...goal, fieldId: field.id })}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selectedId === field.id ? 'text-accent' : 'text-foreground'
              }`}
            >
              {field.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function incrementSuffix(
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
  fields: ProgressionDraftField[],
): string | undefined {
  const field = fields.find(item => item.id === selectedFieldId(goal, fields));
  if (!field) {
    return undefined;
  }
  const role = getSetFieldRole(field);
  if (role === 'weight') {
    return 'kg';
  }
  if (role === 'duration') {
    return 's';
  }
  return undefined;
}

export function ProgressionGoalDetails({
  goal,
  fields,
  onChange,
}: ProgressionGoalDetailsProps) {
  const { t } = useTranslation();
  if (goal.kind !== 'linear') {
    return null;
  }
  return (
    <View className="gap-3 rounded-[16px] bg-surface-card p-3">
      <FieldSelector goal={goal} fields={fields} onChange={onChange} />
      <ProgressionNumberInputRow
        label={t('setTypeEditor.progression.increase')}
        value={goal.increment}
        suffix={incrementSuffix(goal, fields)}
        onChange={increment => onChange({ ...goal, increment })}
      />
    </View>
  );
}
