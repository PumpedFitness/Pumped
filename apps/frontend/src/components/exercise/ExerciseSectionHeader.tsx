import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';

export type ExerciseSectionState = 'active' | 'upcoming' | 'finished';

type ExerciseSectionTone = {
  fg: string;
  onTile: string;
};

type ExerciseSectionHeaderProps = {
  index: number;
  name: string;
  doneCount: number;
  totalCount: number;
  state: ExerciseSectionState;
  tone?: ExerciseSectionTone;
  onOpen?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  onRemove?: () => void;
  removeAccessibilityLabel?: string;
};

type ExerciseTitleProps = {
  name: string;
  color: string;
  onOpen?: () => void;
};

function ExerciseTitle({ name, color, onOpen }: ExerciseTitleProps) {
  if (!onOpen) {
    return (
      <Text
        className="t-heading flex-1"
        numberOfLines={1}
        style={{ color }}
      >
        {name}
      </Text>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      className="min-w-0 flex-1 flex-row items-center gap-1.5"
      onPress={onOpen}
    >
      <Text
        className="t-heading min-w-0 shrink"
        numberOfLines={1}
        style={{ color }}
      >
        {name}
      </Text>
    </Pressable>
  );
}

type ExerciseStatusProps = {
  doneCount: number;
  totalCount: number;
  isFinished: boolean;
  color: string;
};

function ExerciseStatus({
  doneCount,
  totalCount,
  isFinished,
  color,
}: ExerciseStatusProps) {
  const { t } = useTranslation();

  if (isFinished) {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-full bg-moss">
        <ClayIcon name="check" size={13} color={colors.cream} />
      </View>
    );
  }

  return (
    <Text
      className="text-[12.5px] font-semibold tabular-nums"
      style={{ color }}
    >
      {t('currentWorkout.setsDoneShort', {
        done: doneCount,
        total: totalCount,
      })}
    </Text>
  );
}

type ExerciseActionProps = {
  isActive: boolean;
  tone: ExerciseSectionTone;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  onRemove?: () => void;
  removeAccessibilityLabel?: string;
};

function ExerciseAction({
  isActive,
  tone,
  isCollapsed,
  onToggleCollapsed,
  onRemove,
  removeAccessibilityLabel,
}: ExerciseActionProps) {
  const iconColor = isActive ? tone.onTile : colors.muted;

  if (onRemove) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={removeAccessibilityLabel}
        className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-sunk"
        onPress={onRemove}
      >
        <ClayIcon name="trash" size={16} color={iconColor} />
      </Pressable>
    );
  }

  if (!onToggleCollapsed) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-sunk"
      onPress={onToggleCollapsed}
    >
      <ClayIcon
        name={isCollapsed ? 'chevron' : 'chevronDown'}
        size={17}
        color={iconColor}
      />
    </Pressable>
  );
}

export function ExerciseSectionHeader({
  index,
  name,
  doneCount,
  totalCount,
  state,
  tone = { fg: colors.sage, onTile: colors.cream },
  onOpen,
  isCollapsed,
  onToggleCollapsed,
  onRemove,
  removeAccessibilityLabel,
}: ExerciseSectionHeaderProps) {
  const isActive = state === 'active';
  const isFinished = state === 'finished';
  const titleColor = isActive ? tone.onTile : colors.muted;
  const metaColor = isActive ? tone.onTile : colors.muted;
  const content = (
    <View
      className="flex-row items-center gap-2.5 px-4 py-2.5"
      style={{
        backgroundColor: isActive ? tone.fg : colors.cardSunk,
        borderBottomWidth: 2,
        borderBottomColor: isActive
          ? tone.fg
          : colors.line,
      }}
    >
      <View
        className="h-6 min-w-6 items-center justify-center rounded-full px-1.5"
        style={{ backgroundColor: isActive ? tone.onTile : colors.muted }}
      >
        <Text
          className="text-[11px] font-bold tabular-nums"
          style={{ color: isActive ? tone.fg : colors.cream }}
        >
          {index + 1}
        </Text>
      </View>

      <ExerciseTitle name={name} color={titleColor} onOpen={onOpen} />
      {!isFinished ? (
        <ExerciseStatus
          doneCount={doneCount}
          totalCount={totalCount}
          isFinished={isFinished}
          color={metaColor}
        />
      ) : null}
      <ExerciseAction
        isActive={isActive}
        tone={tone}
        isCollapsed={isCollapsed}
        onToggleCollapsed={onToggleCollapsed}
        onRemove={onRemove}
        removeAccessibilityLabel={removeAccessibilityLabel}
      />
    </View>
  );

  return content;
}
