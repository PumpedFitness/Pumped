import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

const BADGE_TONES = {
  accent: {
    surface: 'bg-accent-soft',
    text: 'text-accent',
  },
  neutral: {
    surface: 'bg-surface-sunk',
    text: 'text-muted',
  },
} as const;

type BadgeProps = {
  children: ReactNode;
  tone?: 'accent' | 'neutral';
  className?: string;
};

/**
 * ƒx-style micro pill — a compact status/label tag.
 * accent = text-accent on bg-accent-soft.
 */
export function Badge({
  children,
  tone = 'accent',
  className = '',
}: BadgeProps) {
  const t = BADGE_TONES[tone];
  return (
    <View
      className={`self-start rounded-full px-[6px] py-[4px] ${t.surface} ${className}`}
    >
      <Text
        className={`text-[10px] font-[700] leading-none tracking-[0.2px] ${t.text}`}
      >
        {children}
      </Text>
    </View>
  );
}

type DeltaChipProps = {
  value: string;
  suffix?: string;
  className?: string;
};

/**
 * Inline delta chip — a value with an optional muted suffix on a faint
 * ink-tinted surface. e.g. "+5" "kg".
 */
export function DeltaChip({
  value,
  suffix,
  className = '',
}: DeltaChipProps) {
  return (
    <View
      className={`flex-row items-center self-start rounded-full bg-[rgba(27,26,24,0.06)] px-[9px] py-[5px] ${className}`}
    >
      <Text className="text-[11px] font-[700] leading-none text-foreground">
        {value}
      </Text>
      {suffix ? (
        <Text className="ml-[3px] text-[11px] font-[700] leading-none text-muted">
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}

type PillProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
  testID?: string;
};

/**
 * Generic selectable pill button — a filter/toggle chip.
 * active = accent surface + light text; idle = idle bar surface + ink text.
 */
export function Pill({
  label,
  active = false,
  onPress,
  className = '',
  testID,
}: PillProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className={`h-[38px] items-center justify-center self-start rounded-full px-[18px] active:scale-[0.96] ${
        active
          ? 'bg-accent'
          : 'bg-bar-idle border border-border-hairline'
      } ${className}`}
    >
      <Text
        className={`text-[13px] font-[600] leading-none ${
          active ? 'text-on-ink' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
