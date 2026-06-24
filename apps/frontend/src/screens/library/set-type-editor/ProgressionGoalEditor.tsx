import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  isProgressionGoalCompatible,
  progressionGoalOptions,
  type ProgressionGoalOption,
} from '@/data/local/sets/progressionGoals';
import type { ProgressionGoal } from '@/types/setType';
import type { DraftField } from './draft';
import {
  ProgressionGoalDetails,
  type ProgressionDraftField,
  withDefaultProgressionFieldIds,
} from './ProgressionGoalDetails';

type ProgressionGoalEditorProps = {
  fields: DraftField[];
  value: ProgressionGoal;
  onChange: (goal: ProgressionGoal) => void;
};

type GoalOptionRowProps = {
  option: ProgressionGoalOption;
  selected: boolean;
  onPress: () => void;
};

function GoalOptionRow({ option, selected, onPress }: GoalOptionRowProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      className={`min-h-11 justify-center rounded-[14px] border px-3 ${
        selected
          ? 'border-accent bg-accent-soft'
          : 'border-border-soft bg-surface-card'
      }`}
      onPress={onPress}
    >
      <Text
        className={`t-label ${selected ? 'text-accent' : 'text-foreground'}`}
      >
        {t(option.labelKey)}
      </Text>
    </Pressable>
  );
}

export function ProgressionGoalEditor({
  fields,
  value,
  onChange,
}: ProgressionGoalEditorProps) {
  const { t } = useTranslation();
  const progressionFields: ProgressionDraftField[] = fields.map(field => ({
    ...field,
    id: field.id ?? field.key,
  }));
  const options = progressionGoalOptions(progressionFields);
  const selectedKind = isProgressionGoalCompatible(value, progressionFields)
    ? value.kind
    : 'none';
  const selectedGoal: ProgressionGoal =
    selectedKind === value.kind
      ? withDefaultProgressionFieldIds(value, progressionFields)
      : { kind: 'none' };

  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="t-eyebrow">
          {t('setTypeEditor.progression.label')}
        </Text>
        <Text className="t-caption text-muted">
          {t('setTypeEditor.progression.hint')}
        </Text>
      </View>

      <View className="gap-2">
        {options.map(option => (
          <GoalOptionRow
            key={option.kind}
            option={option}
            selected={selectedKind === option.kind}
            onPress={() =>
              onChange(
                withDefaultProgressionFieldIds(option.goal, progressionFields),
              )
            }
          />
        ))}
      </View>

      {options.length <= 1 ? (
        <Text className="t-caption text-muted">
          {t('setTypeEditor.progression.noFields')}
        </Text>
      ) : null}

      <ProgressionGoalDetails
        goal={selectedGoal}
        fields={progressionFields}
        onChange={onChange}
      />
    </View>
  );
}
