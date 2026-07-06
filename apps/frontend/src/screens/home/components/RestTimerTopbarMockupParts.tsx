import { Text, View } from 'react-native';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

type TopbarCoreProps = {
  setTypeLabel: string;
  progressionLabel: string;
  inverted?: boolean;
};

type DoneMarkProps = {
  checked?: boolean;
  inverted?: boolean;
  square?: boolean;
};

type RestStateBoxProps = {
  restLabel: string;
  stateLabel: string;
  running?: boolean;
  compact?: boolean;
};

const restTextClass = {
  running: 'text-accent',
  idle: 'text-muted',
} as const;

export function DoneMark({
  checked = false,
  inverted = false,
  square = false,
}: DoneMarkProps) {
  return (
    <View
      className={`h-8 w-8 shrink-0 items-center justify-center ${
        square ? 'rounded-[10px]' : 'rounded-full'
      } ${
        checked
          ? 'bg-moss'
          : inverted
          ? 'border-2'
          : 'border-2 border-border-soft bg-background'
      }`}
      style={
        inverted && !checked
          ? { backgroundColor: colors.lineOnMoss, borderColor: colors.creamDim }
          : undefined
      }
    >
      {checked ? (
        <ClayIcon name="check" size={14} color={colors.cream} />
      ) : null}
    </View>
  );
}

export function SetNumber({ inverted = false }: { inverted?: boolean }) {
  return (
    <View
      className={`h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        inverted ? '' : 'bg-surface-sunk'
      }`}
      style={inverted ? { backgroundColor: colors.lineOnMoss } : undefined}
    >
      <Text
        className={`text-[12px] font-bold tabular-nums ${
          inverted ? 'text-cream' : 'text-muted'
        }`}
      >
        2
      </Text>
    </View>
  );
}

export function TopbarCore({
  setTypeLabel,
  progressionLabel,
  inverted = false,
}: TopbarCoreProps) {
  return (
    <View className="min-w-0 flex-1 flex-row items-center gap-2">
      <View
        className={`min-w-0 shrink flex-row items-center gap-1.5 ${
          inverted ? '' : 'rounded-[10px] bg-[rgba(191,92,76,0.12)] px-2 py-1'
        }`}
      >
        <ClayIcon
          name="dumbbell"
          size={14}
          color={inverted ? colors.cream : colors.danger}
        />
        <Text
          className={`min-w-0 shrink text-[13px] font-bold ${
            inverted ? 'text-cream' : 'text-danger'
          }`}
          numberOfLines={1}
        >
          {setTypeLabel}
        </Text>
      </View>
      <View
        className={`min-w-0 shrink flex-row items-center gap-1 ${
          inverted ? '' : 'border-l border-border-soft pl-2'
        }`}
      >
        <Text
          className={`min-w-0 shrink text-[11px] font-bold ${
            inverted ? '' : 'text-muted'
          }`}
          numberOfLines={1}
          style={inverted ? { color: colors.creamDim } : undefined}
        >
          {progressionLabel}
        </Text>
        <ClayIcon
          name="chevronDown"
          size={10}
          color={inverted ? colors.creamDim : colors.muted}
        />
      </View>
    </View>
  );
}

export function RestStateBox({
  restLabel,
  stateLabel,
  running = false,
  compact = false,
}: RestStateBoxProps) {
  const state = running ? 'running' : 'idle';
  const iconColor = running ? colors.accent : colors.muted;
  const activeClass = running
    ? 'border-accent bg-accent-soft'
    : 'border-border-soft bg-background';

  return (
    <View
      className={`shrink-0 justify-center rounded-[12px] border ${
        compact ? 'h-10 px-2' : 'h-11 px-2.5'
      } ${activeClass}`}
    >
      <View className="flex-row items-center gap-1.5">
        <ClayIcon name="rest" size={13} color={iconColor} />
        <Text
          className={`text-[13px] font-black tabular-nums ${restTextClass[state]}`}
        >
          {restLabel}
        </Text>
      </View>
      {compact ? null : (
        <View className="mt-0.5 flex-row items-center gap-1">
          <View
            className={`h-1.5 w-1.5 rounded-full ${
              running ? 'bg-accent' : 'bg-muted'
            }`}
          />
          <Text
            className={`text-[9px] font-bold uppercase tracking-[0.5px] ${restTextClass[state]}`}
          >
            {stateLabel}
          </Text>
        </View>
      )}
    </View>
  );
}
