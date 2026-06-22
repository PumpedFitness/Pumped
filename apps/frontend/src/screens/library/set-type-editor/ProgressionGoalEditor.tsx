import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  DEFAULT_LINEAR_INCREMENT,
  isProgressionGoalCompatible,
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

type GoalKind = ProgressionGoal['kind'];

type GoalOption = {
  kind: GoalKind;
  label: string;
  goal: ProgressionGoal;
};

type GoalOptionRowProps = {
  option: GoalOption;
  selected: boolean;
  onPress: () => void;
};

function GoalOptionRow({ option, selected, onPress }: GoalOptionRowProps) {
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
        {option.label}
      </Text>
    </Pressable>
  );
}

function goalOptions(t: TFunction): GoalOption[] {
  return [
    {
      kind: 'none',
      label: t('progression.goal.kind.none'),
      goal: { kind: 'none' },
    },
    {
      kind: 'linear',
      label: t('progression.goal.kind.linear'),
      goal: { kind: 'linear', increment: DEFAULT_LINEAR_INCREMENT },
    },
  ];
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
  const options = goalOptions(t).filter(option =>
    isProgressionGoalCompatible(option.goal, progressionFields),
  );
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
